import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, AlertTriangle, Mail, Bell, Package, Truck, CheckCircle2, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { fetchShipments, fetchDelayPrediction } from '../api/shipments'
import { fetchPrescriptions } from '../api/shipments'

function getRiskSeverity(score) {
  const s = Number(score) || 0
  if (s >= 80) return { label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500' }
  if (s >= 60) return { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500' }
  if (s >= 30) return { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' }
  return { label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500' }
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
      setPrescriptions(Array.isArray(data) ? data : [])
    })
    .catch(() => {
      setPrescriptions([])
    })
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

      <div className="bg-gray-800 rounded-xl p-6">
  <h3 className="text-lg font-semibold mb-4">Prescription Recommendations</h3>
  {prescriptions.length === 0 ? (
    <p className="text-gray-500 text-sm">No recommendations available for this shipment.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {prescriptions
        .sort((a, b) => a.recommendation_rank - b.recommendation_rank)
        .map((p) => (
          <div
            key={p.id}
            className={`rounded-xl p-4 border ${
              p.recommendation_rank === 1
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 bg-gray-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{p.option_name}</h4>
              {p.recommendation_rank === 1 && (
                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  Best Option
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-4">{p.description}</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Cost</span>
                <span className="font-semibold">₹{p.estimated_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Time</span>
                <span className="font-semibold">{p.delivery_days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Risk Score</span>
                <span className="font-semibold">{p.risk_score}%</span>
              </div>
            </div>
          </div>
        ))}
    </div>
  )}
</div>
    </div>
  )
}

export default DisruptionDetails
