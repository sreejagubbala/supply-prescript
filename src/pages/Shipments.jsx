import { useState, useEffect } from 'react'

const mockShipments = [
  { id: 'SHP-001', origin: 'Chennai', destination: 'Bengaluru', status: 'On-Time', eta: '2026-08-28', riskScore: 12 },
  { id: 'SHP-002', origin: 'Mumbai', destination: 'Delhi', status: 'Delayed', eta: '2026-08-29', riskScore: 78 },
  { id: 'SHP-003', origin: 'Hyderabad', destination: 'Pune', status: 'On-Time', eta: '2026-08-27', riskScore: 20 },
  { id: 'SHP-004', origin: 'Kolkata', destination: 'Chennai', status: 'Delayed', eta: '2026-08-30', riskScore: 85 },
  { id: 'SHP-005', origin: 'Delhi', destination: 'Mumbai', status: 'On-Time', eta: '2026-08-28', riskScore: 15 },
  { id: 'SHP-006', origin: 'Pune', destination: 'Bengaluru', status: 'Delayed', eta: '2026-08-31', riskScore: 65 },
]

function riskColor(score) {
  if (score >= 70) return 'text-red-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-green-400'
}

function Shipments() {
  const [shipments, setShipments] = useState([])

  useEffect(() => {
    setShipments(mockShipments)
  }, [])

  return (
    <div className="p-6 text-white space-y-6">
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Shipments ({shipments.length})</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="pb-2">ID</th>
              <th className="pb-2">Origin</th>
              <th className="pb-2">Destination</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">ETA</th>
              <th className="pb-2">Delay Risk</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="border-b border-gray-700">
                <td className="py-2">{s.id}</td>
                <td className="py-2">{s.origin}</td>
                <td className="py-2">{s.destination}</td>
                <td className={`py-2 ${s.status === 'Delayed' ? 'text-red-400' : 'text-green-400'}`}>
                  {s.status}
                </td>
                <td className="py-2">{s.eta}</td>
                <td className={`py-2 font-semibold ${riskColor(s.riskScore)}`}>{s.riskScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Shipments