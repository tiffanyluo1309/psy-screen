import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Heart, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import RiskBadge from '../components/RiskBadge'
import type { ChatMessage, RiskLevel } from '../types'
import { scoringAPI, feedbackAPI, FeedbackResult } from '../lib/api'
import type { ScoreResult } from '../types'

const qLabels: Record<string, string> = {
  Q1: '兴趣',
  Q2: '情绪',
  Q3: '睡眠',
  Q4: '精力',
  Q5: '食欲',
  Q6: '自我评价',
  Q7: '注意力',
  Q8: '行为',
  Q9: '自杀意念',
}

const highScoreDescriptions: Record<string, string> = {
  Q1: '你提到最近对以前喜欢的事情提不起劲……',
  Q2: '你提到最近有一些情绪低落的时候……',
  Q3: '你提到最近睡眠受到了一些影响……',
  Q4: '你提到最近感到比较疲惫……',
  Q5: '你提到最近食欲有些变化……',
  Q6: '你提到最近对自己有一些负面的感受……',
  Q7: '你提到最近注意力有些难以集中……',
  Q8: '你提到最近身体状态有些变化……',
  Q9: '你提到最近有一些比较沉重的想法……',
}

const riskDescriptions: Record<string, { label: string; desc: string }> = {
  low: { label: '状态稳定', desc: '情绪状态良好，目前没有需要特别关注的信号。' },
  mild: { label: '有些疲惫', desc: '最近情绪有些起伏，可能需要更多关注自己的状态。' },
  moderate: { label: '压力较大', desc: '你在承受比较大的心理压力，建议认真对待并寻求支持。' },
  high: { label: '需要关注', desc: '你目前的状态需要专业的支持和帮助，请不要一个人扛着。' },
}

function ReportPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [highScoreItems, setHighScoreItems] = useState<string[]>([])

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const messages = location.state?.messages as ChatMessage[] | undefined

        if (!messages || messages.length === 0) {
          throw new Error('没有对话历史数据')
        }

        const score = await scoringAPI(messages)
        setScoreResult(score)

        const highItems = Object.entries(score.scores)
          .filter(([_, data]) => data.score >= 2)
          .map(([q]) => q)
        setHighScoreItems(highItems)

        const fb = await feedbackAPI(messages, score.scores, score.risk_level)
        setFeedback(fb)
      } catch (error) {
        console.error('Failed to generate report:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [location.state])

  const handleRestart = () => {
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/50 to-emerald-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">正在生成报告...</p>
        </div>
      </div>
    )
  }

  if (!scoreResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/50 to-emerald-50/50 flex items-center justify-center">
        <p className="text-gray-500">无法生成报告，请重新进行筛查</p>
      </div>
    )
  }

  const radarData = Object.entries(scoreResult.scores).map(([key, data]) => ({
    subject: qLabels[key],
    score: data.score,
    fullMark: 3,
  }))

  const riskInfo = riskDescriptions[scoreResult.risk_level] || riskDescriptions.low

  const riskGradientClass =
    scoreResult.risk_level === 'high'
      ? 'from-red-500 to-rose-600'
      : scoreResult.risk_level === 'moderate'
      ? 'from-amber-500 to-orange-500'
      : scoreResult.risk_level === 'mild'
      ? 'from-blue-500 to-indigo-500'
      : 'from-emerald-500 to-teal-500'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/50 to-emerald-50/50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4 pb-20">
        <div className={`rounded-2xl p-6 text-white bg-gradient-to-r ${riskGradientClass}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">评估报告</h1>
              <p className="text-white/80 text-sm">你的心理健康状态概览</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-4xl font-bold">{scoreResult.total}</div>
              <div className="text-white/80 text-sm">总分</div>
            </div>
            <div className="flex flex-col gap-1">
              <RiskBadge riskLevel={scoreResult.risk_level as RiskLevel} />
              <p className="text-white/90 text-sm">{riskInfo.desc}</p>
            </div>
          </div>
        </div>

        {scoreResult.q9_flagged && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium mb-2">安全提示</p>
                <p className="text-red-700 text-sm leading-relaxed">
                  如果你现在有伤害自己的想法，请立刻联系：
                  <br />
                  <strong>全国心理援助热线：400-161-9995</strong>
                  <br />
                  或告诉你身边信任的人。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">九维度状态分析</h2>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Radar
                  name="得分"
                  dataKey="score"
                  stroke={scoreResult.risk_level === 'high' ? '#ef4444' : scoreResult.risk_level === 'moderate' ? '#f59e0b' : scoreResult.risk_level === 'mild' ? '#3b82f6' : '#10b981'}
                  fill={scoreResult.risk_level === 'high' ? '#ef4444' : scoreResult.risk_level === 'moderate' ? '#f59e0b' : scoreResult.risk_level === 'mild' ? '#3b82f6' : '#10b981'}
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {highScoreItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-2">需要关注的方面：</p>
              {highScoreItems.map((q) => (
                <div key={q} className="flex items-start gap-2 text-gray-700">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className="text-sm leading-relaxed">{highScoreDescriptions[q]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {feedback && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">可能的原因</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{feedback.cause}</p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">可落地建议</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{feedback.suggestion}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleRestart}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm"
        >
          <RefreshCw className="w-5 h-5" />
          重新开始筛查
        </button>
      </main>
    </div>
  )
}

export default ReportPage
