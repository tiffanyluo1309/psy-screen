import { User, Bot } from 'lucide-react'
import type { ChatMessage } from '../types'

interface ChatBubbleProps {
  message: ChatMessage
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-indigo-100' : 'bg-gray-100'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-indigo-600" />
        ) : (
          <Bot className="w-5 h-5 text-gray-600" />
        )}
      </div>
      <div
        className={`max-w-xs md:max-w-md ${
          isUser ? 'text-right' : 'text-left'
        }`}
      >
        <div
          className={`inline-block px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-indigo-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div
          className={`text-xs text-gray-400 mt-1 ${
            isUser ? 'mr-2' : 'ml-2'
          }`}
        >
          {message.timestamp.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}

export default ChatBubble
