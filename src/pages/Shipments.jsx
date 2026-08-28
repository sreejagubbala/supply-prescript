import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

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
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setShipments(mockShipments)
  }, [])

  const filtered = shipments.filter((s) => {
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="p-6 text-white space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 gap-2 flex-1 min-w-[200px]">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, origin, or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full placeholder-gray-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="On-Time">On-Time</option>
          <option value="Delayed">Delayed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Shipments ({filtered.length})</h3>
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No shipments match your filters</p>
        ) : (
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
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition"
                >
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
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-purple-400">{selected.id}</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Origin:</span> {selected.origin}</p>
              <p><span className="text-gray-400">Destination:</span> {selected.destination}</p>
              <p><span className="text-gray-400">Status:</span> <span className={selected.status === 'Delayed' ? 'text-red-400' : 'text-green-400'}>{selected.status}</span></p>
              <p><span className="text-gray-400">ETA:</span> {selected.eta}</p>
              <p><span className="text-gray-400">Delay Risk Score:</span> <span className={riskColor(selected.riskScore)}>{selected.riskScore}%</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipments