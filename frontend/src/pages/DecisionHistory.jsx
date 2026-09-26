import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

// ============================================================
// SUPPLY PRESCRIPT
// Member 5 - Closed-Loop & Analytics
// Decision History
// ============================================================

const API_URL =
  "http://127.0.0.1:8000/api/outcomes/history";


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function toNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
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
    return value;
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
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function formatRisk(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toFixed(2);
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


function getStatus(record) {
  const status = String(
    record.outcome_status || ""
  )
    .trim()
    .toLowerCase();

  if (
    record.action_success ||
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
    status.includes("unsuccess")
  ) {
    return {
      text: "Delayed",
      className: "status-danger",
    };
  }

  return {
    text:
      record.outcome_status || "Pending",
    className: "status-warning",
  };
}


// ============================================================
// COMPONENT
// ============================================================

export default function DecisionHistory() {

  const [records, setRecords] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("all");


  // ==========================================================
  // LOAD DECISION HISTORY
  // ==========================================================

  const loadHistory = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await fetch(API_URL);

      if (!response.ok) {

        throw new Error(
          `Backend returned HTTP ${response.status}`
        );
      }

      const result =
        await response.json();

      if (!Array.isArray(result)) {

        throw new Error(
          "Invalid decision history response"
        );
      }

      setRecords(result);

    } catch (err) {

      console.error(
        "Failed to load decision history:",
        err
      );

      setError(
        "Unable to load decision history. Make sure the FastAPI backend and PostgreSQL database are running."
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadHistory();

  }, []);


  // ==========================================================
  // FILTER RECORDS
  // ==========================================================

  const filteredRecords = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    return records.filter((record) => {

      // ------------------------------------------------------
      // Search
      // ------------------------------------------------------

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
        .map((value) =>
          String(value ?? "").toLowerCase()
        )
        .join(" ");


      const matchesSearch =
        !query ||
        searchableText.includes(query);


      // ------------------------------------------------------
      // Status filter
      // ------------------------------------------------------

      let matchesStatus = true;

      if (filterStatus === "successful") {

        matchesStatus =
          Boolean(record.action_success);
      }

      if (filterStatus === "delayed") {

        matchesStatus =
          record.on_time === false ||
          String(
            record.outcome_status || ""
          )
            .toLowerCase()
            .includes("delay");
      }

      if (filterStatus === "on-time") {

        matchesStatus =
          record.on_time === true;
      }

      if (filterStatus === "override") {

        matchesStatus =
          Boolean(record.manager_override);
      }


      return (
        matchesSearch &&
        matchesStatus
      );
    });

  }, [
    records,
    search,
    filterStatus,
  ]);


  // ==========================================================
  // KPI CALCULATIONS
  // ==========================================================

  const totalDecisions =
    records.length;


  const successfulDecisions =
    records.filter(
      (record) =>
        Boolean(record.action_success)
    ).length;


  const delayedShipments =
    records.filter(
      (record) =>
        record.on_time === false
    ).length;


  const onTimeDecisions =
    records.filter(
      (record) =>
        record.on_time === true
    ).length;


  const overrideDecisions =
    records.filter(
      (record) =>
        Boolean(record.manager_override)
    ).length;


  const totalSavings =
    records.reduce(
      (sum, record) =>
        sum +
        toNumber(
          record.cost_saving
        ),
      0
    );


  const successRate =
    totalDecisions > 0
      ? (
          successfulDecisions /
          totalDecisions
        ) * 100
      : 0;


  const onTimeRate =
    totalDecisions > 0
      ? (
          onTimeDecisions /
          totalDecisions
        ) * 100
      : 0;


  const overrideRate =
    totalDecisions > 0
      ? (
          overrideDecisions /
          totalDecisions
        ) * 100
      : 0;


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
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        /* ==================================================
           HEADER
        ================================================== */

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


        /* ==================================================
           KPI
        ================================================== */

        .kpi-grid {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(160px, 1fr));
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


        /* ==================================================
           TOOLBAR
        ================================================== */

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


        /* ==================================================
           TABLE CARD
        ================================================== */

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

          border-bottom:
            1px solid #1d1d1d;

          font-size: 12px;

          white-space: nowrap;

          color: #e8e8e8;
        }


        tr:hover td {
          background: #101010;
        }


        /* ==================================================
           IDs
        ================================================== */

        .decision-id {
          color: #c46bff;
          font-weight: 600;
        }


        .shipment-id {
          color: #8ec5ff;
        }


        /* ==================================================
           BADGES
        ================================================== */

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


        /* ==================================================
           VALUES
        ================================================== */

        .positive {
          color: #6ee7a0;
        }


        .negative {
          color: #ff8d8d;
        }


        .neutral {
          color: #9bb6d2;
        }


        /* ==================================================
           STATES
        ================================================== */

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


        /* ==================================================
           RESPONSIVE
        ================================================== */

        @media (max-width: 1200px) {

          .kpi-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

        }


        @media (max-width: 800px) {

          .kpi-grid {
            grid-template-columns:
              repeat(2, 1fr);
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

          <h1>
            Decision History
          </h1>

          <p>
            Track decisions, expected results
            and actual outcomes
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
              {formatNumber(
                totalDecisions
              )}
            </div>

          </div>


          <div className="kpi-card">

            <div className="kpi-title">
              Successful
            </div>

            <div className="kpi-value">
              {formatNumber(
                successfulDecisions
              )}
            </div>

          </div>


          <div className="kpi-card">

            <div className="kpi-title">
              Delayed Shipments
            </div>

            <div className="kpi-value">
              {formatNumber(
                delayedShipments
              )}
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
              {formatCurrency(
                totalSavings
              )}
            </div>

          </div>

        </div>


        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <div className="toolbar">

          <input
            type="text"
            className="search-input"
            placeholder="Search Decision ID, Shipment ID, Product or Action..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />


          <select
            className="filter-select"
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(
                event.target.value
              )
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
            onClick={loadHistory}
          >
            Refresh
          </button>

        </div>


        {/* ==================================================
            RECORDS
        ================================================== */}

        <div className="records-card">

          <div className="records-header">

            <h2>
              Decision / Outcome Records
            </h2>

            <p>
              Predicted vs actual performance
              from the closed-loop process
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
                        Product
                      </th>

                      <th>
                        Quantity
                      </th>

                      <th>
                        Origin
                      </th>

                      <th>
                        Destination
                      </th>

                      <th>
                        Risk Score
                      </th>

                      <th>
                        Recommended Action
                      </th>

                      <th>
                        Selected Action
                      </th>

                      <th>
                        Override
                      </th>

                      <th>
                        Expected Delivery
                      </th>

                      <th>
                        Actual Delivery
                      </th>

                      <th>
                        Difference
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

                      <th>
                        Notes
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredRecords.map(
                      (record) => {

                        const status =
                          getStatus(record);

                        const difference =
                          record.delivery_difference;

                        const riskClass =
                          getRiskClass(
                            record.risk_score
                          );

                        return (

                          <tr
                            key={
                              `${record.decision_id}-${record.shipment_id}`
                            }
                          >

                            {/* Decision ID */}

                            <td>

                              <span className="decision-id">

                                {record.decision_id}

                              </span>

                            </td>


                            {/* Shipment ID */}

                            <td>

                              <span className="shipment-id">

                                {record.shipment_id}

                              </span>

                            </td>


                            {/* Date */}

                            <td>

                              {formatDateTime(
                                record.decision_date
                              )}

                            </td>


                            {/* Product */}

                            <td>

                              {record.product || "-"}

                            </td>


                            {/* Quantity */}

                            <td>

                              {formatNumber(
                                record.quantity
                              )}

                            </td>


                            {/* Origin */}

                            <td>

                              {record.origin || "-"}

                            </td>


                            {/* Destination */}

                            <td>

                              {record.destination || "-"}

                            </td>


                            {/* Risk */}

                            <td>

                              <span
                                className={`risk-badge ${riskClass}`}
                              >

                                {formatRisk(
                                  record.risk_score
                                )}

                              </span>

                            </td>


                            {/* Recommended Action */}

                            <td>

                              {record.recommended_action ||
                                "-"}

                            </td>


                            {/* Selected Action */}

                            <td>

                              {record.selected_action ||
                                "-"}

                            </td>


                            {/* Override */}

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


                            {/* Expected Delivery */}

                            <td>

                              {record.expected_delivery_days !==
                              null &&
                              record.expected_delivery_days !==
                              undefined
                                ? `${record.expected_delivery_days} days`
                                : "-"}

                            </td>


                            {/* Actual Delivery */}

                            <td>

                              {record.actual_delivery_days !==
                              null &&
                              record.actual_delivery_days !==
                              undefined
                                ? `${record.actual_delivery_days} days`
                                : "-"}

                            </td>


                            {/* Delivery Difference */}

                            <td>

                              <span
                                className={
                                  difference === null ||
                                  difference === undefined
                                    ? "neutral"
                                    : difference > 0
                                    ? "negative"
                                    : difference < 0
                                    ? "positive"
                                    : "neutral"
                                }
                              >

                                {difference === null ||
                                difference === undefined
                                  ? "-"
                                  : `${difference > 0 ? "+" : ""}${difference} days`}

                              </span>

                            </td>


                            {/* Expected Cost */}

                            <td>

                              {record.expected_cost !==
                              null &&
                              record.expected_cost !==
                              undefined
                                ? formatCurrency(
                                    record.expected_cost
                                  )
                                : "-"}

                            </td>


                            {/* Actual Cost */}

                            <td>

                              {record.actual_cost !==
                              null &&
                              record.actual_cost !==
                              undefined
                                ? formatCurrency(
                                    record.actual_cost
                                  )
                                : "-"}

                            </td>


                            {/* Cost Saving */}

                            <td>

                              <span
                                className={
                                  record.cost_saving ===
                                    null ||
                                  record.cost_saving ===
                                    undefined
                                    ? "neutral"
                                    : record.cost_saving >= 0
                                    ? "positive"
                                    : "negative"
                                }
                              >

                                {record.cost_saving ===
                                  null ||
                                record.cost_saving ===
                                  undefined
                                  ? "-"
                                  : formatCurrency(
                                      record.cost_saving
                                    )}

                              </span>

                            </td>


                            {/* Status */}

                            <td>

                              <span
                                className={`status-badge ${status.className}`}
                              >

                                {status.text}

                              </span>

                            </td>


                            {/* Notes */}

                            <td>

                              {record.notes || "-"}

                            </td>

                          </tr>

                        );

                      }
                    )}

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