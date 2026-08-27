import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data — will be replaced with real API data on Day 7
const kpis = [
  { label: 'Total Shipments', value: 128 },
  { label: 'On-Time', value: 96 },
  { label: 'Delayed', value: 32 },
]

const trendData = [
  { day: 'Mon', delays: 4 },
  { day: 'Tue', delays: 7 },
  { day: 'Wed', delays: 3 },
  { day: 'Thu', delays: 9 },
  { day: 'Fri', delays: 5 },
  { day: 'Sat', delays: 2 },
  { day: 'Sun', delays: 6 },
]

const shipments = [
  { id: 'SHP-001', status: 'On-Time', eta: '2026-08-28' },
  { id: 'SHP-002', status: 'Delayed', eta: '2026-08-29' },
  { id: 'SHP-003', status: 'On-Time', eta: '2026-08-27' },
  { id: 'SHP-004', status: 'Delayed', eta: '2026-08-30' },
]

function Operations() {
  return (
    <div className="p-6 text-white space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">{kpi.label}</p>
            <p className="text-3xl font-bold text-purple-400">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Delay Trend (This Week)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Line type="monotone" dataKey="delays" stroke="#c084fc" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Shipments Table */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Shipments</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="pb-2">ID</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">ETA</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="border-b border-gray-700">
                <td className="py-2">{s.id}</td>
                <td className={`py-2 ${s.status === 'Delayed' ? 'text-red-400' : 'text-green-400'}`}>
                  {s.status}
                </td>
                <td className="py-2">{s.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Operations