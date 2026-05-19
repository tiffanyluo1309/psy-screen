import type { ScoreResult, PHQ9Score } from '../types'

export function parseScores(jsonString: string): ScoreResult {
  try {
    const parsed = JSON.parse(jsonString) as ScoreResult
    
    const validScore = (s: unknown): number => {
      const num = typeof s === 'number' ? s : 0
      return Math.max(0, Math.min(3, num))
    }

    const validScores = {
      Q1: { score: validScore(parsed.scores?.Q1?.score), reason: String(parsed.scores?.Q1?.reason || '') },
      Q2: { score: validScore(parsed.scores?.Q2?.score), reason: String(parsed.scores?.Q2?.reason || '') },
      Q3: { score: validScore(parsed.scores?.Q3?.score), reason: String(parsed.scores?.Q3?.reason || '') },
      Q4: { score: validScore(parsed.scores?.Q4?.score), reason: String(parsed.scores?.Q4?.reason || '') },
      Q5: { score: validScore(parsed.scores?.Q5?.score), reason: String(parsed.scores?.Q5?.reason || '') },
      Q6: { score: validScore(parsed.scores?.Q6?.score), reason: String(parsed.scores?.Q6?.reason || '') },
      Q7: { score: validScore(parsed.scores?.Q7?.score), reason: String(parsed.scores?.Q7?.reason || '') },
      Q8: { score: validScore(parsed.scores?.Q8?.score), reason: String(parsed.scores?.Q8?.reason || '') },
      Q9: { score: validScore(parsed.scores?.Q9?.score), reason: String(parsed.scores?.Q9?.reason || '') },
    }

    const total = Object.values(validScores).reduce((sum, s) => sum + s.score, 0)
    const q9Flagged = validScores.Q9.score > 0

    return {
      scores: validScores,
      total,
      risk_level: calcRiskLevel(total, validScores.Q9.score),
      q9_flagged: q9Flagged,
    }
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

export function calcRiskLevel(total: number, q9Score: number): string {
  if (q9Score > 0) return 'high'
  if (total >= 15) return 'high'
  if (total >= 10) return 'moderate'
  if (total >= 5) return 'mild'
  return 'low'
}

export function getRiskLabel(level: string): string {
  const labels: Record<string, string> = {
    'low': '状态稳定',
    'mild': '有些疲惫',
    'moderate': '压力较大',
    'high': '需要关注',
  }
  return labels[level] || '状态稳定'
}

export function getRiskColor(level: string): { bg: string; text: string; border?: string } {
  const colors: Record<string, { bg: string; text: string; border?: string }> = {
    'low': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    'mild': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    'moderate': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    'high': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  }
  return colors[level] || colors['low']
}

export function convertToPHQ9Score(scores: ScoreResult['scores']): PHQ9Score {
  return {
    q1: scores.Q1.score,
    q2: scores.Q2.score,
    q3: scores.Q3.score,
    q4: scores.Q4.score,
    q5: scores.Q5.score,
    q6: scores.Q6.score,
    q7: scores.Q7.score,
    q8: scores.Q8.score,
    q9: scores.Q9.score,
  }
}

export function getHighScoreItems(score: PHQ9Score): string[] {
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
