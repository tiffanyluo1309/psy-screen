import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Send, ArrowLeft, Loader2 } from 'lucide-react'
import ChatBubble from '../components/ChatBubble'
import type { ChatMessage } from '../types'
import { conversationAPI } from '../lib/api'

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
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    const loadingMessageId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ])

    try {
      let accumulatedContent = ''
      await conversationAPI(messages.concat([userMessage]), (chunk) => {
        accumulatedContent += chunk
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessageId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        )
      })

      setCurrentStep((prev) => prev + 1)
    } catch (error) {
      console.error('API call failed:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? { ...msg, content: '抱歉，网络连接出现问题，请稍后再试。' }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
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
    navigate('/report', { state: { messages } })
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
                style={{ width: `${Math.min((currentStep / 9) * 100, 100)}%` }}
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
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
          )}
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
              disabled={isLoading}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 leading-relaxed ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              rows={2}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-xl transition-all duration-200 ${
              inputValue.trim() && !isLoading
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}

export default ChatPage
