import { useNavigate } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'

function WelcomePage() {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">AI心理筛查</h1>
          <p className="text-gray-500">与AI对话，完成PHQ-9心理健康评估</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">选择评估量表</h2>
          <div className="border-2 border-indigo-100 rounded-xl p-4 cursor-pointer hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">PHQ-9 抑郁筛查</h3>
                <p className="text-sm text-gray-500 mt-1">共9个问题，约5-8分钟完成</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
        >
          开始评估
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          本次评估仅供演示，数据不会保存
        </p>
      </div>
    </div>
  )
}

export default WelcomePage
