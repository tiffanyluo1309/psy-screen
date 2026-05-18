import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import RiskBadge from '../components/RiskBadge'
import ReportCard from '../components/ReportCard'

function ReportPage() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/')
  }

  const mockReport = {
    totalScore: 12,
    riskLevel: 'moderate' as const,
    riskLevelText: '压力较大',
    analysis: '根据你的回答，我们注意到你最近可能面临一些情绪上的挑战。你提到的睡眠问题和注意力不集中可能与当前的压力水平有关。',
    possibleCauses: '这些感受可能与学习压力、人际关系或近期发生的一些变化有关。',
    suggestions: [
      '尝试进行深呼吸练习，每天10分钟',
      '保持规律的作息，保证充足睡眠',
      '与信任的朋友或家人聊聊你的感受',
      '可以考虑预约学校心理咨询',
    ],
    highScoreItems: ['睡眠问题', '注意力不集中', '精力不足'],
    hasSuicideRisk: false,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首页</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
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
              <div className="text-4xl font-bold">{mockReport.totalScore}</div>
              <div className="text-white/80 text-sm">总分</div>
            </div>
            <RiskBadge riskLevel={mockReport.riskLevel} />
          </div>
        </div>

        <ReportCard
          icon={<Info className="w-5 h-5 text-indigo-500" />}
          title="状态分析"
          content={mockReport.analysis}
        />

        <ReportCard
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          title="高分项目"
          content={mockReport.highScoreItems.join('、')}
        />

        <ReportCard
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          title="建议"
          content={mockReport.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
              <span className="text-green-500 mt-1">•</span>
              <span>{s}</span>
            </div>
          ))}
        />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 text-sm">
            <strong>温馨提示：</strong>本报告仅供参考，不能替代专业心理咨询。如果你感到不适，请及时寻求专业帮助。
          </p>
        </div>
      </main>
    </div>
  )
}

export default ReportPage
