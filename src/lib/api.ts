import type { PHQ9Score, Report, ChatMessage } from '../types'

const API_KEY = (import.meta.env as ImportMetaEnv).VITE_DEEPSEEK_API_KEY || ''
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function sendMessage(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function calculateScore(messages: ChatMessage[]): Promise<PHQ9Score> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `
            你是一个专业的PHQ-9评分助手。请根据用户与AI助手的对话内容，为PHQ-9的9个条目进行评分。
            
            PHQ-9评分标准（0-3分）：
            0 = 完全没有
            1 = 几天
            2 = 一半以上的天数
            3 = 几乎每天
            
            条目：
            Q1：做事提不起劲或乐趣减少
            Q2：心情低落、抑郁或绝望
            Q3：入睡困难、易醒或睡眠过多
            Q4：感觉疲倦或精力不足
            Q5：食欲不振或暴饮暴食
            Q6：自我评价过低或有罪恶感
            Q7：难以集中注意力或犹豫不决
            Q8：行动或说话缓慢，或烦躁不安、坐立不安
            Q9：有过死亡念头或自杀想法
            
            请输出JSON格式：
            {"q1": 0, "q2": 0, "q3": 0, "q4": 0, "q5": 0, "q6": 0, "q7": 0, "q8": 0, "q9": 0}
          `.trim(),
        },
        {
          role: 'user',
          content: JSON.stringify(messages),
        },
      ],
      max_tokens: 200,
      temperature: 0.1,
    }),
  })

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  
  try {
    return JSON.parse(content) as PHQ9Score
  } catch {
    return {
      q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0,
    }
  }
}

export async function generateReport(score: PHQ9Score, messages: ChatMessage[]): Promise<Report> {
  const totalScore = Object.values(score).reduce((sum, val) => sum + val, 0)
  
  let riskLevel: Report['riskLevel'] = 'normal'
  let riskLevelText = '状态稳定'
  
  if (totalScore >= 15) {
    riskLevel = 'severe'
    riskLevelText = '需要关注'
  } else if (totalScore >= 10) {
    riskLevel = 'moderate'
    riskLevelText = '压力较大'
  } else if (totalScore >= 5) {
    riskLevel = 'mild'
    riskLevelText = '有些疲惫'
  }

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `
            你是一个专业的心理健康报告生成助手。请根据PHQ-9评分和对话内容，生成一份温和、非评判的学生报告。
            
            报告要求：
            1. 分析部分：根据高分条目描述用户的状态，使用温和语言
            2. 可能原因：基于对话内容进行个性化归因，若无足够信息则使用兜底表述
            3. 建议：根据风险等级提供可落地的建议
            
            风险等级：${riskLevelText}（总分：${totalScore}）
            
            评分详情：${JSON.stringify(score)}
            
            请输出JSON格式：
            {"analysis": "...", "possibleCauses": "...", "suggestions": ["建议1", "建议2", "..."]}
          `.trim(),
        },
        {
          role: 'user',
          content: JSON.stringify(messages),
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  
  try {
    const result = JSON.parse(content) as { analysis: string; possibleCauses: string; suggestions: string[] }
    const highScoreItems = getHighScoreItems(score)
    
    return {
      totalScore,
      riskLevel,
      riskLevelText,
      analysis: result.analysis,
      possibleCauses: result.possibleCauses,
      suggestions: result.suggestions,
      highScoreItems,
      hasSuicideRisk: score.q9 > 0,
    }
  } catch {
    return {
      totalScore,
      riskLevel,
      riskLevelText,
      analysis: '根据你的回答，我们了解到你最近的心理状态。',
      possibleCauses: '这些感受可能与近期的生活变化或压力有关。',
      suggestions: ['建议你关注自己的情绪变化', '如有需要可以寻求帮助'],
      highScoreItems: getHighScoreItems(score),
      hasSuicideRisk: score.q9 > 0,
    }
  }
}

function getHighScoreItems(score: PHQ9Score): string[] {
  const items: Record<string, string> = {
    q1: '做事提不起劲或乐趣减少',
    q2: '心情低落、抑郁或绝望',
    q3: '入睡困难、易醒或睡眠过多',
    q4: '感觉疲倦或精力不足',
    q5: '食欲不振或暴饮暴食',
    q6: '自我评价过低或有罪恶感',
    q7: '难以集中注意力或犹豫不决',
    q8: '行动或说话缓慢，或烦躁不安',
    q9: '有过死亡念头或自杀想法',
  }
  
  return Object.entries(score)
    .filter(([, value]) => value >= 2)
    .map(([key]) => items[key])
}
