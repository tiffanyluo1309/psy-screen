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
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
          isUser ? 'bg-emerald-100' : 'bg-slate-100'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-emerald-600" />
        ) : (
          <Bot className="w-5 h-5 text-slate-500" />
        )}
      </div>
      <div
        className={`max-w-xs md:max-w-lg ${
          isUser ? 'text-right' : 'text-left'
        }`}
      >
        <div
          className={`inline-block px-5 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-md'
              : 'bg-white text-gray-700 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-loose">{message.content}</p>
        </div>
        <div
          className={`text-xs text-gray-400 mt-1.5 ${
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
