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
  // LOAD ROI DATA FROM MEMBER 5 BACKEND
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
        console.error(err);

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

        <style>{`

          .loading-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7f8fa;
            font-family: Arial, Helvetica, sans-serif;
          }

          .loading-box {
            background: white;
            padding: 40px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            text-align: center;
          }

          .loading-spinner {
            font-size: 35px;
            margin-bottom: 12px;
          }

          .loading-box h2 {
            margin: 0 0 8px;
          }

          .loading-box p {
            margin: 0;
            color: #6b7280;
          }

        `}</style>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="roi-page error-page">

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

        <style>{`

          .error-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7f8fa;
            font-family: Arial, Helvetica, sans-serif;
          }

          .error-box {
            width: min(600px, 90%);
            padding: 30px;
            background: white;
            border: 1px solid #fecaca;
            border-radius: 12px;
            text-align: center;
          }

          .error-box h2 {
            color: #991b1b;
            margin-top: 0;
          }

          .error-box p {
            color: #6b7280;
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
            background: #111827;
            color: white;
          }

          .back-home-button {
            background: #e5e7eb;
            color: #111827;
          }

        `}</style>

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

        .roi-page {
          min-height: 100vh;
          padding: 28px;
          background: #f7f8fa;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* HEADER */

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
        }

        .roi-header p {
          margin: 0;
          color: #6b7280;
          font-size: 15px;
        }

        .roi-header-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .roi-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .status-dot {
          width: 9px;
          height: 9px;
          background: #22c55e;
          border-radius: 50%;
        }

        .back-home-button {
          border: none;
          border-radius: 8px;
          padding: 11px 17px;
          background: #111827;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .back-home-button:hover {
          background: #374151;
        }

        /* KPI */

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .kpi-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          min-height: 130px;
        }

        .kpi-icon {
          font-size: 23px;
          margin-bottom: 12px;
        }

        .kpi-title {
          color: #6b7280;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .kpi-value {
          font-size: 25px;
          font-weight: 700;
        }

        .kpi-subtitle {
          margin-top: 7px;
          color: #9ca3af;
          font-size: 12px;
        }

        /* CHARTS */

        .chart-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin-bottom: 20px;
        }

        .chart-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .chart-card h2 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .chart-card p {
          margin: 0 0 15px;
          color: #6b7280;
          font-size: 13px;
        }

        .full-chart {
          margin-bottom: 20px;
        }

        /* SUMMARY */

        .roi-summary {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .summary-header h2 {
          margin: 0 0 6px;
          font-size: 20px;
        }

        .summary-header p {
          margin: 0;
          color: #6b7280;
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
          background: #f9fafb;
          border-radius: 9px;
        }

        .summary-item span {
          display: block;
          color: #6b7280;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .summary-item strong {
          font-size: 21px;
        }

        /* CLOSED LOOP */

        .closed-loop {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
        }

        .closed-loop h2 {
          margin: 0 0 22px;
          font-size: 20px;
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
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #f9fafb;
        }

        .loop-number {
          width: 38px;
          height: 38px;
          margin: 0 auto 10px;
          border-radius: 50%;
          background: #111827;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .loop-step strong {
          display: block;
          margin-bottom: 5px;
        }

        .loop-step span {
          color: #6b7280;
          font-size: 12px;
        }

        .loop-arrow {
          font-size: 24px;
          color: #9ca3af;
        }

        /* RESPONSIVE */

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

      {/* HEADER */}

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

      {/* KPI CARDS */}

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

      {/* COST + DELIVERY */}

      <div className="chart-grid">

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
              />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  currency(value)
                }
              />

              <Legend />

              <Bar
                dataKey="cost"
                name="Cost"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

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

      {/* ACTION + MARKET */}

      <div className="chart-grid">

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
              />

              <XAxis
                dataKey="action"
              />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip
                formatter={(value) =>
                  `${number(value).toFixed(1)}%`
                }
              />

              <Bar
                dataKey="successRate"
                name="Success Rate (%)"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

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
              />

              <XAxis
                dataKey="market"
                angle={-15}
                textAnchor="end"
                height={70}
              />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  currency(value)
                }
              />

              <Bar
                dataKey="savings"
                name="Savings (₹)"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* MARKET ANALYTICS */}

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
            />

            <XAxis
              dataKey="market"
            />

            <YAxis />

            <Tooltip
              formatter={(value) =>
                currency(value)
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="savings"
              name="Cost Saving (₹)"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* ROI SUMMARY */}

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

      {/* CLOSED LOOP */}

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
