import { useState, useEffect } from 'react'
import { Search, X, ArrowUp, ArrowDown, Download } from 'lucide-react'

const mockShipments = [
  { id: 'SHP-001', origin: 'Chennai', destination: 'Bengaluru', status: 'On-Time', eta: '2026-08-28', riskScore: 12 },
  { id: 'SHP-002', origin: 'Mumbai', destination: 'Delhi', status: 'Delayed', eta: '2026-08-29', riskScore: 78 },
  { id: 'SHP-003', origin: 'Hyderabad', destination: 'Pune', status: 'On-Time', eta: '2026-08-27', riskScore: 20 },
  { id: 'SHP-004', origin: 'Kolkata', destination: 'Chennai', status: 'Delayed', eta: '2026-08-30', riskScore: 85 },
  { id: 'SHP-005', origin: 'Delhi', destination: 'Mumbai', status: 'On-Time', eta: '2026-08-28', riskScore: 15 },
  { id: 'SHP-006', origin: 'Pune', destination: 'Bengaluru', status: 'Delayed', eta: '2026-08-31', riskScore: 65 },
  { id: 'SHP-007', origin: 'Chennai', destination: 'Hyderabad', status: 'On-Time', eta: '2026-08-27', riskScore: 8 },
  { id: 'SHP-008', origin: 'Bengaluru', destination: 'Delhi', status: 'Delayed', eta: '2026-09-01', riskScore: 91 },
  { id: 'SHP-009', origin: 'Mumbai', destination: 'Pune', status: 'On-Time', eta: '2026-08-28', riskScore: 25 },
  { id: 'SHP-010', origin: 'Delhi', destination: 'Kolkata', status: 'Delayed', eta: '2026-08-30', riskScore: 55 },
  { id: 'SHP-011', origin: 'Pune', destination: 'Mumbai', status: 'On-Time', eta: '2026-08-29', riskScore: 18 },
  { id: 'SHP-012', origin: 'Bengaluru', destination: 'Chennai', status: 'On-Time', eta: '2026-08-27', riskScore: 10 },
]

const ROWS_PER_PAGE = 5

function riskColor(score) {
  if (score >= 70) return 'text-red-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-green-400'
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
      status === 'Delayed'
        ? 'bg-red-500/20 text-red-400'
        : 'bg-green-500/20 text-green-400'
    }`}>
      {status}
    </span>
  )
}

function exportToCSV(data) {
  const headers = ['ID', 'Origin', 'Destination', 'Status', 'ETA', 'Risk Score']
  const rows = data.map((s) => [s.id, s.origin, s.destination, s.status, s.eta, s.riskScore])
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'shipments.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function Shipments() {
  const [shipments, setShipments] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setShipments(mockShipments)
  }, [])

  // Filtering
  const filtered = shipments.filter((s) => {
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0
    const valA = a[sortConfig.key]
    const valB = b[sortConfig.key]
    if (typeof valA === 'number') {
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA
    }
    return sortConfig.direction === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA))
  })

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE))
  const paginated = sorted.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  )

  function handleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  function SortIcon({ column }) {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="inline ml-1" /> : <ArrowDown size={14} className="inline ml-1" />
  }

  // Reset to page 1 whenever filters/search/sort change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, search, sortConfig])

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'status', label: 'Status' },
    { key: 'eta', label: 'ETA' },
    { key: 'riskScore', label: 'Delay Risk' },
  ]

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

        <button
          onClick={() => exportToCSV(sorted)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition rounded-lg px-4 py-2 text-sm font-semibold"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Shipments ({sorted.length})</h3>
        {paginated.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No shipments match your filters</p>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="pb-2 cursor-pointer select-none hover:text-white transition"
                    >
                      {col.label}
                      <SortIcon column={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition"
                  >
                    <td className="py-2">{s.id}</td>
                    <td className="py-2">{s.origin}</td>
                    <td className="py-2">{s.destination}</td>
                    <td className="py-2"><StatusBadge status={s.status} /></td>
                    <td className="py-2">{s.eta}</td>
                    <td className={`py-2 font-semibold ${riskColor(s.riskScore)}`}>{s.riskScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
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
              <p>
                <span className="text-gray-400">Status:</span>{' '}
                <StatusBadge status={selected.status} />
              </p>
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