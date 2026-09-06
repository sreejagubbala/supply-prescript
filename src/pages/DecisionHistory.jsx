import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
// CSV PARSER
// ============================================================

function parseCSV(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index]
        ? values[index].trim()
        : "";
    });

    return row;
  });
}

// ============================================================
// GET VALUE
// ============================================================

function getValue(row, column) {
  return row[column] !== undefined && row[column] !== ""
    ? row[column]
    : "-";
}

// ============================================================
// NUMBER
// ============================================================

function getNumber(row, column) {
  const value = getValue(row, column);

  const number = Number(
    String(value).replace(/[$₹,%]/g, "")
  );

  return Number.isNaN(number) ? 0 : number;
}

// ============================================================
// CURRENCY
// ============================================================

function currency(value) {
  return `₹${Number(value).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

// ============================================================
// DECISION HISTORY
// ============================================================

function DecisionHistory() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD CSV
  // ==========================================================

  useEffect(() => {
    fetch("/data/decision_outcome.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "decision_outcome.csv not found"
          );
        }

        return response.text();
      })
      .then((text) => {
        const parsedData = parseCSV(text);

        setData(parsedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);

        setError(
          "Unable to load decision outcome data."
        );

        setLoading(false);
      });
  }, []);

  // ==========================================================
  // SUMMARY CALCULATIONS
  // ==========================================================

  const successful = data.filter(
    (row) =>
      String(row.outcome_status)
        .toLowerCase()
        .trim() === "successful"
  ).length;

  const unsuccessful = data.filter(
    (row) =>
      String(row.outcome_status)
        .toLowerCase()
        .trim() === "unsuccessful"
  ).length;

  const delayed = data.filter(
    (row) =>
      String(row.delivery_status)
        .toLowerCase()
        .trim() === "delayed"
  ).length;

  const onTime = data.filter(
    (row) =>
      String(row.delivery_status)
        .toLowerCase()
        .trim() === "on time"
  ).length;

  const successRate =
    data.length > 0
      ? (successful / data.length) * 100
      : 0;

  const onTimeRate =
    data.length > 0
      ? (onTime / data.length) * 100
      : 0;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="history-page">
        <div className="loading-box">
          <h2>Loading Decision History...</h2>
          <p>
            Reading decision outcome data
          </p>
        </div>

        <style>{`

          .history-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7f8fa;
            font-family: Arial, Helvetica, sans-serif;
          }

          .loading-box {
            background: white;
            padding: 35px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            text-align: center;
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
      <div className="history-page">
        <div className="error-box">
          <h2>Data Loading Error</h2>

          <p>{error}</p>

          <button
            className="back-button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>

        <style>{`

          .history-page {
            min-height: 100vh;
            padding: 30px;
            background: #f7f8fa;
            font-family: Arial, Helvetica, sans-serif;
          }

          .error-box {
            max-width: 600px;
            margin: 100px auto;
            padding: 30px;
            background: #fee2e2;
            color: #991b1b;
            border-radius: 12px;
            text-align: center;
          }

          .back-button {
            margin-top: 20px;
            padding: 11px 18px;
            border: none;
            border-radius: 8px;
            background: #111827;
            color: white;
            cursor: pointer;
          }

        `}</style>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="history-page">

    <style>{`

      * {
        box-sizing: border-box;
      }

      /* ==========================================================
        MAIN PAGE
        ========================================================== */

      .history-page {
        min-height: 100vh;
        padding: 20px;
        background: #000000;
        color: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
      }


      /* ==========================================================
        HEADER
        ========================================================== */

      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        margin-bottom: 18px;
      }

      .history-header h1 {
        margin: 0 0 5px;
        font-size: 26px;
        color: #ffffff;
      }

      .history-header p {
        margin: 0;
        color: #9ca3af;
        font-size: 13px;
      }

      .back-home-button {
        border: 1px solid #374151;
        border-radius: 7px;
        padding: 9px 15px;
        background: #111827;
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .back-home-button:hover {
        background: #1f2937;
      }


      /* ==========================================================
        SUMMARY CARDS
        ========================================================== */

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 18px;
      }

      .summary-card {
        background: #111111;
        border: 1px solid #2a2a2a;
        border-radius: 9px;
        padding: 14px 16px;
      }

      .summary-card span {
        display: block;
        color: #9ca3af;
        font-size: 12px;
        margin-bottom: 6px;
      }

      .summary-card strong {
        font-size: 21px;
        color: #ffffff;
      }


      /* ==========================================================
        TABLE CARD
        ========================================================== */

      .table-card {
        background: #0b0b0b;
        border: 1px solid #292929;
        border-radius: 10px;
        padding: 15px;
        overflow: hidden;
      }

      .table-header {
        margin-bottom: 12px;
      }

      .table-header h2 {
        margin: 0 0 4px;
        font-size: 17px;
        color: #ffffff;
      }

      .table-header p {
        margin: 0;
        color: #8f96a3;
        font-size: 12px;
      }


      /* ==========================================================
        HORIZONTAL SCROLL
        ========================================================== */

      .table-wrapper {
        width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        border: 1px solid #242424;
        border-radius: 7px;
      }

      /*
        Compact table.
        User can scroll horizontally to see all columns.
      */

      .decision-table {
        width: max-content;
        min-width: 100%;
        border-collapse: collapse;
        background: #050505;
      }


      /* ==========================================================
        TABLE HEADER
        ========================================================== */

      .decision-table th {
        padding: 9px 10px;
        background: #151515;
        border-bottom: 1px solid #333333;
        text-align: left;
        font-size: 10px;
        font-weight: 600;
        color: #b8b8b8;
        white-space: nowrap;
        position: sticky;
        top: 0;
        z-index: 2;
      }


      /* ==========================================================
        TABLE DATA
        ========================================================== */

      .decision-table td {
        padding: 9px 10px;
        border-bottom: 1px solid #202020;
        font-size: 11px;
        color: #e5e7eb;
        white-space: nowrap;
      }

      .decision-table tbody tr:hover {
        background: #151515;
      }


      /* ==========================================================
        DIFFERENCES
        ========================================================== */

      .positive {
        color: #ef4444 !important;
        font-weight: 600;
      }

      .negative {
        color: #22c55e !important;
        font-weight: 600;
      }

      .zero {
        color: #9ca3af !important;
        font-weight: 600;
      }


      /* ==========================================================
        STATUS
        ========================================================== */

      .status {
        display: inline-block;
        padding: 4px 7px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
      }

      .status-success {
        background: #12351f;
        color: #4ade80;
      }

      .status-failed {
        background: #3b1515;
        color: #f87171;
      }

      .status-delayed {
        background: #3b1515;
        color: #f87171;
      }

      .status-on-time {
        background: #12351f;
        color: #4ade80;
      }


      /* ==========================================================
        RISK
        ========================================================== */

      .risk-high {
        background: #3b1515;
        color: #f87171;
        padding: 4px 7px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
      }

      .risk-low {
        background: #12351f;
        color: #4ade80;
        padding: 4px 7px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
      }


      /* ==========================================================
        SCROLLBAR
        ========================================================== */

      .table-wrapper::-webkit-scrollbar {
        height: 8px;
      }

      .table-wrapper::-webkit-scrollbar-track {
        background: #111111;
      }

      .table-wrapper::-webkit-scrollbar-thumb {
        background: #444444;
        border-radius: 10px;
      }

      .table-wrapper::-webkit-scrollbar-thumb:hover {
        background: #666666;
      }


      /* ==========================================================
        EMPTY
        ========================================================== */

      .empty {
        text-align: center;
        padding: 40px;
        color: #9ca3af;
      }


      /* ==========================================================
        RESPONSIVE
        ========================================================== */

      @media (max-width: 900px) {

        .summary-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .history-header {
          flex-direction: column;
          align-items: flex-start;
        }

      }

      @media (max-width: 600px) {

        .history-page {
          padding: 12px;
        }

        .summary-grid {
          grid-template-columns: 1fr 1fr;
        }

      }

    `}</style>
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="history-header">

        <div>

          <h1>
            Decision History
          </h1>

          <p>
            Track decisions, expected results and actual outcomes
          </p>

        </div>

        <button
          className="back-home-button"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

      </div>

      {/* ================================================== */}
      {/* SUMMARY */}
      {/* ================================================== */}

      <div className="summary-grid">

        <div className="summary-card">

          <span>
            Total Decisions
          </span>

          <strong>
            {data.length}
          </strong>

        </div>

        <div className="summary-card">

          <span>
            Successful
          </span>

          <strong>
            {successful}
          </strong>

        </div>

        <div className="summary-card">

          <span>
            Delayed Shipments
          </span>

          <strong>
            {delayed}
          </strong>

        </div>

        <div className="summary-card">

          <span>
            Success Rate
          </span>

          <strong>
            {successRate.toFixed(1)}%
          </strong>

        </div>

      </div>

      {/* ================================================== */}
      {/* TABLE */}
      {/* ================================================== */}

      <div className="table-card">

        <div className="table-header">

          <h2>
            Decision / Outcome Records
          </h2>

          <p>
            Predicted vs actual performance from the closed-loop process
          </p>

        </div>

        {data.length === 0 ? (

          <div className="empty">
            No decision records found.
          </div>

        ) : (

          <div className="table-wrapper">

            <table className="decision-table">

              <thead>

                <tr>

                  <th>Decision ID</th>

                  <th>Shipment ID</th>

                  <th>Date</th>

                  <th>Category</th>

                  <th>Market</th>

                  <th>Region</th>

                  <th>Country</th>

                  <th>City</th>

                  <th>Shipping Mode</th>

                  <th>Quantity</th>

                  <th>Risk</th>

                  <th>Recommended Action</th>

                  <th>Expected Delivery</th>

                  <th>Actual Delivery</th>

                  <th>Delivery Difference</th>

                  <th>Expected Cost</th>

                  <th>Actual Cost</th>

                  <th>Cost Difference</th>

                  <th>Delivery Status</th>

                  <th>Outcome</th>

                </tr>

              </thead>

              <tbody>

                {data.map((row, index) => {

                  const expectedDelivery =
                    getNumber(
                      row,
                      "expected_delivery_days"
                    );

                  const actualDelivery =
                    getNumber(
                      row,
                      "actual_delivery_days"
                    );

                  const expectedCost =
                    getNumber(
                      row,
                      "expected_cost"
                    );

                  const actualCost =
                    getNumber(
                      row,
                      "actual_cost"
                    );

                  /*
                   * Positive delivery difference means
                   * actual delivery took more days.
                   */

                  const deliveryDifference =
                    actualDelivery -
                    expectedDelivery;

                  /*
                   * Positive cost difference means
                   * actual cost was higher.
                   */

                  const costDifference =
                    actualCost -
                    expectedCost;

                  const risk =
                    getNumber(
                      row,
                      "Late_delivery_risk"
                    );

                  const outcome =
                    getValue(
                      row,
                      "outcome_status"
                    );

                  const deliveryStatus =
                    getValue(
                      row,
                      "delivery_status"
                    );

                  const outcomeClass =
                    outcome.toLowerCase() ===
                    "successful"
                      ? "status-success"
                      : "status-failed";

                  const deliveryClass =
                    deliveryStatus
                      .toLowerCase()
                      .includes("delayed")
                      ? "status-delayed"
                      : "status-on-time";

                  return (

                    <tr key={index}>

                      {/* Decision ID */}

                      <td>
                        DEC-
                        {String(index + 1)
                          .padStart(4, "0")}
                      </td>

                      {/* Shipment ID */}

                      <td>
                        {getValue(
                          row,
                          "Shipment_ID"
                        )}
                      </td>

                      {/* Date */}

                      <td>
                        {getValue(
                          row,
                          "Shipment_Date"
                        )}
                      </td>

                      {/* Category */}

                      <td>
                        {getValue(
                          row,
                          "Category_Name"
                        )}
                      </td>

                      {/* Market */}

                      <td>
                        {getValue(
                          row,
                          "Market"
                        )}
                      </td>

                      {/* Region */}

                      <td>
                        {getValue(
                          row,
                          "Order_Region"
                        )}
                      </td>

                      {/* Country */}

                      <td>
                        {getValue(
                          row,
                          "Customer_Country"
                        )}
                      </td>

                      {/* City */}

                      <td>
                        {getValue(
                          row,
                          "Customer_City"
                        )}
                      </td>

                      {/* Shipping Mode */}

                      <td>
                        {getValue(
                          row,
                          "Shipping_Mode"
                        )}
                      </td>

                      {/* Quantity */}

                      <td>
                        {getValue(
                          row,
                          "Order_Item_Quantity"
                        )}
                      </td>

                      {/* Risk */}

                      <td>

                        {risk === 1 ? (

                          <span className="risk-high">
                            High
                          </span>

                        ) : (

                          <span className="risk-low">
                            Low
                          </span>

                        )}

                      </td>

                      {/* Recommended Action */}

                      <td>
                        {getValue(
                          row,
                          "recommended_action"
                        )}
                      </td>

                      {/* Expected Delivery */}

                      <td>
                        {expectedDelivery} days
                      </td>

                      {/* Actual Delivery */}

                      <td>
                        {actualDelivery} days
                      </td>

                      {/* Delivery Difference */}

                      <td
                        className={
                          deliveryDifference > 0
                            ? "positive"
                            : deliveryDifference < 0
                            ? "negative"
                            : "zero"
                        }
                      >

                        {deliveryDifference > 0
                          ? `+${deliveryDifference}`
                          : deliveryDifference}{" "}
                        days

                      </td>

                      {/* Expected Cost */}

                      <td>
                        {currency(
                          expectedCost
                        )}
                      </td>

                      {/* Actual Cost */}

                      <td>
                        {currency(
                          actualCost
                        )}
                      </td>

                      {/* Cost Difference */}

                      <td
                        className={
                          costDifference > 0
                            ? "positive"
                            : costDifference < 0
                            ? "negative"
                            : "zero"
                        }
                      >

                        {costDifference > 0
                          ? "+"
                          : ""}

                        {currency(
                          costDifference
                        )}

                      </td>

                      {/* Delivery Status */}

                      <td>

                        <span
                          className={`status ${deliveryClass}`}
                        >
                          {deliveryStatus}
                        </span>

                      </td>

                      {/* Outcome */}

                      <td>

                        <span
                          className={`status ${outcomeClass}`}
                        >
                          {outcome}
                        </span>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default DecisionHistory;