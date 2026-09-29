import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useNavigate } from "react-router-dom";

// ============================================================
// API
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  background: "#070d19",
  card: "#1f2b3d",
  cardSecondary: "#172235",
  border: "#334155",

  purple: "#a020f0",
  purpleLight: "#b23cff",

  green: "#00e676",
  red: "#ff4d5d",

  text: "#f1f5f9",
  secondaryText: "#94a3b8",
  mutedText: "#64748b",
};

// ============================================================
// NUMBER FORMAT
// ============================================================

function number(value) {
  const parsed = Number(value);

  return Number.isNaN(parsed) ? 0 : parsed;
}

// ============================================================
// CURRENCY
// ============================================================

function currency(value) {
  return `₹${number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ============================================================
// DECISION ROI
// ============================================================

function DecisionROI() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [actionData, setActionData] = useState([]);
  const [marketData, setMarketData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD ROI DATA
  // ==========================================================

  useEffect(() => {
    async function loadROIData() {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          actionResponse,
          marketResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/api/roi/`),
          fetch(`${API_BASE_URL}/api/roi/by-action`),
          fetch(`${API_BASE_URL}/api/roi/by-market`),
        ]);

        if (!summaryResponse.ok) {
          throw new Error("Unable to load ROI summary.");
        }

        if (!actionResponse.ok) {
          throw new Error("Unable to load ROI by action.");
        }

        if (!marketResponse.ok) {
          throw new Error("Unable to load ROI by market.");
        }

        const summaryResult =
          await summaryResponse.json();

        const actionResult =
          await actionResponse.json();

        const marketResult =
          await marketResponse.json();

        setSummary(summaryResult);

        setActionData(
          Array.isArray(actionResult.data)
            ? actionResult.data
            : []
        );

        setMarketData(
          Array.isArray(marketResult.data)
            ? marketResult.data
            : []
        );
      } catch (err) {
        console.error("ROI Error:", err);

        setError(
          "Unable to connect to the Closed-Loop Analytics backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadROIData();
  }, []);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="roi-page loading-page">
        <style>{`

          * {
            box-sizing: border-box;
          }

          .loading-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${COLORS.background};
            color: ${COLORS.text};
            font-family: Arial, Helvetica, sans-serif;
          }

          .loading-box {
            background: ${COLORS.card};
            padding: 40px;
            border-radius: 14px;
            border: 1px solid ${COLORS.border};
            text-align: center;
          }

          .loading-spinner {
            font-size: 35px;
            margin-bottom: 12px;
            color: ${COLORS.purple};
          }

          .loading-box h2 {
            margin: 0 0 8px;
            color: ${COLORS.text};
          }

          .loading-box p {
            margin: 0;
            color: ${COLORS.secondaryText};
          }

        `}</style>

        <div className="loading-box">

          <div className="loading-spinner">
            ⟳
          </div>

          <h2>
            Loading Decision ROI...
          </h2>

          <p>
            Reading closed-loop analytics from backend
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
      <div className="roi-page error-page">
        <style>{`

          * {
            box-sizing: border-box;
          }

          .error-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${COLORS.background};
            font-family: Arial, Helvetica, sans-serif;
          }

          .error-box {
            width: min(600px, 90%);
            padding: 30px;
            background: ${COLORS.card};
            border: 1px solid ${COLORS.red};
            border-radius: 14px;
            text-align: center;
          }

          .error-box h2 {
            color: ${COLORS.red};
            margin-top: 0;
          }

          .error-box p {
            color: ${COLORS.secondaryText};
          }

          .error-help {
            font-size: 13px;
          }

          .error-actions {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
          }

          .retry-button,
          .back-home-button {
            border: none;
            border-radius: 8px;
            padding: 11px 17px;
            cursor: pointer;
            font-weight: 600;
          }

          .retry-button {
            background: ${COLORS.purple};
            color: white;
          }

          .retry-button:hover {
            background: ${COLORS.purpleLight};
          }

          .back-home-button {
            background: #334155;
            color: ${COLORS.text};
          }

          .back-home-button:hover {
            background: #475569;
          }

        `}</style>

        <div className="error-box">

          <h2>
            ROI Data Error
          </h2>

          <p>
            {error}
          </p>

          <p className="error-help">
            Make sure the FastAPI backend is running on
            port 8000 and decision outcome data exists.
          </p>

          <div className="error-actions">

            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>

            <button
              className="back-home-button"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>

          </div>

        </div>
      </div>
    );
  }

  // ==========================================================
  // SAFE SUMMARY VALUES
  // ==========================================================

  const totalDecisions =
    number(summary?.total_decisions);

  const expectedCost =
    number(summary?.expected_cost);

  const actualCost =
    number(summary?.actual_cost);

  const savings =
    number(summary?.savings);

  const roiPercentage =
    number(summary?.roi_percentage);

  const successRate =
    number(summary?.success_rate);

  const onTimeRate =
    number(summary?.on_time_rate);

  // ==========================================================
  // DELIVERY DATA
  // ==========================================================

  const deliveryData = [
    {
      name: "On Time",
      value: onTimeRate,
    },
    {
      name: "Delayed",
      value: Math.max(0, 100 - onTimeRate),
    },
  ];

  // ==========================================================
  // ACTION DATA
  // ==========================================================

  const formattedActionData =
    actionData.map((item) => ({
      action:
        item.Selected_Action ||
        item.selected_action ||
        item.Recommended_Action ||
        item.recommended_action ||
        "Unknown",

      successRate:
        number(item.success_rate),
    }));

  // ==========================================================
  // MARKET DATA
  // ==========================================================

  const formattedMarketData =
    marketData.map((item) => ({
      market:
        item.Market ||
        item.market ||
        "Unknown",

      savings:
        number(item.savings),
    }));

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="roi-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =====================================================
           PAGE
           ===================================================== */

        .roi-page {
          min-height: 100vh;
          padding: 28px;
          background: ${COLORS.background};
          color: ${COLORS.text};
          font-family: Arial, Helvetica, sans-serif;
        }

        /* =====================================================
           HEADER
           ===================================================== */

        .roi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          gap: 20px;
        }

        .roi-header h1 {
          margin: 0 0 8px;
          font-size: 30px;
          color: ${COLORS.text};
        }

        .roi-header p {
          margin: 0;
          color: ${COLORS.secondaryText};
          font-size: 15px;
        }

        .roi-header-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        /* =====================================================
           STATUS
           ===================================================== */

        .roi-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: ${COLORS.card};
          border: 1px solid ${COLORS.border};
          border-radius: 8px;
          color: ${COLORS.text};
          font-size: 14px;
          font-weight: 600;
        }

        .status-dot {
          width: 9px;
          height: 9px;
          background: ${COLORS.green};
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 230, 118, 0.5);
        }

        /* =====================================================
           BUTTON
           ===================================================== */

        .back-home-button {
          border: none;
          border-radius: 8px;
          padding: 11px 17px;
          background: ${COLORS.purple};
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .back-home-button:hover {
          background: ${COLORS.purpleLight};
        }

        /* =====================================================
           KPI GRID
           ===================================================== */

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .kpi-card {
          position: relative;
          background: ${COLORS.card};
          border: 1px solid ${COLORS.border};
          border-radius: 14px;
          padding: 20px;
          min-height: 135px;
          overflow: hidden;
        }

        .kpi-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: ${COLORS.purple};
        }

        .kpi-card:nth-child(2)::before {
          background: ${COLORS.green};
        }

        .kpi-card:nth-child(3)::before {
          background: ${COLORS.green};
        }

        .kpi-card:nth-child(4)::before {
          background: ${COLORS.green};
        }

        .kpi-card:nth-child(5)::before {
          background: ${COLORS.purple};
        }

        .kpi-icon {
          font-size: 23px;
          margin-bottom: 12px;
        }

        .kpi-title {
          color: ${COLORS.secondaryText};
          font-size: 13px;
          margin-bottom: 8px;
        }

        .kpi-value {
          color: ${COLORS.text};
          font-size: 25px;
          font-weight: 700;
        }

        .kpi-subtitle {
          margin-top: 7px;
          color: ${COLORS.mutedText};
          font-size: 12px;
        }

        /* =====================================================
           CHART GRID
           ===================================================== */

        .chart-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin-bottom: 20px;
        }

        .chart-card {
          background: ${COLORS.card};
          border: 1px solid ${COLORS.border};
          border-radius: 14px;
          padding: 20px;
        }

        .chart-card h2 {
          margin: 0 0 5px;
          font-size: 18px;
          color: ${COLORS.text};
        }

        .chart-card p {
          margin: 0 0 15px;
          color: ${COLORS.secondaryText};
          font-size: 13px;
        }

        .full-chart {
          margin-bottom: 20px;
        }

        /* =====================================================
           RECHARTS
           ===================================================== */

        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: ${COLORS.border};
        }

        .recharts-text {
          fill: ${COLORS.secondaryText};
        }

        .recharts-legend-item-text {
          color: ${COLORS.secondaryText} !important;
        }

        /* =====================================================
           TOOLTIP
           ===================================================== */

        .recharts-default-tooltip {
          background-color: ${COLORS.card} !important;
          border: 1px solid ${COLORS.border} !important;
        }

        /* =====================================================
           SUMMARY
           ===================================================== */

        .roi-summary {
          background: ${COLORS.card};
          border: 1px solid ${COLORS.border};
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .summary-header h2 {
          margin: 0 0 6px;
          font-size: 20px;
          color: ${COLORS.text};
        }

        .summary-header p {
          margin: 0;
          color: ${COLORS.secondaryText};
          font-size: 13px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-top: 22px;
        }

        .summary-item {
          padding: 18px;
          background: ${COLORS.cardSecondary};
          border: 1px solid ${COLORS.border};
          border-radius: 10px;
        }

        .summary-item span {
          display: block;
          color: ${COLORS.secondaryText};
          font-size: 13px;
          margin-bottom: 8px;
        }

        .summary-item strong {
          color: ${COLORS.text};
          font-size: 21px;
        }

        /* =====================================================
           CLOSED LOOP
           ===================================================== */

        .closed-loop {
          background: ${COLORS.card};
          border: 1px solid ${COLORS.border};
          border-radius: 14px;
          padding: 24px;
        }

        .closed-loop h2 {
          margin: 0 0 22px;
          font-size: 20px;
          color: ${COLORS.text};
        }

        .loop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .loop-step {
          flex: 1;
          text-align: center;
          padding: 18px 10px;
          border: 1px solid ${COLORS.border};
          border-radius: 10px;
          background: ${COLORS.cardSecondary};
        }

        .loop-number {
          width: 38px;
          height: 38px;
          margin: 0 auto 10px;
          border-radius: 50%;
          background: ${COLORS.purple};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .loop-step strong {
          display: block;
          margin-bottom: 5px;
          color: ${COLORS.text};
        }

        .loop-step span {
          color: ${COLORS.secondaryText};
          font-size: 12px;
        }

        .loop-arrow {
          font-size: 24px;
          color: ${COLORS.purple};
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 1100px) {

          .kpi-grid {
            grid-template-columns: repeat(3, 1fr);
          }

        }

        @media (max-width: 800px) {

          .roi-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .roi-header-actions {
            flex-wrap: wrap;
          }

          .chart-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .loop {
            flex-direction: column;
          }

          .loop-step {
            width: 100%;
          }

          .loop-arrow {
            transform: rotate(90deg);
          }

        }

        @media (max-width: 600px) {

          .roi-page {
            padding: 16px;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .roi-header-actions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

        }

      `}</style>

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="roi-header">

        <div>

          <h1>
            Decision ROI
          </h1>

          <p>
            Closed-loop performance and prescription impact
          </p>

        </div>

        <div className="roi-header-actions">

          <div className="roi-status">

            <span className="status-dot"></span>

            Analytics Active

          </div>

          <button
            className="back-home-button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </div>

      {/* =====================================================
          KPI CARDS
          ===================================================== */}

      <div className="kpi-grid">

        <div className="kpi-card">

          <div className="kpi-icon">
            📦
          </div>

          <div className="kpi-title">
            Total Decisions
          </div>

          <div className="kpi-value">
            {totalDecisions}
          </div>

          <div className="kpi-subtitle">
            Evaluated decisions
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-icon">
            💰
          </div>

          <div className="kpi-title">
            Cost Saving
          </div>

          <div className="kpi-value">
            {currency(savings)}
          </div>

          <div className="kpi-subtitle">
            Expected vs actual cost
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-icon">
            🚚
          </div>

          <div className="kpi-title">
            On-Time Rate
          </div>

          <div className="kpi-value">
            {onTimeRate.toFixed(1)}%
          </div>

          <div className="kpi-subtitle">
            Delivery performance
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-icon">
            ✓
          </div>

          <div className="kpi-title">
            Action Success
          </div>

          <div className="kpi-value">
            {successRate.toFixed(1)}%
          </div>

          <div className="kpi-subtitle">
            Successful prescriptions
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-icon">
            📈
          </div>

          <div className="kpi-title">
            ROI
          </div>

          <div className="kpi-value">
            {roiPercentage.toFixed(1)}%
          </div>

          <div className="kpi-subtitle">
            Return on prescription
          </div>

        </div>

      </div>

      {/* =====================================================
          EXPECTED VS ACTUAL + DELIVERY
          ===================================================== */}

      <div className="chart-grid">

        {/* COST */}

        <div className="chart-card">

          <h2>
            Expected vs Actual Cost
          </h2>

          <p>
            Cost impact after applying prescriptions
          </p>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={[
                {
                  name: "Expected",
                  cost: expectedCost,
                },
                {
                  name: "Actual",
                  cost: actualCost,
                },
              ]}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.border}
              />

              <XAxis
                dataKey="name"
                stroke={COLORS.secondaryText}
              />

              <YAxis
                stroke={COLORS.secondaryText}
              />

              <Tooltip
                formatter={(value) =>
                  currency(value)
                }
                contentStyle={{
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              />

              <Legend />

              <Bar
                dataKey="cost"
                name="Cost"
                fill={COLORS.purple}
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* DELIVERY */}

        <div className="chart-card">

          <h2>
            Delivery Performance
          </h2>

          <p>
            On-time vs delayed shipments
          </p>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={deliveryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >

                {deliveryData.map(
                  (entry, index) => (

                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? COLORS.green
                          : COLORS.red
                      }
                    />

                  )
                )}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* =====================================================
          ACTION + MARKET
          ===================================================== */}

      <div className="chart-grid">

        {/* ACTION PERFORMANCE */}

        <div className="chart-card">

          <h2>
            Prescription Action Performance
          </h2>

          <p>
            Success rate by selected action
          </p>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={formattedActionData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.border}
              />

              <XAxis
                dataKey="action"
                stroke={COLORS.secondaryText}
              />

              <YAxis
                domain={[0, 100]}
                stroke={COLORS.secondaryText}
              />

              <Tooltip
                formatter={(value) =>
                  `${number(value).toFixed(1)}%`
                }
                contentStyle={{
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              />

              <Bar
                dataKey="successRate"
                name="Success Rate (%)"
                fill={COLORS.green}
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* MARKET */}

        <div className="chart-card">

          <h2>
            Savings by Market
          </h2>

          <p>
            Cost saving generated across markets
          </p>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={formattedMarketData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.border}
              />

              <XAxis
                dataKey="market"
                angle={-15}
                textAnchor="end"
                height={70}
                stroke={COLORS.secondaryText}
              />

              <YAxis
                stroke={COLORS.secondaryText}
              />

              <Tooltip
                formatter={(value) =>
                  currency(value)
                }
                contentStyle={{
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              />

              <Bar
                dataKey="savings"
                name="Savings (₹)"
                fill={COLORS.purple}
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* =====================================================
          MARKET ANALYTICS
          ===================================================== */}

      <div className="chart-card full-chart">

        <h2>
          Cost Saving by Market
        </h2>

        <p>
          Prescription impact across markets
        </p>

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <LineChart
            data={formattedMarketData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.border}
            />

            <XAxis
              dataKey="market"
              stroke={COLORS.secondaryText}
            />

            <YAxis
              stroke={COLORS.secondaryText}
            />

            <Tooltip
              formatter={(value) =>
                currency(value)
              }
              contentStyle={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="savings"
              name="Cost Saving (₹)"
              stroke={COLORS.purple}
              strokeWidth={3}
              dot={{
                r: 4,
                fill: COLORS.purple,
              }}
              activeDot={{
                r: 6,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* =====================================================
          ROI SUMMARY
          ===================================================== */}

      <div className="roi-summary">

        <div className="summary-header">

          <h2>
            ROI Summary
          </h2>

          <p>
            Overall impact of supply-chain prescriptions
          </p>

        </div>

        <div className="summary-grid">

          <div className="summary-item">

            <span>
              Expected Cost
            </span>

            <strong>
              {currency(expectedCost)}
            </strong>

          </div>

          <div className="summary-item">

            <span>
              Actual Cost
            </span>

            <strong>
              {currency(actualCost)}
            </strong>

          </div>

          <div className="summary-item">

            <span>
              Total Saving
            </span>

            <strong>
              {currency(savings)}
            </strong>

          </div>

          <div className="summary-item">

            <span>
              ROI
            </span>

            <strong>
              {roiPercentage.toFixed(2)}%
            </strong>

          </div>

        </div>

      </div>

      {/* =====================================================
          CLOSED LOOP
          ===================================================== */}

      <div className="closed-loop">

        <h2>
          Closed-Loop Decision Process
        </h2>

        <div className="loop">

          <div className="loop-step">

            <div className="loop-number">
              1
            </div>

            <strong>
              Prediction
            </strong>

            <span>
              Risk is identified
            </span>

          </div>

          <div className="loop-arrow">
            →
          </div>

          <div className="loop-step">

            <div className="loop-number">
              2
            </div>

            <strong>
              Recommendation
            </strong>

            <span>
              Best action prescribed
            </span>

          </div>

          <div className="loop-arrow">
            →
          </div>

          <div className="loop-step">

            <div className="loop-number">
              3
            </div>

            <strong>
              Decision
            </strong>

            <span>
              Manager selects action
            </span>

          </div>

          <div className="loop-arrow">
            →
          </div>

          <div className="loop-step">

            <div className="loop-number">
              4
            </div>

            <strong>
              Outcome
            </strong>

            <span>
              Actual result recorded
            </span>

          </div>

          <div className="loop-arrow">
            →
          </div>

          <div className="loop-step">

            <div className="loop-number">
              5
            </div>

            <strong>
              Learning
            </strong>

            <span>
              System improves
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DecisionROI;