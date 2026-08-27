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

import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";


// ============================================================
// SAMPLE DASHBOARD DATA
// ============================================================

const costData = [
  {
    name: "Expected",
    cost: 12500,
  },
  {
    name: "Actual",
    cost: 10150,
  },
];


const deliveryData = [
  {
    name: "On Time",
    value: 75,
  },
  {
    name: "Delayed",
    value: 25,
  },
];


const actionData = [
  {
    action: "Upgrade Shipping",
    successRate: 82,
    savings: 1450,
  },
  {
    action: "Prioritize",
    successRate: 76,
    savings: 1180,
  },
  {
    action: "Split Shipment",
    successRate: 70,
    savings: 920,
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
// ROI DASHBOARD
// ============================================================

function DecisionROI() {
  return (
    <div className="roi-page">

      {/* ================================================== */}
      {/* PAGE HEADER */}
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

        <div className="roi-status">
          <span className="status-dot"></span>
          Analytics Active
        </div>

      </div>


      {/* ================================================== */}
      {/* KPI CARDS */}
      {/* ================================================== */}

      <div className="kpi-grid">

        <KPICard
          title="Total Shipments"
          value="20"
          subtitle="Evaluated shipments"
          icon="📦"
        />

        <KPICard
          title="Cost Saving"
          value="₹2,350"
          subtitle="Total estimated saving"
          icon="💰"
        />

        <KPICard
          title="On-Time Rate"
          value="75%"
          subtitle="Delivery performance"
          icon="🚚"
        />

        <KPICard
          title="Action Success"
          value="76%"
          subtitle="Successful prescriptions"
          icon="✓"
        />

        <KPICard
          title="ROI"
          value="18.8%"
          subtitle="Return on prescription"
          icon="📈"
        />

      </div>


      {/* ================================================== */}
      {/* MAIN CHART ROW */}
      {/* ================================================== */}

      <div className="chart-grid">

        {/* Expected vs Actual Cost */}

        <ChartCard
          title="Expected vs Actual Cost"
          subtitle="Cost impact after applying prescriptions"
        >

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart data={costData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="cost"
                name="Cost"
              />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>


        {/* Delivery Performance */}

        <ChartCard
          title="Delivery Performance"
          subtitle="On-time vs delayed shipments"
        >

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

        </ChartCard>

      </div>


      {/* ================================================== */}
      {/* ACTION PERFORMANCE */}
      {/* ================================================== */}

      <div className="chart-grid">

        <ChartCard
          title="Prescription Action Performance"
          subtitle="Success rate by recommended action"
        >

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart data={actionData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="action"
              />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip />

              <Bar
                dataKey="successRate"
                name="Success Rate (%)"
              />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>


        {/* Shipping Mode */}

        <ChartCard
          title="Savings by Shipping Mode"
          subtitle="Cost saving generated by shipping mode"
        >

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart data={shippingModeData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

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

        </ChartCard>

      </div>


      {/* ================================================== */}
      {/* MARKET ANALYTICS */}
      {/* ================================================== */}

      <ChartCard
        title="Cost Saving by Market"
        subtitle="Prescription impact across markets"
        className="full-width-chart"
      >

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <LineChart data={marketData}>

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="market"
            />

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

      </ChartCard>


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

    </div>
  );
}

export default DecisionROI;