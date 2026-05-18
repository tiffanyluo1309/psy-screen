import type { ReactNode } from 'react'

interface ReportCardProps {
  icon: ReactNode
  title: string
  content: ReactNode
}

function ReportCard({ icon, title, content }: ReportCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="text-gray-600 text-sm leading-relaxed">{content}</div>
    </div>
  )
}

export default ReportCard
