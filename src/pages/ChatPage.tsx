import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import ChatBubble from '../components/ChatBubble'
import type { ChatMessage } from '../types'

function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好，我是你的心理健康助手。接下来我们会聊一些关于你最近状态的问题，没有对错之分，放轻松就好。准备好了吗？',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const mockReplies = [
    '谢谢你的坦诚分享。接下来想了解一下，在过去的两周里，有没有哪几天你感觉做事情提不起劲，或者对以前喜欢的活动兴趣减少了？',
    '我理解你的感受。接下来想问问你，最近两周心情怎么样？有没有感到低落或者抑郁的时候？',
    '感谢你的分享。我们继续聊下一个话题，最近你的睡眠情况怎么样？有没有入睡困难或者容易醒来的情况？',
    '好的，我了解了。接下来想问问你，在过去的两周里，是否经常感觉疲倦或者精力不足？',
    '明白了。接下来我们来看，最近你的食欲有什么变化吗？有没有食欲不振或者暴饮暴食的情况？',
    '谢谢你告诉我这些。接下来我们谈谈，你对自己的评价怎么样？有没有觉得自己不够好或者感到内疚？',
    '我明白。下一个问题是关于注意力的，最近你在集中注意力或者做决定方面有没有遇到困难？',
    '谢谢你的分享。最后一个问题，你有没有觉得自己行动或说话变慢了，或者相反，感到烦躁不安、坐立不安？',
    '感谢你完成这次评估！我正在整理你的反馈，请稍等片刻...',
  ]

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    setTimeout(() => {
      const replyIndex = Math.min(currentStep - 1, mockReplies.length - 1)
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockReplies[replyIndex],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, reply])
      setCurrentStep((prev) => prev + 1)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleFinish = () => {
    navigate('/report')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/50 to-emerald-50/50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>
            <button
              onClick={handleFinish}
              className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors text-sm"
            >
              结束评估
            </button>
          </div>
          <div className="text-center">
            <h1 className="font-medium text-gray-800">正在进行 PHQ-9 筛查</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-emerald-600 font-semibold text-lg">
                {currentStep}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-500">9</span>
              <span className="text-gray-400 text-sm ml-2">条目</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 9) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-5">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入你的回答..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 leading-relaxed"
              rows={2}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`p-3 rounded-xl transition-all duration-200 ${
              inputValue.trim()
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  )
}

export default ChatPage
