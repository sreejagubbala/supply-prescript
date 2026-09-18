import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, AlertTriangle, Mail, Bell, Package, Truck, CheckCircle2, RefreshCw, CheckCircle, HelpCircle, Info, Download } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { fetchShipments, fetchDelayPrediction, fetchPrescriptions } from '../api/shipments'

function getRiskSeverity(score) {
  const s = Number(score) || 0
  if (s >= 80) return { label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500' }
  if (s >= 60) return { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500' }
  if (s >= 30) return { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' }
  return { label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500' }
}

function getPrescriptionRiskBadge(score) {
  const s = Number(score) || 0
  if (s >= 60) return { label: 'High', dot: 'bg-red-400', text: 'text-red-400' }
  if (s >= 30) return { label: 'Medium', dot: 'bg-yellow-400', text: 'text-yellow-400' }
  return { label: 'Low', dot: 'bg-green-400', text: 'text-green-400' }
}

function getRankExplanation(rank) {
  if (rank === 1) {
    return 'Best overall balance of cost, delivery speed, and risk among the available options.'
  }
  return 'Ranked lower due to higher cost, longer delivery time, or greater risk compared to the top option.'
}

function getTimelineStage(status) {
  const s = String(status).toLowerCase()
  if (s.includes('deliver')) return 3
  if (s.includes('risk') || s.includes('delay')) return 2
  if (s.includes('transit')) return 1
  return 1
}

function ShipmentTimeline({ status }) {
  const stage = getTimelineStage(status)
  const steps = [
    { label: 'Order Placed', icon: Package },
    { label: 'In Transit', icon: Truck },
    { label: 'Current Location', icon: MapPin },
    { label: 'Delivery', icon: CheckCircle2 },
  ]

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, i) => {
        const Icon = step.icon
        const isDone = i <= stage
        const isCurrent = i === stage
        return (
          <div key={step.label} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div
                className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                  i <= stage ? 'bg-purple-500' : 'bg-gray-700'
                }`}
              />
            )}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                isDone
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-500'
              } ${isCurrent ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-800' : ''}`}
            >
              <Icon size={16} />
            </div>
            <span className={`text-xs mt-2 text-center ${isDone ? 'text-white' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function RouteVisual({ origin, destination }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
        <span className="text-xs text-gray-400 mt-1 whitespace-nowrap">{origin}</span>
      </div>
      <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-pink-400 relative">
        <Truck size={16} className="absolute -top-2 left-1/2 -translate-x-1/2 text-purple-300" />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-pink-400"></div>
        <span className="text-xs text-gray-400 mt-1 whitespace-nowrap">{destination}</span>
      </div>
    </div>
  )
}

function generateMockTrend(currentValue) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today']
  const values = []
  let v = Math.max(5, currentValue - Math.floor(Math.random() * 20) - 5)
  for (let i = 0; i < 6; i++) {
    v = Math.min(95, Math.max(5, v + (Math.random() * 16 - 8)))
    values.push(Math.round(v))
  }
  values.push(Math.round(currentValue))
  return days.map((day, i) => ({ day, value: values[i] }))
}

function getMockFactors(shipment, probability) {
  const factors = []
  if (probability >= 60) {
    factors.push('Historical delays on this route above average')
  }
  if (shipment.origin && shipment.destination) {
    factors.push(`Distance and typical transit congestion between ${shipment.origin} and ${shipment.destination}`)
  }
  factors.push('Current season / weather-related shipping patterns')
  if (probability < 40) {
    factors.push('Carrier has a strong on-time performance history')
  }
  return factors.slice(0, 3)
}

function TrendMiniChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 10)
  return (
    <div className="flex items-end gap-2 h-16">
      {data.map((d) => (
        <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full bg-purple-500/70 rounded-t"
            style={{ height: `${(d.value / max) * 48}px` }}
            title={`${d.day}: ${d.value}%`}
          />
          <span className="text-[10px] text-gray-500">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

function ComparisonBar({ value, max, colorClass }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4
  return (
    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function computeValueScore(p, maxCost, maxDays, maxRisk) {
  const costScore = maxCost > 0 ? (1 - p.estimated_cost / maxCost) * 100 : 0
  const speedScore = maxDays > 0 ? (1 - p.delivery_days / maxDays) * 100 : 0
  const riskScore = maxRisk > 0 ? (1 - p.risk_score / maxRisk) * 100 : 0
  return Math.round((costScore + speedScore + riskScore) / 3)
}

function exportComparisonCSV(prescriptions) {
  const headers = ['Option', 'Cost', 'Delivery Days', 'Risk Score', 'Rank', 'Value Score']
  const rows = prescriptions.map((p) => [
    p.option_name,
    p.estimated_cost,
    p.delivery_days,
    p.risk_score,
    p.recommendation_rank,
    p.valueScore,
  ])
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'prescription-comparison.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function MiniComparisonChart({ prescriptions, maxCost, maxDays, maxRisk }) {
  const rows = [
    { key: 'estimated_cost', label: 'Cost', max: maxCost, color: 'bg-blue-400' },
    { key: 'delivery_days', label: 'Delivery', max: maxDays, color: 'bg-pink-400' },
    { key: 'risk_score', label: 'Risk', max: maxRisk, color: 'bg-orange-400' },
  ]

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.key}>
          <p className="text-xs text-gray-400 mb-2">{row.label}</p>
          <div className="space-y-1.5">
            {prescriptions.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-28 truncate">{p.option_name}</span>
                <div className="flex-1">
                  <ComparisonBar value={p[row.key]} max={row.max} colorClass={row.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Plots each option by cost (x-axis) and delivery speed (y-axis) so the
// cost/speed trade-off is visible at a glance. Top-left = cheap and fast.
function CostSpeedScatter({ prescriptions, maxCost, maxDays, maxRisk, selectedId, onSelect }) {
  const gridLines = [0, 25, 50, 75, 100]
  const costTicks = gridLines.map((pct) => Math.round((pct / 100) * maxCost))
  const dayTicks = gridLines.map((pct) => Math.round((pct / 100) * maxDays))

  return (
    <div>
      <div className="relative w-full h-64 bg-gray-900/50 rounded-lg border border-gray-700 p-4 pl-14 pb-8">
        {/* Gridlines */}
        {gridLines.map((pct) => (
          <div key={`h-${pct}`}>
            <div
              className="absolute left-14 right-4 border-t border-gray-800"
              style={{ top: `${5 + pct * 0.85}%` }}
            />
            <span
              className="absolute left-0 text-[9px] text-gray-500 -translate-y-1/2"
              style={{ top: `${5 + pct * 0.85}%` }}
            >
              {dayTicks[gridLines.indexOf(pct)]}d
            </span>
          </div>
        ))}
        {gridLines.map((pct) => (
          <div key={`v-${pct}`}>
            <div
              className="absolute top-4 bottom-8 border-l border-gray-800"
              style={{ left: `calc(3.5rem + ${pct * 0.85}%)` }}
            />
            <span
              className="absolute bottom-0 text-[9px] text-gray-500 -translate-x-1/2"
              style={{ left: `calc(3.5rem + ${pct * 0.85}%)` }}
            >
              ₹{costTicks[gridLines.indexOf(pct)] >= 1000 ? `${Math.round(costTicks[gridLines.indexOf(pct)] / 1000)}k` : costTicks[gridLines.indexOf(pct)]}
            </span>
          </div>
        ))}

        {/* Reference diagonal (average trade-off line) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="15%" y1="90%" x2="90%" y2="5%"
            stroke="#6b7280" strokeWidth="1" strokeDasharray="4 4"
          />
        </svg>

        {/* Data points */}
        <div className="relative w-full h-full">
          {prescriptions.map((p) => {
            const xPct = maxCost > 0 ? (p.estimated_cost / maxCost) * 85 + 5 : 5
            const yPct = maxDays > 0 ? (p.delivery_days / maxDays) * 85 + 5 : 5
            const isBest = p.recommendation_rank === 1
            const isSelected = selectedId === p.id
            const size = maxRisk > 0 ? 12 + (p.risk_score / maxRisk) * 10 : 16
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${xPct}%`, top: `${yPct}%` }}
                title={`${p.option_name}: ₹${p.estimated_cost.toLocaleString()}, ${p.delivery_days} days, ${p.risk_score}% risk`}
              >
                <div
                  className={`rounded-full border-2 transition ${
                    isBest ? 'bg-purple-500 border-purple-300' : 'bg-gray-600 border-gray-400'
                  } ${isSelected ? 'ring-2 ring-white' : 'group-hover:scale-110'}`}
                  style={{ width: `${size}px`, height: `${size}px` }}
                />
                <span className="text-[10px] text-gray-300 mt-1 whitespace-nowrap">{p.option_name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500 border-2 border-purple-300"></span>
          Recommended option
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-600 border-2 border-gray-400"></span>
          Other options
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-gray-500"></span>
          Average trade-off line
        </div>
        <div>Dot size = risk level</div>
      </div>
    </div>
  )
}

function DisruptionDetails() {
  const { shipmentId } = useParams()
  const navigate = useNavigate()
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [prescriptions, setPrescriptions] = useState([])
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null)
  const trendRef = useRef(null)

  useEffect(() => {
    fetchShipments()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.shipments || []
        const found = list.find((s) => String(s.id) === String(shipmentId))
        setShipment(found || null)
        setLoading(false)
      })
      .catch(() => {
        setShipment(null)
        setLoading(false)
      })
  }, [shipmentId])

  function loadPrediction() {
    if (!shipment) return

    fetchDelayPrediction(shipment.id)
      .then((data) => {
        const probability = data.probability ?? data.delayProbability ?? 0
        setPrediction({
          probability,
          confidence: data.confidence ?? 'Medium',
          isMock: false,
        })
        if (!trendRef.current) {
          trendRef.current = data.trend ?? generateMockTrend(probability)
        }
        setLastUpdated(Date.now())
      })
      .catch(() => {
        const mockProbability = Math.min(95, Math.round((shipment.riskScore || 0) * 0.9 + 5))
        setPrediction({
          probability: mockProbability,
          confidence: 'Estimated',
          isMock: true,
        })
        if (!trendRef.current) {
          trendRef.current = generateMockTrend(mockProbability)
        }
        setLastUpdated(Date.now())
      })
  }

  useEffect(() => {
    if (!shipment) return
    loadPrediction()
    const interval = setInterval(loadPrediction, 45000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipment])

  useEffect(() => {
    if (!lastUpdated) return
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000))
    }, 1000)
    return () => clearInterval(tick)
  }, [lastUpdated])

  useEffect(() => {
    if (!shipment) return
    fetchPrescriptions(shipment.id)
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setPrescriptions(list)
        const top = list.find((p) => p.recommendation_rank === 1)
        if (top) setSelectedPrescriptionId(top.id)
      })
      .catch(() => setPrescriptions([]))
  }, [shipment])

  function handleContactSupplier() {
    setActionMessage('Supplier has been notified via email.')
    setTimeout(() => setActionMessage(''), 3000)
  }

  function handleNotifyTeam() {
    setActionMessage('Team has been alerted about this disruption.')
    setTimeout(() => setActionMessage(''), 3000)
  }

  if (loading) {
    return <div className="p-6 text-white">Loading disruption details...</div>
  }

  if (!shipment) {
    return (
      <div className="p-6 text-white">
        <p className="text-gray-400">Shipment not found.</p>
        <button
          onClick={() => navigate('/shipments')}
          className="mt-4 text-purple-400 hover:underline"
        >
          ← Back to Shipments
        </button>
      </div>
    )
  }

  const severity = getRiskSeverity(shipment.riskScore)
  const factors = prediction ? getMockFactors(shipment, prediction.probability) : []
  const trendData = trendRef.current || []

  const sortedPrescriptions = [...prescriptions].sort(
    (a, b) => a.recommendation_rank - b.recommendation_rank
  )
  const maxCost = Math.max(...prescriptions.map((p) => p.estimated_cost), 1)
  const maxDays = Math.max(...prescriptions.map((p) => p.delivery_days), 1)
  const maxRisk = Math.max(...prescriptions.map((p) => p.risk_score), 1)

  const prescriptionsWithScore = sortedPrescriptions.map((p) => ({
    ...p,
    valueScore: computeValueScore(p, maxCost, maxDays, maxRisk),
  }))

  const selectedOption = prescriptionsWithScore.find((p) => p.id === selectedPrescriptionId)

  return (
    <div className="p-6 text-white space-y-6">
      <button
        onClick={() => navigate('/shipments')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition"
      >
        <ArrowLeft size={18} />
        Back to Shipments
      </button>

      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-purple-400">{shipment.id}</h2>
            <p className="text-gray-400 text-sm mt-1">Disruption Details</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${severity.color}`}>
              <AlertTriangle size={16} />
              {severity.label} Risk
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <MapPin size={16} />
            Route
          </div>
          <p className="font-semibold">{shipment.origin} → {shipment.destination}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Calendar size={16} />
            ETA
          </div>
          <p className="font-semibold">{shipment.eta}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <AlertTriangle size={16} />
            Delay Risk Score
          </div>
          <p className="font-semibold">{shipment.riskScore}%</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Route Overview</h3>
        <RouteVisual origin={shipment.origin} destination={shipment.destination} />
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Shipment Progress</h3>
        <ShipmentTimeline status={shipment.status} />
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleContactSupplier}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <Mail size={16} />
            Contact Supplier
          </button>
          <button
            onClick={handleNotifyTeam}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 transition rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <Bell size={16} />
            Notify Team
          </button>
        </div>
        {actionMessage && (
          <p className="mt-3 text-sm text-green-400">{actionMessage}</p>
        )}
      </div>

      {/* Delay Probability */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold">Delay Probability</h3>
          <div className="flex items-center gap-3">
            {prediction && (
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${
                  prediction.isMock
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                {prediction.isMock ? <HelpCircle size={12} /> : <CheckCircle size={12} />}
                {prediction.isMock ? 'Estimated data' : 'Live ML data'}
              </span>
            )}
            {lastUpdated && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <RefreshCw size={12} />
                Updated {secondsAgo}s ago
              </span>
            )}
          </div>
        </div>

        {prediction ? (
          <>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#374151" strokeWidth="8" fill="none" />
                  <circle
                    cx="48" cy="48" r="40"
                    stroke={prediction.probability >= 70 ? '#f87171' : prediction.probability >= 40 ? '#facc15' : '#4ade80'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(prediction.probability / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  {prediction.probability}%
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Predicted delay probability</p>
                <p className="text-xs text-gray-500 mt-1">Confidence: {prediction.confidence}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-2">7-day trend</p>
              <TrendMiniChart data={trendData} />
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">Contributing factors</p>
              <ul className="space-y-1.5">
                {factors.map((f) => (
                  <li key={f} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Loading prediction...</p>
        )}
      </div>

      {/* Prescription Recommendations */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Prescription Recommendations</h3>
        {prescriptionsWithScore.length === 0 ? (
          <p className="text-gray-500 text-sm">No recommendations available for this shipment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prescriptionsWithScore.map((p) => {
              const isSelected = selectedPrescriptionId === p.id
              const riskBadge = getPrescriptionRiskBadge(p.risk_score)
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrescriptionId(p.id)}
                  className={`text-left rounded-xl p-4 border transition ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/50'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{p.option_name}</h4>
                    <div className="flex items-center gap-1.5">
                      {p.recommendation_rank === 1 && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          Best Option
                        </span>
                      )}
                      {isSelected && <CheckCircle size={16} className="text-purple-400" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{p.description}</p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Estimated Cost</span>
                        <span className="font-semibold">₹{p.estimated_cost.toLocaleString()}</span>
                      </div>
                      <ComparisonBar value={p.estimated_cost} max={maxCost} colorClass="bg-blue-400" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Delivery Time</span>
                        <span className="font-semibold">{p.delivery_days} days</span>
                      </div>
                      <ComparisonBar value={p.delivery_days} max={maxDays} colorClass="bg-pink-400" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 items-center">
                        <span className="text-gray-500">Risk Score</span>
                        <span className={`font-semibold flex items-center gap-1.5 ${riskBadge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${riskBadge.dot}`}></span>
                          {p.risk_score}% ({riskBadge.label})
                        </span>
                      </div>
                      <ComparisonBar value={p.risk_score} max={maxRisk} colorClass="bg-orange-400" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-700 flex items-start gap-1.5 text-xs text-gray-500">
                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                    {getRankExplanation(p.recommendation_rank)}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Compare Alternatives */}
      {prescriptionsWithScore.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold">Compare Alternatives</h3>
            <button
              onClick={() => exportComparisonCSV(prescriptionsWithScore)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 transition rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>

          {/* Selection summary */}
          {selectedOption && (
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/40 rounded-lg px-4 py-2.5 mb-6 text-sm">
              <CheckCircle size={16} className="text-purple-400 flex-shrink-0" />
              <span>
                You selected: <span className="font-semibold text-purple-300">{selectedOption.option_name}</span>
                {' '}— ₹{selectedOption.estimated_cost.toLocaleString()}, {selectedOption.delivery_days} days, value score {selectedOption.valueScore}/100
              </span>
            </div>
          )}

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Option</th>
                  <th className="pb-2">Cost</th>
                  <th className="pb-2">Delivery</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2">Value Score</th>
                  <th className="pb-2">Rank</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionsWithScore.map((p) => {
                  const riskBadge = getPrescriptionRiskBadge(p.risk_score)
                  const isSelected = selectedPrescriptionId === p.id
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPrescriptionId(p.id)}
                      className={`border-b border-gray-700 cursor-pointer transition ${
                        isSelected ? 'bg-purple-500/10' : 'hover:bg-gray-700/30'
                      }`}
                    >
                      <td className="py-3 font-medium flex items-center gap-2">
                        {isSelected && <CheckCircle size={14} className="text-purple-400" />}
                        {p.option_name}
                      </td>
                      <td className="py-3">₹{p.estimated_cost.toLocaleString()}</td>
                      <td className="py-3">{p.delivery_days} days</td>
                      <td className={`py-3 ${riskBadge.text}`}>
                        {p.risk_score}% ({riskBadge.label})
                      </td>
                      <td className="py-3 font-semibold text-purple-300">{p.valueScore}/100</td>
                      <td className="py-3">
                        {p.recommendation_rank === 1 ? (
                          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            #1 Best
                          </span>
                        ) : (
                          `#${p.recommendation_rank}`
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mini comparison chart */}
          <div>
            <p className="text-sm font-semibold mb-3">Side-by-side visual comparison</p>
            <MiniComparisonChart
              prescriptions={prescriptionsWithScore}
              maxCost={maxCost}
              maxDays={maxDays}
              maxRisk={maxRisk}
            />
          </div>

          {/* Cost vs Speed scatter */}
          <div className="mt-6">
            <p className="text-sm font-semibold mb-3">Cost vs Speed Trade-off</p>
            <CostSpeedScatter
              prescriptions={prescriptionsWithScore}
              maxCost={maxCost}
              maxDays={maxDays}
              maxRisk={maxRisk}
              selectedId={selectedPrescriptionId}
              onSelect={setSelectedPrescriptionId}
              />
              
            <p className="text-xs text-gray-500 mt-2">
              Options closer to the top-left offer the best combination of low cost and fast delivery.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DisruptionDetails
