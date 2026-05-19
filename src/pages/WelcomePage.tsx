import { useNavigate, useState } from 'react-router-dom'
import { Heart, ArrowRight, Check } from 'lucide-react'

function WelcomePage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(true)

  const handleStart = () => {
    if (selected) {
      navigate('/chat')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">AI心理健康筛查</h1>
          <p className="text-gray-500 leading-relaxed">通过一段自然的对话，了解你最近的情绪状态，大约需要5-8分钟。</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">选择评估量表</h2>
          <div
            onClick={() => setSelected(true)}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
              selected
                ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">PHQ-9 抑郁筛查</h3>
                <p className="text-sm text-gray-500 mt-1">共9个问题，约5-8分钟完成</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selected ? 'bg-emerald-500 text-white' : 'bg-gray-100'
                }`}
              >
                {selected && <Check className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!selected}
          className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
            selected
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          开始评估
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          本次对话内容仅用于本次筛查，不会被储存
        </p>
      </div>
    </div>
  )
}

export default WelcomePage
