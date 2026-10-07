import { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, RefreshCw, CheckCircle, HelpCircle, Target, Zap } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000/api'

// Mock data — used until Member 1/3 ship the real retraining/learning APIs.
const mockAccuracyTrend = [
  { cycle: 'Cycle 1', accuracy: 72 },
  { cycle: 'Cycle 2', accuracy: 75 },
  { cycle: 'Cycle 3', accuracy: 74 },
  { cycle: 'Cycle 4', accuracy: 79 },
  { cycle: 'Cycle 5', accuracy: 83 },
  { cycle: 'Cycle 6', accuracy: 86 },
]

const mockBeforeAfter = {
  before: { accuracy: 72.0, avgError: 14.2, successRate: 61.0 },
  after: { accuracy: 86.0, avgError: 8.5, successRate: 78.0 },
}

const mockLearningLog = [
  { id: 1, date: '2026-09-28', event: 'Model retrained with 45 new feedback samples', impact: '+3.0% accuracy' },
  { id: 2, date: '2026-09-21', event: 'Optimization weights updated based on outcome data', impact: '+4.0% success rate' },
  { id: 3, date: '2026-09-14', event: 'Model retrained with 30 new feedback samples', impact: '+5.0% accuracy' },
  { id: 4, date: '2026-09-07', event: 'Initial baseline model established', impact: 'Baseline' },
]

async function fetchLearningData() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)
  try {
    const response = await fetch(`${API_BASE_URL}/learning/performance`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!response.ok) throw new Error('Learning API not available')
    return await response.json()
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

function MiniTrendChart({ data }) {
  const max = Math.max(...data.map((d) => d.accuracy), 10)
  const min = Math.min(...data.map((d) => d.accuracy), 0)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-3 h-32">
      {data.map((d) => (
        <div key={d.cycle} className="flex flex-col items-center gap-2 flex-1">
          <span className="text-xs text-purple-300 font-semibold">{d.accuracy}%</span>
          <div
            className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
            style={{ height: `${((d.accuracy - min) / range) * 80 + 10}px` }}
          />
          <span className="text-[10px] text-gray-500">{d.cycle}</span>
        </div>
      ))}
    </div>
  )
}

function ComparisonMetric({ label, before, after, unit = '', lowerIsBetter = false }) {
  const improved = lowerIsBetter ? after < before : after > before
  const diff = Math.abs(after - before).toFixed(1)

  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-3">{label}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Before</p>
          <p className="text-lg font-semibold text-gray-400">{before}{unit}</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${improved ? 'text-green-400' : 'text-red-400'}`}>
          {improved ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {diff}{unit}
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1">After</p>
          <p className="text-lg font-semibold text-purple-300">{after}{unit}</p>
        </div>
      </div>
    </div>
  )
}

function LearningPerformance() {
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(true)
  const [accuracyTrend, setAccuracyTrend] = useState([])
  const [beforeAfter, setBeforeAfter] = useState(null)
  const [learningLog, setLearningLog] = useState([])

  useEffect(() => {
    fetchLearningData()
      .then((data) => {
        setAccuracyTrend(data.accuracyTrend ?? mockAccuracyTrend)
        setBeforeAfter(data.beforeAfter ?? mockBeforeAfter)
        setLearningLog(data.learningLog ?? mockLearningLog)
        setIsMock(false)
        setLoading(false)
      })
      .catch(() => {
        setAccuracyTrend(mockAccuracyTrend)
        setBeforeAfter(mockBeforeAfter)
        setLearningLog(mockLearningLog)
        setIsMock(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-white">
        <p className="text-gray-400">Loading learning performance data...</p>
      </div>
    )
  }

  const latestAccuracy = accuracyTrend[accuracyTrend.length - 1]?.accuracy ?? 0
  const firstAccuracy = accuracyTrend[0]?.accuracy ?? 0
  const totalImprovement = (latestAccuracy - firstAccuracy).toFixed(1)

  return (
    <div className="p-6 text-white space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Brain className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-400">Learning & Performance</h2>
              <p className="text-gray-400 text-sm mt-1">How the system improves over time from feedback</p>
            </div>
          </div>
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
              isMock ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isMock ? <HelpCircle size={12} /> : <CheckCircle size={12} />}
            {isMock ? 'Estimated data' : 'Live learning data'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Target size={16} />
            Current Model Accuracy
          </div>
          <p className="text-2xl font-bold text-purple-300">{latestAccuracy}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <TrendingUp size={16} />
            Total Improvement
          </div>
          <p className="text-2xl font-bold text-green-400">+{totalImprovement}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <RefreshCw size={16} />
            Retraining Cycles
          </div>
          <p className="text-2xl font-bold text-blue-300">{accuracyTrend.length}</p>
        </div>
      </div>

      {/* Accuracy Trend */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Model Accuracy Over Time</h3>
        <MiniTrendChart data={accuracyTrend} />
      </div>


      {/* Before/After Comparison */}
      {beforeAfter && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-purple-400" />
            Before vs After Retraining
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComparisonMetric
              label="Prediction Accuracy"
              before={beforeAfter.before.accuracy}
              after={beforeAfter.after.accuracy}
              unit="%"
            />
            <ComparisonMetric
              label="Average Prediction Error"
              before={beforeAfter.before.avgError}
              after={beforeAfter.after.avgError}
              unit="%"
              lowerIsBetter
            />
            <ComparisonMetric
              label="Prescription Success Rate"
              before={beforeAfter.before.successRate}
              after={beforeAfter.after.successRate}
              unit="%"
            />
          </div>
        </div>
      )}

      {/* Learning Log */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Learning Activity Log</h3>
        <div className="space-y-2">
          {learningLog.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between bg-gray-900/50 rounded-lg px-4 py-3 text-sm"
            >
              <div>
                <p className="text-gray-200">{entry.event}</p>
                <p className="text-xs text-gray-500 mt-0.5">{entry.date}</p>
              </div>
              <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                {entry.impact}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LearningPerformance
