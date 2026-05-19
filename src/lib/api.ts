import { OpenAI } from 'openai'
import type { ChatMessage, OpenAIMessage, ScoreResult } from '../types'
import { CONVERSATION_PROMPT, SCORING_PROMPT } from './prompts'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const USE_MOCK_DATA = true

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: true,
})

const phq9Items = [
  {
    question: '谢谢你的坦诚分享。在过去的两周里，有没有哪几天你感觉做事情提不起劲，或者对以前喜欢的活动兴趣减少了？',
    followUps: [
      '你提到现在不太有兴趣做事，是指以前喜欢的事（比如打游戏/运动/跟朋友玩），还是对什么事都提不起劲？',
      '这种感觉大概从什么时候开始的？是某件事之后，还是慢慢就这样了？',
      '这种提不起劲的感觉，大概一周里有几天会出现？',
    ],
  },
  {
    question: '我理解你的感受。最近两周心情怎么样？有没有感到低落、心里空空的，或者觉得事情不会变好了的时候？',
    followUps: [
      '你说的低落是一种什么感觉？是难过、心里空空的，还是觉得事情不会变好了？',
      '能说说是什么让你有这种感觉吗？是有什么事情发生了，还是说不清楚原因？',
      '有没有觉得事情不会变好、或者未来会很暗淡的时候？',
    ],
  },
  {
    question: '感谢你的分享。我们继续聊下一个话题，最近你的睡眠情况怎么样？',
    followUps: [
      '你是入睡困难、容易醒来，还是睡得特别多但还是很累？',
      '躺下来睡不着的时候，脑子里会想什么？',
      '大概一周有几天会这样？对你第二天的状态影响大吗？',
    ],
  },
  {
    question: '好的，我了解了。在过去的两周里，是否经常感觉疲倦或者精力不足？',
    followUps: [
      '这种累是身体上的疲惫，还是那种什么都不想动、没有动力的感觉？',
      '有没有想做什么但感觉使不上劲、提不起劲去做的时候？能举个例子吗？',
      '这和你平时的状态比，差别大吗？大概从什么时候开始的？',
    ],
  },
  {
    question: '明白了。最近你的食欲有什么变化吗？',
    followUps: [
      '是吃得少了还是多了？有没有不饿但强迫自己吃，或者很饿停不下来的情况？',
      '吃东西对你来说还有享受感吗，还是变成了一件没什么感觉的事？',
      '最近一段时间体重有没有变化？',
    ],
  },
  {
    question: '谢谢你告诉我这些。你对自己的评价怎么样？有没有觉得自己不够好或者感到内疚？',
    followUps: [
      '你说的「觉得自己很糟」，是在某件具体事上，还是整体上觉得自己不够好？',
      '能说说是什么让你有这种感觉吗？是发生了什么事，还是这种感觉一直都有？',
      '这种觉得自己不好的感觉，对你平时的状态影响大吗？',
    ],
  },
  {
    question: '我明白。最近你在集中注意力或者做决定方面有没有遇到困难？',
    followUps: [
      '是注意力很难集中，还是思维感觉变慢了、或者很难做决定？',
      '上课或者学习的时候有影响吗？具体是什么感觉？',
      '这跟你平时的状态比，有多大差别？大概从什么时候开始的？',
    ],
  },
  {
    question: '谢谢你的分享。你有没有觉得自己行动或说话变慢了，或者相反，感到烦躁不安、坐立不安？',
    followUps: [
      '是感觉自己动作变慢、反应变慢，还是更多是那种坐不住、烦躁的感觉？',
      '有没有朋友或家人说你最近状态不太对，或者看起来和以前不一样？',
      '这种感觉是一直有，还是在某些时候特别明显？',
    ],
  },
  {
    question: '最后，有时候人在很难受的时候会有一些想法，比如希望一切都消失，或者觉得不想存在了。你有没有这样的时候？',
    followUps: [
      '这种想法会具体到想用什么方式，或者想好什么时候吗？',
      '有这样的想法的时候，你身边有可以说话的人吗？',
    ],
  },
]

const openingMessage = '你好，我是你的心理健康助手。接下来我们会聊一些关于你最近状态的问题，没有对错之分，放轻松就好。准备好了吗？'
const closingMessage = '谢谢你愿意分享这些，我已经整理好了，稍等一下。'

const FEEDBACK_PROMPT = `你是一个心理健康反馈助手。根据以下对话记录和各条目得分，生成个性化的反馈信息。

对话记录：
{conversation}

各条目得分：
{scores}

请生成两段反馈，每段不超过80字：

1. 可能的原因（假设性语气，锚定对话中的具体内容；如果信息不足则输出兜底语：「从我们的对话中，我没有获得足够的背景信息来分析具体原因，但你的感受是真实的。」）

2. 可落地建议（根据风险等级，低/轻度：自助建议；中度：加上社交支持和校内资源；高度：加上专业转介和危机热线）

只输出JSON格式，不要任何解释，格式如下：
{"cause":"原因描述","suggestion":"建议描述"}`

export async function conversationAPI(
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<void> {
  if (USE_MOCK_DATA) {
    const userMessages = messages.filter(m => m.role === 'user')
    const assistantMessages = messages.filter(m => m.role === 'assistant')

    const lastAssistantMsg = assistantMessages[assistantMessages.length - 1]
    const needsFollowUp = lastAssistantMsg &&
      !lastAssistantMsg.content.includes('准备好了吗') &&
      !lastAssistantMsg.content.includes('谢谢你愿意分享')

    let reply: string

    if (assistantMessages.length === 0) {
      reply = openingMessage
    } else if (userMessages.length === 1 && assistantMessages.length === 1) {
      reply = phq9Items[0].question
    } else if (needsFollowUp && shouldTriggerFollowUp(messages)) {
      const currentItemIndex = getCurrentItemIndex(messages)
      if (currentItemIndex >= 0 && currentItemIndex < phq9Items.length) {
        const followUpIndex = getFollowUpCount(messages)
        if (followUpIndex < phq9Items[currentItemIndex].followUps.length) {
          reply = phq9Items[currentItemIndex].followUps[followUpIndex]
        } else {
          reply = getNextQuestion(messages)
        }
      } else {
        reply = getNextQuestion(messages)
      }
    } else {
      reply = getNextQuestion(messages)
    }

    for (let i = 0; i < reply.length; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 50))
      onChunk(reply.slice(i, Math.min(i + 2, reply.length)))
    }
    return
  }

  const openaiMessages: OpenAIMessage[] = [
    { role: 'system', content: CONVERSATION_PROMPT },
    ...messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
    })),
  ]

  const stream = await client.chat.completions.create({
    model: 'deepseek-v4-flash',
    messages: openaiMessages,
    stream: true,
    temperature: 0.7,
    max_tokens: 1000,
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || ''
    if (text) {
      onChunk(text)
    }
  }
}

function shouldTriggerFollowUp(messages: ChatMessage[]): boolean {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()
  if (!lastUserMsg) return false

  const content = lastUserMsg.content.trim()
  const shortAnswers = ['还好', '一般', '有时候吧', '还行', '差不多', '就这样']

  if (shortAnswers.includes(content)) return true
  if (content.length < 10) return true

  const vaguePatterns = /(有点|一些|还好|一般|偶尔|有时候)/
  if (vaguePatterns.test(content)) return true

  return false
}

function getCurrentItemIndex(messages: ChatMessage[]): number {
  const assistantMessages = messages.filter(m => m.role === 'assistant')
  if (assistantMessages.length <= 1) return 0

  let itemCount = 0
  let inFollowUp = false

  for (let i = 1; i < assistantMessages.length; i++) {
    const msg = assistantMessages[i]
    if (inFollowUp) {
      const isFollowUp = phq9Items.some((item, idx) =>
        idx < itemCount && item.followUps.some(f => f === msg.content)
      )
      if (!isFollowUp) {
        inFollowUp = false
        itemCount++
      }
    } else {
      itemCount++
      const nextUserMsg = messages.find(m =>
        m.timestamp > msg.timestamp && m.role === 'user'
      )
      if (nextUserMsg && shouldTriggerFollowUp([msg, nextUserMsg])) {
        inFollowUp = true
      }
    }
  }

  return Math.min(itemCount, phq9Items.length - 1)
}

function getFollowUpCount(messages: ChatMessage[]): number {
  const assistantMessages = messages.filter(m => m.role === 'assistant')
  if (assistantMessages.length <= 1) return 0

  const lastAssistantMsg = assistantMessages[assistantMessages.length - 1]
  const currentItemIndex = getCurrentItemIndex(messages)

  if (currentItemIndex >= 0 && currentItemIndex < phq9Items.length) {
    const item = phq9Items[currentItemIndex]
    if (item.followUps.includes(lastAssistantMsg.content)) {
      return item.followUps.indexOf(lastAssistantMsg.content) + 1
    }
  }

  return 0
}

function getNextQuestion(messages: ChatMessage[]): string {
  const assistantMessages = messages.filter(m => m.role === 'assistant')

  let completedItems = 0
  let inFollowUp = false

  for (let i = 1; i < assistantMessages.length; i++) {
    if (inFollowUp) {
      const currentItemIndex = completedItems
      if (currentItemIndex < phq9Items.length) {
        const isFollowUp = phq9Items[currentItemIndex].followUps.includes(assistantMessages[i].content)
        if (!isFollowUp) {
          inFollowUp = false
          completedItems++
        }
      } else {
        completedItems++
      }
    } else {
      completedItems++
      if (i < assistantMessages.length - 1) {
        const nextMsg = assistantMessages[i + 1]
        const currentItemIndex = completedItems - 1
        if (currentItemIndex < phq9Items.length) {
          if (phq9Items[currentItemIndex].followUps.includes(nextMsg.content)) {
            inFollowUp = true
          }
        }
      }
    }
  }

  if (completedItems < phq9Items.length) {
    return phq9Items[completedItems].question
  } else {
    return closingMessage
  }
}

export async function scoringAPI(conversationHistory: ChatMessage[]): Promise<ScoreResult> {
  if (USE_MOCK_DATA) {
    const userMessages = conversationHistory.filter(m => m.role === 'user')
    const mockScore = Math.min(userMessages.length * 2, 18)

    return {
      scores: {
        Q1: { score: Math.min(Math.floor(Math.random() * 2), 3), reason: '根据用户回答评估' },
        Q2: { score: Math.min(Math.floor(Math.random() * 2), 3), reason: '根据用户回答评估' },
        Q3: { score: Math.min(Math.floor(Math.random() * 2), 3), reason: '根据用户回答评估' },
        Q4: { score: Math.min(Math.floor(Math.random() * 2), 3), reason: '根据用户回答评估' },
        Q5: { score: Math.min(Math.floor(Math.random() * 2), 3), reason: '根据用户回答评估' },
        Q6: { score: Math.min(Math.floor(Math.random() * 2), 3), reason: '根据用户回答评估' },
        Q7: { score: Math.min(Math.floor(Math.random() * 2), 3), reason: '根据用户回答评估' },
        Q8: { score: Math.min(Math.floor(Math.random() * 2), 3), reason: '根据用户回答评估' },
        Q9: { score: 0, reason: '用户未提及相关内容' },
      },
      total: mockScore,
      risk_level: mockScore >= 15 ? 'high' : mockScore >= 10 ? 'moderate' : mockScore >= 5 ? 'mild' : 'low',
      q9_flagged: false,
    }
  }

  const conversationText = conversationHistory
    .map((msg) => `${msg.role === 'user' ? '用户' : '助手'}: ${msg.content}`)
    .join('\n\n')

  const openaiMessages: OpenAIMessage[] = [
    { role: 'system', content: SCORING_PROMPT },
    { role: 'user', content: conversationText },
  ]

  const response = await client.chat.completions.create({
    model: 'deepseek-v4-flash',
    messages: openaiMessages,
    stream: false,
    temperature: 0.1,
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content || '{}'

  try {
    return JSON.parse(content) as ScoreResult
  } catch {
    return {
      scores: {
        Q1: { score: 0, reason: '' },
        Q2: { score: 0, reason: '' },
        Q3: { score: 0, reason: '' },
        Q4: { score: 0, reason: '' },
        Q5: { score: 0, reason: '' },
        Q6: { score: 0, reason: '' },
        Q7: { score: 0, reason: '' },
        Q8: { score: 0, reason: '' },
        Q9: { score: 0, reason: '' },
      },
      total: 0,
      risk_level: 'low',
      q9_flagged: false,
    }
  }
}

export interface FeedbackResult {
  cause: string
  suggestion: string
}

export async function feedbackAPI(
  conversationHistory: ChatMessage[],
  scores: ScoreResult['scores'],
  riskLevel: string
): Promise<FeedbackResult> {
  if (USE_MOCK_DATA) {
    const causeByRisk: Record<string, string> = {
      low: '从对话中看，你最近的整体状态相对稳定，没有出现明显的情绪波动。',
      mild: '你最近可能面临一些轻微的压力源，导致情绪有些起伏，但整体可控。',
      moderate: '从对话中能感受到你正在承受一定的压力，这些压力可能来自多个方面。',
      high: '你目前承受的压力较大，情绪波动明显，建议认真对待并寻求专业支持。',
    }

    const suggestionByRisk: Record<string, string> = {
      low: '继续保持规律作息和适度运动，这些好习惯有助于维持良好的心理状态。',
      mild: '建议尝试深呼吸放松练习，保持与朋友家人的交流，必要时可寻求心理咨询。',
      moderate: '建议积极寻求支持，与信任的人交流你的感受，同时考虑预约校内心理咨询。',
      high: '请务必寻求专业帮助，可以先联系学校心理咨询中心，或拨打心理援助热线。',
    }

    return {
      cause: causeByRisk[riskLevel] || causeByRisk.low,
      suggestion: suggestionByRisk[riskLevel] || suggestionByRisk.low,
    }
  }

  const conversationText = conversationHistory
    .map((msg) => `${msg.role === 'user' ? '用户' : '助手'}: ${msg.content}`)
    .join('\n\n')

  const scoresText = Object.entries(scores)
    .map(([q, data]) => `${q}: ${data.score}分`)
    .join(', ')

  const prompt = FEEDBACK_PROMPT
    .replace('{conversation}', conversationText)
    .replace('{scores}', scoresText)

  const openaiMessages: OpenAIMessage[] = [
    { role: 'system', content: prompt },
  ]

  const response = await client.chat.completions.create({
    model: 'deepseek-v4-flash',
    messages: openaiMessages,
    stream: false,
    temperature: 0.7,
    max_tokens: 500,
  })

  const content = response.choices[0]?.message?.content || '{"cause":"","suggestion":""}'

  try {
    return JSON.parse(content) as FeedbackResult
  } catch {
    return {
      cause: '从我们的对话中，我没有获得足够的背景信息来分析具体原因，但你的感受是真实的。',
      suggestion: '建议保持关注自己的情绪状态，如有需要可寻求专业帮助。',
    }
  }
}
