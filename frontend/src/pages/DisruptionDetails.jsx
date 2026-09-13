import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, AlertTriangle, Mail, Bell, Package, Truck, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { fetchShipments } from '../api/shipments'

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

function DisruptionDetails() {
  const { shipmentId } = useParams()
  const navigate = useNavigate()
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState('')

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

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2">Delay Probability</h3>
        <p className="text-gray-500 text-sm">Coming Day 9 — ML prediction integration</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2">Prescription Recommendations</h3>
        <p className="text-gray-500 text-sm">Coming Day 10-11 — optimization engine results</p>
      </div>
    </div>
  )
}

export default DisruptionDetails