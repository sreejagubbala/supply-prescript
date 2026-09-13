import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { fetchShipments } from '../api/shipments'

function DisruptionDetails() {
  const { shipmentId } = useParams()
  const navigate = useNavigate()
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-purple-400">{shipment.id}</h2>
            <p className="text-gray-400 text-sm mt-1">Disruption Details</p>
          </div>
          {shipment.status === 'Delayed' && (
            <span className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-sm font-semibold">
              <AlertTriangle size={16} />
              Delayed
            </span>
          )}
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