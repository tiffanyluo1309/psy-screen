export type RiskLevel = 'low' | 'mild' | 'moderate' | 'high'

export interface PHQ9Score {
  q1: number // 做事提不起劲或乐趣减少
  q2: number // 心情低落、抑郁或绝望
  q3: number // 入睡困难、易醒或睡眠过多
  q4: number // 感觉疲倦或精力不足
  q5: number // 食欲不振或暴饮暴食
  q6: number // 自我评价过低或有罪恶感
  q7: number // 难以集中注意力或犹豫不决
  q8: number // 行动或说话缓慢，或烦躁不安、坐立不安
  q9: number // 有过死亡念头或自杀想法
}

export interface ScoreResult {
  scores: {
    Q1: { score: number; reason: string }
    Q2: { score: number; reason: string }
    Q3: { score: number; reason: string }
    Q4: { score: number; reason: string }
    Q5: { score: number; reason: string }
    Q6: { score: number; reason: string }
    Q7: { score: number; reason: string }
    Q8: { score: number; reason: string }
    Q9: { score: number; reason: string }
  }
  total: number
  risk_level: string
  q9_flagged: boolean
}

export interface Report {
  totalScore: number
  riskLevel: RiskLevel
  riskLevelText: string
  analysis: string
  possibleCauses: string
  suggestions: string[]
  highScoreItems: string[]
  hasSuicideRisk: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
