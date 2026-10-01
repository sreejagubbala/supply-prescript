import React, { useEffect, useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ============================================================
// SUPPLY PRESCRIPT
// Member 5 - Closed-Loop & Analytics
// Decision History
// ============================================================

const API_URL = "http://127.0.0.1:8000/api/outcomes/";
const DECISIONS_API_URL = "http://127.0.0.1:8000/api/decisions/";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function firstValue(row, keys, fallback = "") {
  for (const key of keys) {
    if (
      row &&
      row[key] !== undefined &&
      row[key] !== null &&
      row[key] !== ""
    ) {
      return row[key];
    }
  }

  return fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function formatCurrency(value) {
  return `₹${toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString("en-IN");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRiskClass(value) {
  const risk = Number(value);

  if (!Number.isFinite(risk)) {
    return "risk-low";
  }

  if (risk >= 0.7) {
    return "risk-high";
  }

  if (risk >= 0.4) {
    return "risk-medium";
  }

  return "risk-low";
}

function formatRisk(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const risk = Number(value);

  if (!Number.isFinite(risk)) {
    return String(value);
  }

  return risk.toFixed(2);
}

function getStatus(record) {
  const status = String(record.outcome_status || "")
    .trim()
    .toLowerCase();

  if (
    record.action_success === true ||
    status === "success" ||
    status === "successful" ||
    status === "completed"
  ) {
    return {
      text: "Successful",
      className: "status-success",
    };
  }

  if (
    status.includes("delay") ||
    status.includes("fail") ||
    status.includes("unsuccess") ||
    record.on_time === false
  ) {
    return {
      text: "Delayed",
      className: "status-danger",
    };
  }

  return {
    text: record.outcome_status || "Pending",
    className: "status-warning",
  };
}

// ============================================================
// COMPONENT
// ============================================================

export default function DecisionHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [decisions, setDecisions] = useState([]);
  const [decisionsLoading, setDecisionsLoading] = useState(true);

  // ==========================================================
  // LOAD DECISION HISTORY
  // ==========================================================

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Backend returned HTTP ${response.status}`
        );
      }

      const result = await response.json();

      if (!Array.isArray(result)) {
        throw new Error("Invalid decision history response");
      }

      setRecords(result);
    } catch (err) {
      console.error("Failed to load decision history:", err);

      setRecords([]);

      setError(
        "Unable to load decision history. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD EXECUTED DECISIONS
  // ==========================================================

  const loadDecisions = async () => {
    try {
      setDecisionsLoading(true);

      const response = await fetch(DECISIONS_API_URL);

      if (!response.ok) {
        throw new Error(
          `Backend returned HTTP ${response.status}`
        );
      }

      const result = await response.json();

      setDecisions(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to load executed decisions:", err);

      setDecisions([]);
    } finally {
      setDecisionsLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadHistory();
    loadDecisions();
  }, []);

  // ==========================================================
  // FILTER RECORDS
  // ==========================================================

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const searchableText = [
        record.decision_id,
        record.shipment_id,
        record.product,
        record.origin,
        record.destination,
        record.recommended_action,
        record.selected_action,
        record.outcome_status,
        record.user_name,
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      const matchesSearch =
        !query || searchableText.includes(query);

      let matchesStatus = true;

      if (filterStatus === "successful") {
        matchesStatus = Boolean(record.action_success);
      }

      if (filterStatus === "delayed") {
        matchesStatus =
          record.on_time === false ||
          String(record.outcome_status || "")
            .toLowerCase()
            .includes("delay");
      }

      if (filterStatus === "on-time") {
        matchesStatus = record.on_time === true;
      }

      if (filterStatus === "override") {
        matchesStatus = Boolean(record.manager_override);
      }

      return matchesSearch && matchesStatus;
    });
  }, [records, search, filterStatus]);

  // ==========================================================
  // KPI CALCULATIONS
  // ==========================================================

  const totalDecisions = records.length;

  const successfulDecisions = records.filter(
    (record) => Boolean(record.action_success)
  ).length;

  const delayedShipments = records.filter(
    (record) => record.on_time === false
  ).length;

  const onTimeDecisions = records.filter(
    (record) => record.on_time === true
  ).length;

  const overrideDecisions = records.filter(
    (record) => Boolean(record.manager_override)
  ).length;

  const totalSavings = records.reduce(
    (sum, record) => sum + toNumber(record.cost_saving),
    0
  );

  const successRate =
    totalDecisions > 0
      ? (successfulDecisions / totalDecisions) * 100
      : 0;

  const onTimeRate =
    totalDecisions > 0
      ? (onTimeDecisions / totalDecisions) * 100
      : 0;

  const overrideRate =
    totalDecisions > 0
      ? (overrideDecisions / totalDecisions) * 100
      : 0;

  // ==========================================================
  // CHART DATA
  // ==========================================================

  const chartRecords = useMemo(() => {
    return filteredRecords.slice(0, 10).map((record) => ({
      ...record,

      decisionId:
        record.decision_id ||
        record.decisionId ||
        "-",

      expectedDelivery: toNumber(
        firstValue(record, [
          "expected_delivery_days",
          "expectedDelivery",
        ])
      ),

      actualDelivery: toNumber(
        firstValue(record, [
          "actual_delivery_days",
          "actualDelivery",
        ])
      ),

      expectedCost: toNumber(
        firstValue(record, [
          "expected_cost",
          "expectedCost",
        ])
      ),

      actualCost: toNumber(
        firstValue(record, [
          "actual_cost",
          "actualCost",
        ])
      ),
    }));
  }, [filteredRecords]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .decision-history {
          min-height: 100vh;
          background: #000;
          color: #f5f5f5;
          padding: 28px 22px 50px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .history-header {
          margin-bottom: 24px;
        }

        .history-header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 500;
        }

        .history-header p {
          margin: 8px 0 0;
          color: #9bb6d2;
          font-size: 15px;
        }

        .connection-status {
          margin-top: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #7fb3df;
        }

        .connection-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
        }

        .connection-dot.error {
          background: #ef4444;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(160px, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .kpi-card {
          background: #111;
          border: 1px solid #292929;
          border-radius: 10px;
          padding: 18px;
          min-height: 100px;
        }

        .kpi-title {
          color: #8eb1d5;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .kpi-value {
          font-size: 25px;
          font-weight: 700;
          color: #fff;
        }

        .toolbar {
          background: #0d0d0d;
          border: 1px solid #292929;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 14px;
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 240px;
          background: #050505;
          color: #fff;
          border: 1px solid #343434;
          border-radius: 7px;
          padding: 11px 13px;
          outline: none;
        }

        .search-input:focus {
          border-color: #9b18ff;
        }

        .filter-select {
          background: #050505;
          color: #fff;
          border: 1px solid #343434;
          border-radius: 7px;
          padding: 11px 13px;
          min-width: 150px;
          outline: none;
        }

        .refresh-button {
          background: #9417f4;
          color: white;
          border: none;
          border-radius: 7px;
          padding: 11px 18px;
          cursor: pointer;
          font-weight: 600;
        }

        .refresh-button:hover,
        .retry-button:hover {
          background: #a82aff;
        }

        .records-card {
          background: #080808;
          border: 1px solid #292929;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 22px;
        }

        .records-header {
          padding: 20px 18px;
          border-bottom: 1px solid #292929;
        }

        .records-header h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 500;
        }

        .records-header p {
          margin: 7px 0 0;
          color: #7e9bb8;
          font-size: 13px;
        }

        .table-wrapper {
          overflow-x: auto;
          width: 100%;
        }

        table {
          width: 100%;
          min-width: 1900px;
          border-collapse: collapse;
        }

        th {
          background: #111;
          color: #a9c2db;
          font-size: 12px;
          font-weight: 600;
          text-align: left;
          padding: 13px 10px;
          border-bottom: 1px solid #303030;
          white-space: nowrap;
        }

        td {
          padding: 13px 10px;
          border-bottom: 1px solid #1d1d1d;
          font-size: 12px;
          white-space: nowrap;
          color: #e8e8e8;
        }

        tr:hover td {
          background: #101010;
        }

        .decision-id {
          color: #c46bff;
          font-weight: 600;
        }

        .shipment-id {
          color: #8ec5ff;
        }

        .risk-badge,
        .status-badge,
        .override-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          padding: 4px 9px;
          font-size: 11px;
          font-weight: 600;
        }

        .risk-low {
          color: #6ee7a0;
          background: #123b25;
        }

        .risk-medium {
          color: #facc15;
          background: #40370d;
        }

        .risk-high {
          color: #ff8d8d;
          background: #451616;
        }

        .status-success {
          color: #6ee7a0;
          background: #123b25;
        }

        .status-danger {
          color: #ff8d8d;
          background: #451616;
        }

        .status-warning {
          color: #facc15;
          background: #40370d;
        }

        .override-yes {
          color: #facc15;
          background: #40370d;
        }

        .override-no {
          color: #6ee7a0;
          background: #123b25;
        }

        .positive {
          color: #6ee7a0;
        }

        .negative {
          color: #ff8d8d;
        }

        .neutral {
          color: #9bb6d2;
        }

        .loading-box,
        .error-box,
        .empty-box {
          padding: 50px 20px;
          text-align: center;
          color: #8fa6bd;
        }

        .error-box {
          color: #ff8d8d;
        }

        .retry-button {
          margin-top: 15px;
          background: #9417f4;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 7px;
          cursor: pointer;
        }

        .table-footer {
          padding: 13px 18px;
          color: #7790a9;
          font-size: 12px;
          border-top: 1px solid #222;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          padding: 20px;
        }

        .chart-title {
          color: #8eb1d5;
          font-size: 13px;
          margin: 0 0 10px;
        }

        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 900px) {
          .chart-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .decision-history {
            padding: 18px 12px;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .history-header h1 {
            font-size: 25px;
          }
        }
      `}</style>

      <div className="decision-history">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="history-header">
          <h1>Decision History</h1>

          <p>
            Track decisions, expected results and actual outcomes
          </p>

          <div className="connection-status">
            <span
              className={`connection-dot ${
                error ? "error" : ""
              }`}
            />

            {error
              ? "Backend connection unavailable"
              : loading
              ? "Loading decision history..."
              : "Connected to Closed-Loop Analytics API"}
          </div>
        </div>

        {/* ==================================================
            KPI CARDS
        ================================================== */}

        <div className="kpi-grid">

          <div className="kpi-card">
            <div className="kpi-title">
              Total Decisions
            </div>

            <div className="kpi-value">
              {formatNumber(totalDecisions)}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              Successful
            </div>

            <div className="kpi-value">
              {formatNumber(successfulDecisions)}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              Delayed Shipments
            </div>

            <div className="kpi-value">
              {formatNumber(delayedShipments)}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              Success Rate
            </div>

            <div className="kpi-value">
              {successRate.toFixed(1)}%
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              Total Cost Saving
            </div>

            <div className="kpi-value">
              {formatCurrency(totalSavings)}
            </div>
          </div>

        </div>

        {/* ==================================================
            PREDICTED VS ACTUAL PERFORMANCE
        ================================================== */}

        <div className="records-card">

          <div className="records-header">
            <h2>
              Predicted vs Actual Performance
            </h2>

            <p>
              Comparing expected outcomes against what actually
              happened, per decision
            </p>
          </div>

          {chartRecords.length === 0 ? (
            <div className="empty-box">
              No outcome data yet to chart.
            </div>
          ) : (
            <div className="chart-grid">

              {/* DELIVERY CHART */}

              <div>
                <p className="chart-title">
                  Delivery Days (Expected vs Actual)
                </p>

                <ResponsiveContainer
                  width="100%"
                  height={260}
                >
                  <BarChart data={chartRecords}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#292929"
                    />

                    <XAxis
                      dataKey="decisionId"
                      stroke="#8eb1d5"
                      tick={{ fontSize: 10 }}
                    />

                    <YAxis stroke="#8eb1d5" />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        border: "1px solid #292929",
                        color: "#fff",
                      }}
                    />

                    <Legend />

                    <Bar
                      dataKey="expectedDelivery"
                      name="Expected Days"
                      fill="#60a5fa"
                    />

                    <Bar
                      dataKey="actualDelivery"
                      name="Actual Days"
                      fill="#c084fc"
                    />

                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* COST CHART */}

              <div>
                <p className="chart-title">
                  Cost (Expected vs Actual)
                </p>

                <ResponsiveContainer
                  width="100%"
                  height={260}
                >
                  <LineChart data={chartRecords}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#292929"
                    />

                    <XAxis
                      dataKey="decisionId"
                      stroke="#8eb1d5"
                      tick={{ fontSize: 10 }}
                    />

                    <YAxis stroke="#8eb1d5" />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        border: "1px solid #292929",
                        color: "#fff",
                      }}
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="expectedCost"
                      name="Expected Cost"
                      stroke="#60a5fa"
                      strokeWidth={2}
                    />

                    <Line
                      type="monotone"
                      dataKey="actualCost"
                      name="Actual Cost"
                      stroke="#c084fc"
                      strokeWidth={2}
                    />

                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          )}
        </div>

        {/* ==================================================
            EXECUTED DECISIONS
        ================================================== */}

        <div className="records-card">

          <div className="records-header">
            <h2>Executed Decisions</h2>

            <p>
              Decisions recorded from the prescription workflow
            </p>
          </div>

          {decisionsLoading ? (
            <div className="loading-box">
              Loading executed decisions...
            </div>
          ) : decisions.length === 0 ? (
            <div className="empty-box">
              No decisions executed yet.
            </div>
          ) : (
            <div className="table-wrapper">

              <table style={{ minWidth: "900px" }}>

                <thead>
                  <tr>
                    <th>Decision ID</th>
                    <th>Shipment ID</th>
                    <th>Selected Option</th>
                    <th>Cost</th>
                    <th>Executed By</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {[...decisions]
                    .sort(
                      (a, b) =>
                        new Date(b.created_at) -
                        new Date(a.created_at)
                    )
                    .map((d) => (
                      <tr key={d.id}>

                        <td>
                          <span className="decision-id">
                            DEC-
                            {String(d.id).padStart(4, "0")}
                          </span>
                        </td>

                        <td>
                          <span className="shipment-id">
                            {d.shipment_id || "-"}
                          </span>
                        </td>

                        <td>
                          {d.selected_option || "-"}
                        </td>

                        <td>
                          {formatCurrency(
                            d.estimated_cost
                          )}
                        </td>

                        <td>
                          {d.user_name || "-"}
                        </td>

                        <td>
                          <span className="status-badge status-success">
                            {d.decision_status ||
                              "Completed"}
                          </span>
                        </td>

                        <td>
                          {formatDate(d.created_at)}
                        </td>

                      </tr>
                    ))}
                </tbody>

              </table>

            </div>
          )}
        </div>

        {/* ==================================================
            SEARCH / FILTER TOOLBAR
        ================================================== */}

        <div className="toolbar">

          <input
            type="text"
            className="search-input"
            placeholder="Search Decision ID, Shipment ID, Product or Action..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            className="filter-select"
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(event.target.value)
            }
          >
            <option value="all">
              All Decisions
            </option>

            <option value="successful">
              Successful
            </option>

            <option value="delayed">
              Delayed
            </option>

            <option value="on-time">
              On Time
            </option>

            <option value="override">
              Manager Override
            </option>
          </select>

          <button
            className="refresh-button"
            onClick={() => {
              loadHistory();
              loadDecisions();
            }}
          >
            Refresh
          </button>

        </div>

        {/* ==================================================
            DECISION / OUTCOME RECORDS
        ================================================== */}

        <div className="records-card">

          <div className="records-header">

            <h2>
              Decision / Outcome Records
            </h2>

            <p>
              Predicted vs actual performance from the
              closed-loop process
            </p>

          </div>

          {loading ? (

            <div className="loading-box">
              Loading decision outcome records...
            </div>

          ) : error ? (

            <div className="error-box">

              {error}

              <br />

              <button
                className="retry-button"
                onClick={loadHistory}
              >
                Retry
              </button>

            </div>

          ) : filteredRecords.length === 0 ? (

            <div className="empty-box">
              No decision outcome records found.
            </div>

          ) : (

            <>

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>Decision ID</th>
                      <th>Shipment ID</th>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Risk Score</th>
                      <th>Recommended Action</th>
                      <th>Selected Action</th>
                      <th>Override</th>
                      <th>Expected Delivery</th>
                      <th>Actual Delivery</th>
                      <th>Difference</th>
                      <th>Expected Cost</th>
                      <th>Actual Cost</th>
                      <th>Cost Saving</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredRecords.map((record) => {

                      const status = getStatus(record);

                      const riskClass =
                        getRiskClass(record.risk_score);

                      const difference =
                        record.deliveryDifference ??
                        (
                          record.actual_delivery_days != null &&
                          record.expected_delivery_days != null
                            ? Number(
                                record.actual_delivery_days
                              ) -
                              Number(
                                record.expected_delivery_days
                              )
                            : null
                        );

                      return (
                        <tr
                          key={
                            `${record.decision_id || "decision"}-${
                              record.shipment_id || "shipment"
                            }`
                          }
                        >

                          <td>
                            <span className="decision-id">
                              {record.decision_id || "-"}
                            </span>
                          </td>

                          <td>
                            <span className="shipment-id">
                              {record.shipment_id || "-"}
                            </span>
                          </td>

                          <td>
                            {formatDateTime(
                              record.decision_date
                            )}
                          </td>

                          <td>
                            {record.product || "-"}
                          </td>

                          <td>
                            {formatNumber(
                              record.quantity
                            )}
                          </td>

                          <td>
                            {record.origin || "-"}
                          </td>

                          <td>
                            {record.destination || "-"}
                          </td>

                          <td>
                            <span
                              className={`risk-badge ${riskClass}`}
                            >
                              {formatRisk(
                                record.risk_score
                              )}
                            </span>
                          </td>

                          <td>
                            {record.recommended_action ||
                              "-"}
                          </td>

                          <td>
                            {record.selected_action ||
                              "-"}
                          </td>

                          <td>
                            <span
                              className={`override-badge ${
                                record.manager_override
                                  ? "override-yes"
                                  : "override-no"
                              }`}
                            >
                              {record.manager_override
                                ? "Yes"
                                : "No"}
                            </span>
                          </td>

                          <td>
                            {record.expected_delivery_days !=
                              null
                              ? `${record.expected_delivery_days} days`
                              : "-"}
                          </td>

                          <td>
                            {record.actual_delivery_days !=
                              null
                              ? `${record.actual_delivery_days} days`
                              : "-"}
                          </td>

                          <td>

                            <span
                              className={
                                difference == null
                                  ? "neutral"
                                  : difference > 0
                                  ? "negative"
                                  : difference < 0
                                  ? "positive"
                                  : "neutral"
                              }
                            >

                              {difference == null
                                ? "-"
                                : `${
                                    difference > 0
                                      ? "+"
                                      : ""
                                  }${difference} days`}

                            </span>

                          </td>

                          <td>
                            {record.expected_cost != null
                              ? formatCurrency(
                                  record.expected_cost
                                )
                              : "-"}
                          </td>

                          <td>
                            {record.actual_cost != null
                              ? formatCurrency(
                                  record.actual_cost
                                )
                              : "-"}
                          </td>

                          <td>

                            <span
                              className={
                                record.cost_saving == null
                                  ? "neutral"
                                  : Number(
                                      record.cost_saving
                                    ) >= 0
                                  ? "positive"
                                  : "negative"
                              }
                            >

                              {record.cost_saving == null
                                ? "-"
                                : formatCurrency(
                                    record.cost_saving
                                  )}

                            </span>

                          </td>

                          <td>

                            <span
                              className={`status-badge ${status.className}`}
                            >
                              {status.text}
                            </span>

                          </td>

                          <td>
                            {record.notes || "-"}
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <div className="table-footer">

                Showing{" "}
                {filteredRecords.length}{" "}
                of{" "}
                {records.length}{" "}
                decision outcome records

                &nbsp; | &nbsp;

                On-Time Rate:{" "}
                {onTimeRate.toFixed(1)}%

                &nbsp; | &nbsp;

                Override Rate:{" "}
                {overrideRate.toFixed(1)}%

              </div>

            </>

          )}

        </div>

      </div>
    </>
  );
}
