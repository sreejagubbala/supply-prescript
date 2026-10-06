import { useEffect, useMemo, useState } from "react";

import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

<<<<<<< HEAD
// Mock data — will be replaced with real API data on Day 7
const mockKpis = [
  { label: 'Total Shipments', value: 128, icon: Truck, color: 'purple' },
  { label: 'On-Time', value: 96, icon: CheckCircle, color: 'green' },
  { label: 'Delayed', value: 32, icon: AlertTriangle, color: 'red' },
]
const mockTrendData = [
  { day: 'Mon', delays: 4 },
  { day: 'Tue', delays: 7 },
  { day: 'Wed', delays: 3 },
  { day: 'Thu', delays: 9 },
  { day: 'Fri', delays: 5 },
  { day: 'Sat', delays: 2 },
  { day: 'Sun', delays: 6 },
]
=======
// ============================================================
// API
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";
>>>>>>> origin/main

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  background: "#070d19",
  card: "#111a2b",
  cardHover: "#172235",
  border: "#263449",

  purple: "#a855f7",
  purpleLight: "#c084fc",

  green: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#38bdf8",

  text: "#f8fafc",
  secondary: "#94a3b8",
  muted: "#64748b",
};

// ============================================================
// HELPERS
// ============================================================

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function percent(value) {
  return `${number(value).toFixed(1)}%`;
}

// ============================================================
// TOOLTIP
// ============================================================

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      style={{
        background: "#0b1220",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: "10px 12px",
        boxShadow: "0 12px 30px rgba(0,0,0,.35)",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          color: COLORS.text,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.dataKey}
          style={{
            margin: "3px 0",
            color: COLORS.secondary,
            fontSize: 12,
          }}
        >
          {item.name}:{" "}
          <strong style={{ color: COLORS.text }}>
            {item.value}
          </strong>
        </p>
      ))}
    </div>
  );
}

// ============================================================
// KPI CARD
// ============================================================

function KPI({ label, value, description, icon, accent }) {
  return (
    <div
      className="ops-kpi"
      style={{
        borderTop: `2px solid ${accent}`,
      }}
    >
      <div className="ops-kpi-top">
        <div
          className="ops-kpi-icon"
          style={{
            background: `${accent}18`,
            color: accent,
          }}
        >
          {icon}
        </div>

        <span
          className="ops-kpi-label"
          style={{ color: COLORS.secondary }}
        >
          {label}
        </span>
      </div>

      <div className="ops-kpi-value">
        {value}
      </div>

      <div className="ops-kpi-description">
        {description}
      </div>
    </div>
  );
}

// ============================================================
// OPERATIONS
// ============================================================

function Operations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  async function loadOperations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/operations/summary`
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        );
      }

      const result = await response.json();

      setData(result);
    } catch (err) {
      console.error("Operations error:", err);

      setError(
        "Unable to load operations data from the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOperations();
  }, []);

  // ==========================================================
  // NORMALIZED DATA
  // ==========================================================

  const totalShipments = number(
    data?.totalShipments
  );

  const onTimeCount = number(
    data?.onTimeCount
  );

  const delayedCount = number(
    data?.delayedCount
  );

  const onTimeRate =
    totalShipments > 0
      ? (onTimeCount / totalShipments) * 100
      : 0;

  const trendData = Array.isArray(
    data?.trendData
  )
    ? data.trendData
    : [];

  const shipments = Array.isArray(
    data?.recentShipments
  )
    ? data.recentShipments
    : [];

  // ==========================================================
  // PIE DATA
  // ==========================================================

  const pieData = useMemo(
    () => [
      {
        name: "On-Time",
        value: onTimeCount,
      },
      {
        name: "Delayed",
        value: delayedCount,
      },
    ],
    [onTimeCount, delayedCount]
  );

  const pieColors = [
    COLORS.green,
    COLORS.red,
  ];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="operations-page">
        <style>{styles}</style>

        <div className="ops-loading">
          <div className="ops-loading-spinner">
            ◌
          </div>

          <h2>
            Loading Operations Control Center
          </h2>

          <p>
            Reading closed-loop shipment outcomes...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="operations-page">
        <style>{styles}</style>

        <div className="ops-error">
          <div className="ops-error-icon">
            !
          </div>

          <h2>
            Operations Data Unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            className="ops-primary-button"
            onClick={loadOperations}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="operations-page">
      <style>{styles}</style>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="ops-header">
        <div>
          <div className="ops-eyebrow">
            SUPPLY PRESCRIPT / OPERATIONS
          </div>

          <h1>
            Operations Control Center
          </h1>

          <p>
            Monitor shipment execution, delivery
            performance, and operational risk.
          </p>
        </div>

        <div className="ops-live-status">
          <span className="ops-live-dot" />

          <div>
            <strong>
              Live Dataset
            </strong>

            <small>
              Closed-loop outcomes
            </small>
          </div>
        </div>
      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="ops-kpi-grid">

        <KPI
          label="TOTAL SHIPMENTS"
          value={totalShipments}
          description="Processed in closed-loop dataset"
          icon="▣"
          accent={COLORS.purple}
        />

        <KPI
          label="ON-TIME"
          value={onTimeCount}
          description="Shipments delivered on schedule"
          icon="✓"
          accent={COLORS.green}
        />

        <KPI
          label="DELAYED"
          value={delayedCount}
          description="Shipments requiring attention"
          icon="!"
          accent={COLORS.red}
        />

        <KPI
          label="ON-TIME RATE"
          value={percent(onTimeRate)}
          description="Overall delivery performance"
          icon="◔"
          accent={COLORS.blue}
        />

      </div>

      {/* ======================================================
          PERFORMANCE SUMMARY
      ====================================================== */}

      <div className="ops-performance-card">

        <div className="ops-performance-heading">
          <div>
            <h2>
              Delivery Performance
            </h2>

            <p>
              Current execution status across
              processed shipments.
            </p>
          </div>

          <div className="ops-performance-rate">
            {percent(onTimeRate)}
            <span>
              on-time
            </span>
          </div>
        </div>

        <div className="ops-progress-track">
          <div
            className="ops-progress-fill"
            style={{
              width: `${Math.min(
                onTimeRate,
                100
              )}%`,
            }}
          />
        </div>

        <div className="ops-performance-footer">
          <span>
            <i className="status-dot green" />
            {onTimeCount} On-Time
          </span>

          <span>
            <i className="status-dot red" />
            {delayedCount} Delayed
          </span>

          <span>
            Total: {totalShipments}
          </span>
        </div>

      </div>

      {/* ======================================================
          CHARTS
      ====================================================== */}

      <div className="ops-chart-grid">

        {/* DELAY TREND */}

        <div className="ops-card ops-large-card">

          <div className="ops-card-heading">
            <div>
              <h3>
                Delay Trend
              </h3>

              <p>
                Recent operational delay activity
              </p>
            </div>

            <span className="ops-card-badge">
              7 DAYS
            </span>
          </div>

          {trendData.length === 0 ? (
            <div className="ops-empty-chart">
              <div>—</div>

              <span>
                No trend data available
              </span>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={285}
            >
              <LineChart
                data={trendData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#243247"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke={COLORS.muted}
                  tick={{
                    fill: COLORS.secondary,
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  stroke={COLORS.muted}
                  tick={{
                    fill: COLORS.secondary,
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={<DarkTooltip />}
                />

                <Line
                  type="monotone"
                  dataKey="delays"
                  name="Delayed Shipments"
                  stroke={COLORS.purple}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: COLORS.purple,
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

        </div>

        {/* ON TIME / DELAYED */}

        <div className="ops-card">

          <div className="ops-card-heading">
            <div>
              <h3>
                Shipment Status
              </h3>

              <p>
                On-time vs delayed
              </p>
            </div>
          </div>

          <div className="ops-pie-wrapper">

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
                  cy="48%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  stroke="none"
                >
                  {pieData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={pieColors[index]}
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  content={<DarkTooltip />}
                />

                <Legend
                  verticalAlign="bottom"
                  height={30}
                  formatter={(value) => (
                    <span
                      style={{
                        color:
                          COLORS.secondary,
                        fontSize: 12,
                      }}
                    >
                      {value}
                    </span>
                  )}
                />

              </PieChart>
            </ResponsiveContainer>

            <div className="ops-pie-center">
              <strong>
                {totalShipments}
              </strong>

              <span>
                Shipments
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          OPERATIONAL INSIGHTS
      ====================================================== */}

      <div className="ops-insights-grid">

        <div className="ops-insight">
          <div
            className="ops-insight-icon"
            style={{
              color: COLORS.green,
              background: `${COLORS.green}18`,
            }}
          >
            ✓
          </div>

          <div>
            <strong>
              On-Time Performance
            </strong>

            <p>
              {onTimeCount} of {totalShipments}{" "}
              processed shipments are currently
              marked on-time.
            </p>
          </div>
        </div>

        <div className="ops-insight">
          <div
            className="ops-insight-icon"
            style={{
              color: COLORS.red,
              background: `${COLORS.red}18`,
            }}
          >
            !
          </div>

          <div>
            <strong>
              Delay Monitoring
            </strong>

            <p>
              {delayedCount} shipment
              {delayedCount !== 1
                ? "s"
                : ""}{" "}
              recorded a delayed outcome and
              should be reviewed.
            </p>
          </div>
        </div>

        <div className="ops-insight">
          <div
            className="ops-insight-icon"
            style={{
              color: COLORS.blue,
              background: `${COLORS.blue}18`,
            }}
          >
            ↗
          </div>

          <div>
            <strong>
              Closed-Loop Coverage
            </strong>

            <p>
              Operations metrics are generated
              from the same outcome dataset used
              by Decision History and ROI.
            </p>
          </div>
        </div>

      </div>

      {/* ======================================================
          RECENT SHIPMENTS
      ====================================================== */}

      <div className="ops-card ops-table-card">

        <div className="ops-card-heading">
          <div>
            <h3>
              Recent Shipments
            </h3>

            <p>
              Latest processed shipment outcomes
            </p>
          </div>

          <span className="ops-record-count">
            {shipments.length} records
          </span>
        </div>

        {shipments.length === 0 ? (
          <div className="ops-empty-table">
            No shipments found.
          </div>
        ) : (
          <div className="ops-table-wrapper">

            <table className="ops-table">

              <thead>
                <tr>
                  <th>SHIPMENT ID</th>
                  <th>ORIGIN</th>
                  <th>DESTINATION</th>
                  <th>STATUS</th>
                  <th>DECISION DATE</th>
                  <th>RISK</th>
                </tr>
              </thead>

              <tbody>

                {shipments.map(
                  (shipment, index) => {

                    const delayed =
                      shipment.status ===
                      "Delayed";

                    const highRisk =
                      number(
                        shipment.riskScore
                      ) === 1;

                    return (
                      <tr
                        key={
                          shipment.id ||
                          index
                        }
                      >

                        <td>
                          <span className="shipment-id">
                            {shipment.id}
                          </span>
                        </td>

                        <td>
                          {shipment.origin ||
                            "—"}
                        </td>

                        <td>
                          {shipment.destination ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`status-pill ${
                              delayed
                                ? "status-delayed"
                                : "status-ontime"
                            }`}
                          >
                            <i />
                            {delayed
                              ? "Delayed"
                              : "On-Time"}
                          </span>
                        </td>

                        <td>
                          {shipment.eta ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`risk-pill ${
                              highRisk
                                ? "risk-high"
                                : "risk-low"
                            }`}
                          >
                            {highRisk
                              ? "High"
                              : "Low"}
                          </span>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ======================================================
          FOOTER NOTE
      ====================================================== */}

      <div className="ops-data-note">
        <span>●</span>

        <p>
          Data source:{" "}
          <strong>
            decision_outcomes.csv
          </strong>
          {" "}— the closed-loop outcome dataset
          used across Supply Prescript analytics.
        </p>
      </div>

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = `

  * {
    box-sizing: border-box;
  }

  .operations-page {
    min-height: 100vh;
    padding: 30px;
    background: ${COLORS.background};
    color: ${COLORS.text};
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  /* ========================================================
     HEADER
     ======================================================== */

  .ops-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 28px;
  }

  .ops-eyebrow {
    color: ${COLORS.purpleLight};
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.8px;
    margin-bottom: 8px;
  }

  .ops-header h1 {
    margin: 0;
    font-size: 30px;
    line-height: 1.2;
    font-weight: 750;
    letter-spacing: -0.7px;
  }

  .ops-header p {
    margin: 8px 0 0;
    color: ${COLORS.secondary};
    font-size: 14px;
  }

  .ops-live-status {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.card};
    border-radius: 10px;
  }

  .ops-live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${COLORS.green};
    box-shadow: 0 0 12px ${COLORS.green};
  }

  .ops-live-status strong {
    display: block;
    font-size: 12px;
  }

  .ops-live-status small {
    display: block;
    margin-top: 2px;
    color: ${COLORS.muted};
    font-size: 10px;
  }

  /* ========================================================
     KPI
     ======================================================== */

  .ops-kpi-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 18px;
  }

  .ops-kpi {
    min-height: 145px;
    padding: 20px;
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    transition:
      transform .2s ease,
      border-color .2s ease;
  }

  .ops-kpi:hover {
    transform: translateY(-2px);
    border-color: #3b4b63;
  }

  .ops-kpi-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ops-kpi-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .ops-kpi-label {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .ops-kpi-value {
    margin-top: 17px;
    font-size: 29px;
    font-weight: 750;
    letter-spacing: -1px;
  }

  .ops-kpi-description {
    margin-top: 5px;
    color: ${COLORS.muted};
    font-size: 11px;
  }

  /* ========================================================
     PERFORMANCE
     ======================================================== */

  .ops-performance-card {
    padding: 22px;
    margin-bottom: 18px;
    background:
      linear-gradient(
        135deg,
        #111a2b 0%,
        #0f1727 100%
      );
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
  }

  .ops-performance-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .ops-performance-heading h2 {
    margin: 0;
    font-size: 16px;
  }

  .ops-performance-heading p {
    margin: 5px 0 0;
    color: ${COLORS.muted};
    font-size: 12px;
  }

  .ops-performance-rate {
    font-size: 25px;
    font-weight: 800;
    color: ${COLORS.green};
    text-align: right;
  }

  .ops-performance-rate span {
    display: block;
    color: ${COLORS.muted};
    font-size: 10px;
    font-weight: 500;
  }

  .ops-progress-track {
    height: 8px;
    margin-top: 20px;
    background: #263449;
    border-radius: 99px;
    overflow: hidden;
  }

  .ops-progress-fill {
    height: 100%;
    background:
      linear-gradient(
        90deg,
        ${COLORS.green},
        #4ade80
      );
    border-radius: inherit;
    transition: width .5s ease;
  }

  .ops-performance-footer {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 11px;
    color: ${COLORS.secondary};
    font-size: 11px;
  }

  .ops-performance-footer span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
  }

  .status-dot.green {
    background: ${COLORS.green};
  }

  .status-dot.red {
    background: ${COLORS.red};
  }

  /* ========================================================
     CHARTS
     ======================================================== */

  .ops-chart-grid {
    display: grid;
    grid-template-columns:
      minmax(0, 2fr)
      minmax(320px, 1fr);
    gap: 18px;
    margin-bottom: 18px;
  }

  .ops-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 20px;
  }

  .ops-card-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 14px;
  }

  .ops-card-heading h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
  }

  .ops-card-heading p {
    margin: 5px 0 0;
    color: ${COLORS.muted};
    font-size: 11px;
  }

  .ops-card-badge,
  .ops-record-count {
    padding: 5px 8px;
    border: 1px solid ${COLORS.border};
    border-radius: 6px;
    color: ${COLORS.secondary};
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .8px;
  }

  .ops-empty-chart {
    height: 285px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: ${COLORS.muted};
    gap: 7px;
  }

  .ops-empty-chart div {
    font-size: 28px;
    color: ${COLORS.purple};
  }

  .ops-pie-wrapper {
    position: relative;
  }

  .ops-pie-center {
    position: absolute;
    top: 46%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
  }

  .ops-pie-center strong {
    display: block;
    font-size: 25px;
  }

  .ops-pie-center span {
    color: ${COLORS.muted};
    font-size: 10px;
  }

  /* ========================================================
     INSIGHTS
     ======================================================== */

  .ops-insights-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 18px;
  }

  .ops-insight {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 17px;
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
  }

  .ops-insight-icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    font-weight: 800;
  }

  .ops-insight strong {
    display: block;
    font-size: 12px;
  }

  .ops-insight p {
    margin: 5px 0 0;
    color: ${COLORS.muted};
    font-size: 11px;
    line-height: 1.55;
  }

  /* ========================================================
     TABLE
     ======================================================== */

  .ops-table-card {
    padding: 20px;
  }

  .ops-table-wrapper {
    overflow-x: auto;
  }

  .ops-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 720px;
  }

  .ops-table th {
    padding: 12px 10px;
    text-align: left;
    color: ${COLORS.muted};
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .8px;
    border-bottom: 1px solid ${COLORS.border};
  }

  .ops-table td {
    padding: 15px 10px;
    color: ${COLORS.secondary};
    font-size: 12px;
    border-bottom: 1px solid
      rgba(51,65,85,.45);
  }

  .ops-table tbody tr {
    transition: background .15s ease;
  }

  .ops-table tbody tr:hover {
    background: rgba(255,255,255,.025);
  }

  .shipment-id {
    color: ${COLORS.text};
    font-weight: 700;
  }

  .status-pill,
  .risk-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
  }

  .status-pill i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }

  .status-ontime {
    color: ${COLORS.green};
    background: rgba(34,197,94,.10);
  }

  .status-ontime i {
    background: ${COLORS.green};
  }

  .status-delayed {
    color: ${COLORS.red};
    background: rgba(239,68,68,.10);
  }

  .status-delayed i {
    background: ${COLORS.red};
  }

  .risk-high {
    color: ${COLORS.red};
    background: rgba(239,68,68,.10);
  }

  .risk-low {
    color: ${COLORS.green};
    background: rgba(34,197,94,.10);
  }

  .ops-empty-table {
    padding: 45px;
    text-align: center;
    color: ${COLORS.muted};
  }

  /* ========================================================
     FOOTER
     ======================================================== */

  .ops-data-note {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 15px;
    color: ${COLORS.muted};
    font-size: 10px;
  }

  .ops-data-note span {
    color: ${COLORS.green};
  }

  .ops-data-note p {
    margin: 0;
  }

  .ops-data-note strong {
    color: ${COLORS.secondary};
  }

  /* ========================================================
     LOADING / ERROR
     ======================================================== */

  .ops-loading,
  .ops-error {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .ops-loading-spinner {
    color: ${COLORS.purpleLight};
    font-size: 42px;
    animation: ops-spin 1.2s linear infinite;
  }

  @keyframes ops-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .ops-loading h2,
  .ops-error h2 {
    margin: 15px 0 6px;
    font-size: 19px;
  }

  .ops-loading p,
  .ops-error p {
    margin: 0 0 20px;
    color: ${COLORS.secondary};
    font-size: 13px;
  }

  .ops-error-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(239,68,68,.12);
    color: ${COLORS.red};
    font-size: 24px;
    font-weight: 800;
  }

  .ops-primary-button {
    border: none;
    border-radius: 8px;
    padding: 10px 17px;
    background: ${COLORS.purple};
    color: white;
    font-weight: 700;
    cursor: pointer;
  }

  .ops-primary-button:hover {
    background: ${COLORS.purpleLight};
  }

  /* ========================================================
     RESPONSIVE
     ======================================================== */

  @media (max-width: 1100px) {

    .ops-kpi-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .ops-chart-grid {
      grid-template-columns: 1fr;
    }

    .ops-insights-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {

    .operations-page {
      padding: 18px;
    }

    .ops-header {
      flex-direction: column;
    }

    .ops-header h1 {
      font-size: 25px;
    }

    .ops-kpi-grid {
      grid-template-columns: 1fr;
    }

    .ops-performance-footer {
      flex-direction: column;
      gap: 7px;
    }
  }

`;

export default Operations;