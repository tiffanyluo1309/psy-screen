import type { PHQ9Score, RiskLevel } from '../types'

export function calculateRiskLevel(totalScore: number): RiskLevel {
  if (totalScore >= 15) return 'severe'
  if (totalScore >= 10) return 'moderate'
  if (totalScore >= 5) return 'mild'
  return 'normal'
}

export function getRiskLevelText(riskLevel: RiskLevel): string {
  const texts: Record<RiskLevel, string> = {
    normal: '状态稳定',
    mild: '有些疲惫',
    moderate: '压力较大',
    severe: '需要关注',
  }
  return texts[riskLevel]
}

export function calculateTotalScore(score: PHQ9Score): number {
  return Object.values(score).reduce((sum, val) => sum + val, 0)
}

export function getDefaultSuggestions(riskLevel: RiskLevel): string[] {
  const baseSuggestions = [
    '尝试进行深呼吸练习，每天10分钟',
    '保持规律的作息，保证充足睡眠',
    '适当进行运动，如散步、慢跑等',
  ]

  switch (riskLevel) {
    case 'normal':
      return baseSuggestions
    case 'mild':
      return [...baseSuggestions, '尝试写日记记录自己的情绪变化']
    case 'moderate':
      return [
        ...baseSuggestions,
        '与信任的朋友或家人聊聊你的感受',
        '可以考虑预约学校心理咨询',
      ]
    case 'severe':
      return [
        ...baseSuggestions,
        '请立即联系学校心理咨询中心',
        '如有需要，可拨打心理援助热线：400-161-9995',
        '建议尽快寻求专业医疗帮助',
      ]
  }
}
