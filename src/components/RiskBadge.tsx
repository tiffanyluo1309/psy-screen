import type { RiskLevel } from '../types'

interface RiskBadgeProps {
  riskLevel: RiskLevel
}

function RiskBadge({ riskLevel }: RiskBadgeProps) {
  const config: Record<RiskLevel, { text: string; bg: string; textColor: string }> = {
    normal: { text: '状态稳定', bg: 'bg-green-100', textColor: 'text-green-700' },
    mild: { text: '有些疲惫', bg: 'bg-blue-100', textColor: 'text-blue-700' },
    moderate: { text: '压力较大', bg: 'bg-amber-100', textColor: 'text-amber-700' },
    severe: { text: '需要关注', bg: 'bg-red-100', textColor: 'text-red-700' },
  }

  const { text, bg, textColor } = config[riskLevel]

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${bg} ${textColor}`}>
      {text}
    </span>
  )
}

export default RiskBadge
