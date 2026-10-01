import { useState, useEffect } from 'react'
import { fetchOperationsSummary } from '../api/shipments'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  Truck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

const colorMap = {
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400'
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-400'
  },
  red: {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-400'
  },
}

const pieColors = ['#4ade80', '#f87171']

function KpiSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto mb-3"></div>
      <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto"></div>
    </div>
  )
}

function Operations() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState([])
  const [trendData, setTrendData] = useState([])
  const [shipments, setShipments] = useState([])

  useEffect(() => {
    fetchOperationsSummary()
      .then((data) => {

        // -----------------------------
        // KPI CARDS
        // -----------------------------

        setKpis([
          {
            label: 'Total Shipments',
            value: data.totalShipments,
            icon: Truck,
            color: 'purple',
          },
          {
            label: 'On-Time',
            value: data.onTimeCount,
            icon: CheckCircle,
            color: 'green',
          },
          {
            label: 'Delayed',
            value: data.delayedCount,
            icon: AlertTriangle,
            color: 'red',
          },
        ])

        // -----------------------------
        // DELAY TREND
        // -----------------------------

        setTrendData(
          Array.isArray(data.trendData)
            ? data.trendData
            : []
        )

        // -----------------------------
        // RECENT SHIPMENTS
        // -----------------------------

        setShipments(
          Array.isArray(data.recentShipments)
            ? data.recentShipments
            : []
        )

        setLoading(false)
      })
      .catch((error) => {
        console.error(
          'Failed to load operations data:',
          error
        )

        setKpis([])
        setTrendData([])
        setShipments([])

        setLoading(false)
      })
  }, [])

  const onTimeCount =
    kpis.find((k) => k.label === 'On-Time')?.value || 0

  const delayedCount =
    kpis.find((k) => k.label === 'Delayed')?.value || 0

  const pieData = [
    {
      name: 'On-Time',
      value: onTimeCount
    },
    {
      name: 'Delayed',
      value: delayedCount
    },
  ]

  return (
    <div className="p-6 text-white space-y-6">

      {/* ========================================= */}
      {/* KPI CARDS */}
      {/* ========================================= */}

      <div className="grid grid-cols-3 gap-4">

        {loading
          ? [1, 2, 3].map((i) => (
              <KpiSkeleton key={i} />
            ))
          : kpis.map((kpi) => {

              const Icon = kpi.icon
              const colors = colorMap[kpi.color]

              return (
                <div
                  key={kpi.label}
                  className={`
                    bg-gray-800
                    rounded-xl
                    p-4
                    border-l-4
                    ${colors.border}
                    flex
                    items-center
                    gap-4
                    hover:scale-105
                    hover:shadow-lg
                    transition-all
                    duration-200
                  `}
                >

                  <div
                    className={`
                      p-3
                      rounded-full
                      ${colors.bg}
                    `}
                  >
                    <Icon
                      className={colors.text}
                      size={24}
                    />
                  </div>

                  <div>

                    <p className="text-sm text-gray-400">
                      {kpi.label}
                    </p>

                    <p
                      className={`
                        text-3xl
                        font-bold
                        ${colors.text}
                      `}
                    >
                      {kpi.value}
                    </p>

                  </div>

                </div>
              )
            })}

      </div>


      {/* ========================================= */}
      {/* CHARTS */}
      {/* ========================================= */}

      <div className="grid grid-cols-3 gap-4">

        {/* ----------------------------------------- */}
        {/* DELAY TREND */}
        {/* ----------------------------------------- */}

        <div className="col-span-2 bg-gray-800 rounded-xl p-4">

          <h3 className="text-lg font-semibold mb-4">
            Delay Trend (Recent 7 Days)
          </h3>

          {loading ? (

            <div className="h-[250px] flex items-center justify-center text-gray-500 animate-pulse">
              Loading chart...
            </div>

          ) : trendData.length === 0 ? (

            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No trend data available
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={250}
            >

              <LineChart data={trendData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                />

                <XAxis
                  dataKey="day"
                  stroke="#9ca3af"
                />

                <YAxis
                  stroke="#9ca3af"
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none'
                  }}
                  labelStyle={{
                    color: '#ffffff'
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="delays"
                  name="Delayed Shipments"
                  stroke="#c084fc"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>

            </ResponsiveContainer>

          )}

        </div>


        {/* ----------------------------------------- */}
        {/* ON TIME VS DELAYED */}
        {/* ----------------------------------------- */}

        <div className="bg-gray-800 rounded-xl p-4">

          <h3 className="text-lg font-semibold mb-4">
            On-Time vs Delayed
          </h3>

          {loading ? (

            <div className="h-[250px] flex items-center justify-center text-gray-500 animate-pulse">
              Loading...
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={250}
            >

              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >

                  {pieData.map((entry, index) => (

                    <Cell
                      key={entry.name}
                      fill={pieColors[index]}
                    />

                  ))}

                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none'
                  }}
                />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>


      {/* ========================================= */}
      {/* RECENT SHIPMENTS */}
      {/* ========================================= */}

      <div className="bg-gray-800 rounded-xl p-4">

        <h3 className="text-lg font-semibold mb-4">
          Recent Shipments
        </h3>

        {loading ? (

          <div className="space-y-2 animate-pulse">

            {[1, 2, 3, 4, 5].map((i) => (

              <div
                key={i}
                className="h-8 bg-gray-700 rounded w-full"
              ></div>

            ))}

          </div>

        ) : shipments.length === 0 ? (

          <p className="text-gray-500 text-center py-6">
            No shipments found
          </p>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="text-gray-400 text-sm border-b border-gray-700">

                  <th className="pb-3">
                    Shipment ID
                  </th>

                  <th className="pb-3">
                    Origin
                  </th>

                  <th className="pb-3">
                    Destination
                  </th>

                  <th className="pb-3">
                    Status
                  </th>

                  <th className="pb-3">
                    ETA
                  </th>

                  <th className="pb-3">
                    Risk
                  </th>

                </tr>

              </thead>

              <tbody>

                {shipments.map((s) => (

                  <tr
                    key={s.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >

                    <td className="py-3 font-medium">
                      {s.id}
                    </td>

                    <td className="py-3 text-gray-300">
                      {s.origin}
                    </td>

                    <td className="py-3 text-gray-300">
                      {s.destination}
                    </td>

                    <td
                      className={`
                        py-3
                        font-medium
                        ${
                          s.status === 'Delayed'
                            ? 'text-red-400'
                            : 'text-green-400'
                        }
                      `}
                    >
                      {s.status}
                    </td>

                    <td className="py-3 text-gray-300">
                      {s.eta}
                    </td>

                    <td
                      className={
                        s.riskScore === 1
                          ? 'py-3 text-red-400'
                          : 'py-3 text-green-400'
                      }
                    >
                      {s.riskScore === 1
                        ? 'High'
                        : 'Low'}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  )
}

export default Operations