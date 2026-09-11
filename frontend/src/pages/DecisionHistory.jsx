import React, { useEffect, useMemo, useState } from "react";

// ============================================================
// SUPPLY PRESCRIPT
// Member 5 - Closed-Loop & Analytics
// Decision History
// ============================================================

const API_URL = "http://127.0.0.1:8000/api/outcomes/";

// ------------------------------------------------------------
// Helper functions
// ------------------------------------------------------------

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

function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    return [
      "true",
      "1",
      "yes",
      "y",
      "success",
      "successful",
      "on time",
      "on_time",
      "ontime",
    ].includes(normalized);
  }

  return false;
}

function formatCurrency(value) {
  return `₹${toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value) {
  return toNumber(value).toLocaleString("en-IN");
}

// ------------------------------------------------------------
// Normalize backend outcome data
// ------------------------------------------------------------

function normalizeOutcome(row, index) {
  const expectedDelivery = toNumber(
    firstValue(row, [
      "Expected_Delivery_Days",
      "expected_delivery_days",
      "ExpectedDeliveryDays",
    ])
  );

  const actualDelivery = toNumber(
    firstValue(row, [
      "Actual_Delivery_Days",
      "actual_delivery_days",
      "ActualDeliveryDays",
    ])
  );

  const expectedCost = toNumber(
    firstValue(row, [
      "Expected_Cost",
      "expected_cost",
      "ExpectedCost",
    ])
  );

  const actualCost = toNumber(
    firstValue(row, [
      "Actual_Cost",
      "actual_cost",
      "ActualCost",
    ])
  );

  const costSaving = toNumber(
    firstValue(row, [
      "Cost_Saving",
      "cost_saving",
      "CostSaving",
    ], expectedCost - actualCost)
  );

  const actionSuccess = toBoolean(
    firstValue(row, [
      "Action_Success",
      "action_success",
      "Outcome_Success",
      "outcome_success",
      "Success",
      "success",
    ])
  );

  const onTime = toBoolean(
    firstValue(row, [
      "On_Time",
      "on_time",
      "OnTime",
      "Delivery_On_Time",
    ])
  );

  const shipmentId = firstValue(
    row,
    ["Shipment_ID", "shipment_id"],
    "-"
  );

  const decisionId = firstValue(
    row,
    ["Decision_ID", "decision_id"],
    `DEC-${String(index + 1).padStart(4, "0")}`
  );

  return {
    decisionId,

    shipmentId,

    decisionDate: firstValue(
      row,
      [
        "Decision_Date",
        "decision_date",
        "Shipment_Date",
        "shipment_date",
      ]
    ),

    category: firstValue(
      row,
      ["Category_Name", "category_name", "Category"],
      "-"
    ),

    market: firstValue(
      row,
      ["Market", "market"],
      "-"
    ),

    region: firstValue(
      row,
      ["Order_Region", "order_region", "Region"],
      "-"
    ),

    country: firstValue(
      row,
      ["Customer_Country", "customer_country", "Country"],
      "-"
    ),

    city: firstValue(
      row,
      ["Customer_City", "customer_city", "City"],
      "-"
    ),

    shippingMode: firstValue(
      row,
      ["Shipping_Mode", "shipping_mode"],
      "-"
    ),

    quantity: toNumber(
      firstValue(row, [
        "Order_Item_Quantity",
        "order_item_quantity",
        "Quantity",
        "quantity",
      ])
    ),

    risk: firstValue(
      row,
      [
        "Late_delivery_risk",
        "late_delivery_risk",
        "Risk",
        "risk",
      ],
      "-"
    ),

    recommendedAction: firstValue(
      row,
      [
        "Recommended_Action",
        "recommended_action",
        "RecommendedAction",
      ],
      "-"
    ),

    selectedAction: firstValue(
      row,
      [
        "Selected_Action",
        "selected_action",
        "SelectedAction",
      ],
      "-"
    ),

    expectedDelivery,

    actualDelivery,

    deliveryDifference: actualDelivery - expectedDelivery,

    expectedCost,

    actualCost,

    costSaving,

    actionSuccess,

    onTime,

    raw: row,
  };
}

// ------------------------------------------------------------
// Main component
// ------------------------------------------------------------

export default function DecisionHistory() {
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");

  // ----------------------------------------------------------
  // Fetch outcome records
  // ----------------------------------------------------------

  const loadOutcomes = async () => {
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

      // Supports:
      // 1. [ {...}, {...} ]
      // 2. { data: [...] }
      // 3. { outcomes: [...] }
      // 4. { records: [...] }

      let rows = [];

      if (Array.isArray(result)) {
        rows = result;
      } else if (Array.isArray(result.data)) {
        rows = result.data;
      } else if (Array.isArray(result.outcomes)) {
        rows = result.outcomes;
      } else if (Array.isArray(result.records)) {
        rows = result.records;
      }

      const normalizedRecords = rows.map((row, index) =>
        normalizeOutcome(row, index)
      );

      setRecords(normalizedRecords);
    } catch (err) {
      console.error("Failed to load decision outcomes:", err);

      setError(
        "Unable to load decision outcome data. Make sure the Member 5 FastAPI backend is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutcomes();
  }, []);

  // ----------------------------------------------------------
  // Filter records
  // ----------------------------------------------------------

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.decisionId.toLowerCase().includes(query) ||
        String(record.shipmentId)
          .toLowerCase()
          .includes(query) ||
        String(record.market)
          .toLowerCase()
          .includes(query) ||
        String(record.recommendedAction)
          .toLowerCase()
          .includes(query) ||
        String(record.selectedAction)
          .toLowerCase()
          .includes(query);

      let matchesStatus = true;

      if (filterStatus === "successful") {
        matchesStatus = record.actionSuccess;
      }

      if (filterStatus === "delayed") {
        matchesStatus = !record.onTime;
      }

      if (filterStatus === "on-time") {
        matchesStatus = record.onTime;
      }

      return matchesSearch && matchesStatus;
    });
  }, [records, search, filterStatus]);

  // ----------------------------------------------------------
  // KPI calculations
  // ----------------------------------------------------------

  const totalDecisions = records.length;

  const successfulDecisions = records.filter(
    (record) => record.actionSuccess
  ).length;

  const delayedShipments = records.filter(
    (record) => !record.onTime
  ).length;

  const successRate =
    totalDecisions > 0
      ? (successfulDecisions / totalDecisions) * 100
      : 0;

  const onTimeRate =
    totalDecisions > 0
      ? (records.filter((record) => record.onTime).length /
          totalDecisions) *
        100
      : 0;

  const totalSavings = records.reduce(
    (sum, record) => sum + record.costSaving,
    0
  );

  // ----------------------------------------------------------
  // Status badge
  // ----------------------------------------------------------

  const getStatus = (record) => {
    if (record.actionSuccess && record.onTime) {
      return {
        text: "Successful",
        className: "status-success",
      };
    }

    if (!record.onTime) {
      return {
        text: "Delayed",
        className: "status-danger",
      };
    }

    if (record.actionSuccess) {
      return {
        text: "Successful",
        className: "status-success",
      };
    }

    return {
      text: "Unsuccessful",
      className: "status-warning",
    };
  };

  // ----------------------------------------------------------
  // Risk badge
  // ----------------------------------------------------------

  const getRiskClass = (risk) => {
    const value = String(risk).toLowerCase();

    if (value.includes("high")) {
      return "risk-high";
    }

    if (value.includes("medium")) {
      return "risk-medium";
    }

    return "risk-low";
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

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

        .refresh-button:hover {
          background: #a82aff;
        }

        .records-card {
          background: #080808;
          border: 1px solid #292929;
          border-radius: 10px;
          overflow: hidden;
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
          min-width: 2100px;
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
        .status-badge {
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

        .positive {
          color: #6ee7a0;
        }

        .negative {
          color: #ff8d8d;
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

        @media (max-width: 1100px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
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

        {/* =====================================================
            HEADER
        ===================================================== */}

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
              ? "Loading outcome data..."
              : "Connected to Closed-Loop Analytics API"}
          </div>
        </div>

        {/* =====================================================
            KPI CARDS
        ===================================================== */}

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

        {/* =====================================================
            SEARCH / FILTER
        ===================================================== */}

        <div className="toolbar">

          <input
            type="text"
            className="search-input"
            placeholder="Search Decision ID, Shipment ID, Market or Action..."
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
          </select>

          <button
            className="refresh-button"
            onClick={loadOutcomes}
          >
            Refresh
          </button>

        </div>

        {/* =====================================================
            RECORDS TABLE
        ===================================================== */}

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
                onClick={loadOutcomes}
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

                      <th>
                        Decision ID
                      </th>

                      <th>
                        Shipment ID
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Market
                      </th>

                      <th>
                        Region
                      </th>

                      <th>
                        Country
                      </th>

                      <th>
                        City
                      </th>

                      <th>
                        Shipping Mode
                      </th>

                      <th>
                        Quantity
                      </th>

                      <th>
                        Risk
                      </th>

                      <th>
                        Recommended Action
                      </th>

                      <th>
                        Selected Action
                      </th>

                      <th>
                        Expected Delivery
                      </th>

                      <th>
                        Actual Delivery
                      </th>

                      <th>
                        Delivery Difference
                      </th>

                      <th>
                        Expected Cost
                      </th>

                      <th>
                        Actual Cost
                      </th>

                      <th>
                        Cost Saving
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredRecords.map((record) => {

                      const status = getStatus(record);

                      const difference =
                        record.deliveryDifference;

                      return (
                        <tr key={record.decisionId}>

                          <td>
                            <span className="decision-id">
                              {record.decisionId}
                            </span>
                          </td>

                          <td>
                            <span className="shipment-id">
                              {record.shipmentId}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              record.decisionDate
                            )}
                          </td>

                          <td>
                            {record.category}
                          </td>

                          <td>
                            {record.market}
                          </td>

                          <td>
                            {record.region}
                          </td>

                          <td>
                            {record.country}
                          </td>

                          <td>
                            {record.city}
                          </td>

                          <td>
                            {record.shippingMode}
                          </td>

                          <td>
                            {formatNumber(
                              record.quantity
                            )}
                          </td>

                          <td>
                            <span
                              className={`risk-badge ${getRiskClass(
                                record.risk
                              )}`}
                            >
                              {record.risk}
                            </span>
                          </td>

                          <td>
                            {record.recommendedAction}
                          </td>

                          <td>
                            {record.selectedAction}
                          </td>

                          <td>
                            {record.expectedDelivery} days
                          </td>

                          <td>
                            {record.actualDelivery} days
                          </td>

                          <td>
                            <span
                              className={
                                difference > 0
                                  ? "negative"
                                  : difference < 0
                                  ? "positive"
                                  : ""
                              }
                            >
                              {difference > 0
                                ? "+"
                                : ""}
                              {difference} days
                            </span>
                          </td>

                          <td>
                            {formatCurrency(
                              record.expectedCost
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              record.actualCost
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                record.costSaving >= 0
                                  ? "positive"
                                  : "negative"
                              }
                            >
                              {formatCurrency(
                                record.costSaving
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

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

              <div className="table-footer">
                Showing {filteredRecords.length} of{" "}
                {records.length} decision outcome records
                &nbsp; | &nbsp;
                On-Time Rate: {onTimeRate.toFixed(1)}%
              </div>
            </>
          )}

        </div>

      </div>
    </>
  );
}