import { useState, useEffect } from 'react'
import { Search, X, ArrowUp, ArrowDown, Download } from 'lucide-react'
import { fetchShipments } from '../api/shipments'
import { useNavigate } from 'react-router-dom'



const ROWS_PER_PAGE = 20
const HIGH_RISK_THRESHOLD = 70

const cityColors = {}
const palette = ['bg-blue-400', 'bg-pink-400', 'bg-teal-400', 'bg-orange-400', 'bg-indigo-400', 'bg-yellow-400']
function getCityColor(city) {
  if (!cityColors[city]) {
    const usedCount = Object.keys(cityColors).length
    cityColors[city] = palette[usedCount % palette.length]
  }
  return cityColors[city]
}

function riskColor(score) {
  if (score >= HIGH_RISK_THRESHOLD) return 'text-red-400'
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

function CityTag({ city }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${getCityColor(city)}`}></span>
      {city}
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

function normalizeShipment(raw) {
  return {
    id: String(raw.id ?? ''),
    origin: String(raw.origin ?? ''),
    destination: String(raw.destination ?? ''),
    status: String(raw.status ?? 'Unknown'),
    eta: String(raw.eta ?? ''),
    riskScore: Number(raw.riskScore ?? raw.risk_score ?? 0),
  }
}

function Shipments() {
  const navigate = useNavigate()
  const [shipments, setShipments] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'riskScore', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

      useEffect(() => {
  fetchShipments()
    .then((data) => {
      const list = Array.isArray(data)
        ? data
        : data.shipments || []

      setShipments(list.map(normalizeShipment))
    })
    .catch((error) => {
      console.error('Failed to load shipments:', error)

      // Do not display fake/mock shipment data.
      setShipments([])
    })
}, [])

    const filtered = shipments.filter((s) => {
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter
    const matchesSearch =
      String(s.id).toLowerCase().includes(search.toLowerCase()) ||
      String(s.origin).toLowerCase().includes(search.toLowerCase()) ||
      String(s.destination).toLowerCase().includes(search.toLowerCase())
    const matchesDateFrom = !dateFrom || s.eta >= dateFrom
    const matchesDateTo = !dateTo || s.eta <= dateTo
    return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo
  })

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

  function toggleRow(id) {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    const pageIds = paginated.map((s) => s.id)
    const allSelected = pageIds.every((id) => selectedRows.includes(id))
    if (allSelected) {
      setSelectedRows((prev) => prev.filter((id) => !pageIds.includes(id)))
    } else {
      setSelectedRows((prev) => [...new Set([...prev, ...pageIds])])
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, search, sortConfig, dateFrom, dateTo])

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'status', label: 'Status' },
    { key: 'eta', label: 'ETA' },
    { key: 'riskScore', label: 'Delay Risk' },
  ]

  const allOnPageSelected = paginated.length > 0 && paginated.every((s) => selectedRows.includes(s.id))

  return (
    <div className="p-6 text-white space-y-6">
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

        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-sm">
          <span className="text-gray-400">From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent outline-none text-white"
          />
          <span className="text-gray-400">To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent outline-none text-white"
          />
        </div>

        <button
          onClick={() => exportToCSV(sorted)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition rounded-lg px-4 py-2 text-sm font-semibold"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between bg-purple-600/20 border border-purple-500 rounded-lg px-4 py-2">
          <span className="text-sm">{selectedRows.length} shipment(s) selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => alert(`Marked ${selectedRows.length} shipment(s) as reviewed`)}
              className="text-sm bg-purple-600 hover:bg-purple-700 transition rounded-lg px-3 py-1"
            >
              Mark as Reviewed
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="text-sm bg-gray-700 hover:bg-gray-600 transition rounded-lg px-3 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Shipments ({sorted.length})</h3>
        {paginated.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No shipments match your filters</p>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-2 w-8">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAll}
                      className="accent-purple-500"
                    />
                  </th>
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
                {paginated.map((s) => {
                  const isHighRisk = s.riskScore >= HIGH_RISK_THRESHOLD
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition ${
                        isHighRisk ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <td className="py-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(s.id)}
                          onChange={() => toggleRow(s.id)}
                          className="accent-purple-500"
                        />
                      </td>
                      <td className="py-2" onClick={() => setSelected(s)}>
                        <span className="flex items-center gap-1.5">
                          {isHighRisk && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          )}
                          {s.id}
                        </span>
                      </td>
                      <td className="py-2" onClick={() => setSelected(s)}><CityTag city={s.origin} /></td>
                      <td className="py-2" onClick={() => setSelected(s)}><CityTag city={s.destination} /></td>
                      <td className="py-2" onClick={() => setSelected(s)}><StatusBadge status={s.status} /></td>
                      <td className="py-2" onClick={() => setSelected(s)}>{s.eta}</td>
                      <td className={`py-2 font-semibold ${riskColor(s.riskScore)}`} onClick={() => setSelected(s)}>
                        {s.riskScore}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
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
            )}
          </>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
              {selected.id}
              {selected.riskScore >= HIGH_RISK_THRESHOLD && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">High Risk</span>
              )}
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Origin:</span> <CityTag city={selected.origin} /></p>
              <p><span className="text-gray-400">Destination:</span> <CityTag city={selected.destination} /></p>
              <p>
                <span className="text-gray-400">Status:</span>{' '}
                <StatusBadge status={selected.status} />
              </p>
              <p><span className="text-gray-400">ETA:</span> {selected.eta}</p>
              <p><span className="text-gray-400">Delay Risk Score:</span> <span className={riskColor(selected.riskScore)}>{selected.riskScore}%</span></p>
              <button
                     onClick={() => navigate(`/shipments/${selected.id}`)}
                    className="mt-4 w-full bg-purple-600 hover:bg-purple-700 transition rounded-lg py-2 text-sm font-semibold"> View Full Disruption Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipments