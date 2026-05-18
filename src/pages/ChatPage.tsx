import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft } from 'lucide-react'
import ChatBubble from '../components/ChatBubble'
import { useState } from 'react'

function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant' as const,
      content: '你好！我是你的AI心理助手。接下来我会问你一些关于最近心情的问题，帮助你了解自己的心理状态。我们开始吧？',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue('')

    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: '这是一个示例回复。在实际应用中，这里会调用DeepSeek API获取真实回复。',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, reply])
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <h1 className="font-medium text-gray-800">PHQ-9评估</h1>
        <button
          onClick={handleFinish}
          className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
        >
          结束评估
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的回答..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              rows={2}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-indigo-500 text-white p-3 rounded-xl hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  )
}

export default ChatPage
