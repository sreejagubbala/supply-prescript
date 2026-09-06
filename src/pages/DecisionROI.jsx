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
// DATA
// ============================================================

const costData = [
  { name: "Expected", cost: 12500 },
  { name: "Actual", cost: 10150 },
];

const deliveryData = [
  { name: "On Time", value: 75 },
  { name: "Delayed", value: 25 },
];

const actionData = [
  {
    action: "Upgrade Shipping",
    successRate: 82,
  },
  {
    action: "Prioritize",
    successRate: 76,
  },
  {
    action: "Split Shipment",
    successRate: 70,
  },
];

const shippingModeData = [
  {
    mode: "Standard Class",
    savings: 980,
  },
  {
    mode: "Second Class",
    savings: 620,
  },
  {
    mode: "First Class",
    savings: 450,
  },
  {
    mode: "Same Day",
    savings: 300,
  },
];

const marketData = [
  {
    market: "Pacific Asia",
    savings: 620,
  },
  {
    market: "Europe",
    savings: 540,
  },
  {
    market: "USCA",
    savings: 480,
  },
  {
    market: "LATAM",
    savings: 390,
  },
  {
    market: "Africa",
    savings: 280,
  },
];

// ============================================================
// DECISION ROI
// ============================================================

function DecisionROI() {
  // IMPORTANT:
  // Hook must be inside component but BEFORE return.
  const navigate = useNavigate();

  return (
    <div className="roi-page">

      {/* ================================================== */}
      {/* INLINE CSS */}
      {/* ================================================== */}

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

        /* ==================================================
           HEADER
        ================================================== */

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
          display: inline-block;
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
          transition: 0.2s;
        }

        .back-home-button:hover {
          background: #374151;
          transform: translateY(-1px);
        }

        /* ==================================================
           KPI CARDS
        ================================================== */

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

        /* ==================================================
           CHART GRID
        ================================================== */

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

        /* ==================================================
           ROI SUMMARY
        ================================================== */

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

        /* ==================================================
           CLOSED LOOP
        ================================================== */

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

        /* ==================================================
           RESPONSIVE
        ================================================== */

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

          .roi-status,
          .back-home-button {
            justify-content: center;
            text-align: center;
          }

        }

      `}</style>

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

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

      {/* ================================================== */}
      {/* KPI CARDS */}
      {/* ================================================== */}

      <div className="kpi-grid">

        <div className="kpi-card">

          <div className="kpi-icon">
            📦
          </div>

          <div className="kpi-title">
            Total Shipments
          </div>

          <div className="kpi-value">
            20
          </div>

          <div className="kpi-subtitle">
            Evaluated shipments
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
            ₹2,350
          </div>

          <div className="kpi-subtitle">
            Total estimated saving
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
            75%
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
            76%
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
            18.8%
          </div>

          <div className="kpi-subtitle">
            Return on prescription
          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* COST + DELIVERY */}
      {/* ================================================== */}

      <div className="chart-grid">

        <div className="chart-card">

          <h2>
            Expected vs Actual Cost
          </h2>

          <p>
            Cost impact after applying prescriptions
          </p>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={costData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

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

          <ResponsiveContainer width="100%" height={300}>

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

                {deliveryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                  />
                ))}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* ================================================== */}
      {/* ACTION + SHIPPING MODE */}
      {/* ================================================== */}

      <div className="chart-grid">

        <div className="chart-card">

          <h2>
            Prescription Action Performance
          </h2>

          <p>
            Success rate by recommended action
          </p>

          <ResponsiveContainer width="100%" height={320}>

            <BarChart data={actionData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="action" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Bar
                dataKey="successRate"
                name="Success Rate (%)"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h2>
            Savings by Shipping Mode
          </h2>

          <p>
            Cost saving generated by shipping mode
          </p>

          <ResponsiveContainer width="100%" height={320}>

            <BarChart data={shippingModeData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="mode"
                angle={-15}
                textAnchor="end"
                height={70}
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="savings"
                name="Savings (₹)"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* ================================================== */}
      {/* MARKET ANALYTICS */}
      {/* ================================================== */}

      <div className="chart-card full-chart">

        <h2>
          Cost Saving by Market
        </h2>

        <p>
          Prescription impact across markets
        </p>

        <ResponsiveContainer width="100%" height={320}>

          <LineChart data={marketData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="market" />

            <YAxis />

            <Tooltip />

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

      {/* ================================================== */}
      {/* ROI SUMMARY */}
      {/* ================================================== */}

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
              ₹12,500
            </strong>

          </div>

          <div className="summary-item">

            <span>
              Actual Cost
            </span>

            <strong>
              ₹10,150
            </strong>

          </div>

          <div className="summary-item">

            <span>
              Total Saving
            </span>

            <strong>
              ₹2,350
            </strong>

          </div>

          <div className="summary-item">

            <span>
              ROI
            </span>

            <strong>
              18.8%
            </strong>

          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* CLOSED LOOP */}
      {/* ================================================== */}

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
