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

      row[header] =
        values[index]
          ? values[index].trim()
          : "";

    });

    return row;

  });
}


// ============================================================
// FIND COLUMN
// ============================================================

function findColumn(row, names) {

  const keys = Object.keys(row);

  for (const name of names) {

    const found = keys.find(
      (key) =>
        key
          .toLowerCase()
          .replace(/[\s_-]/g, "") ===
        name
          .toLowerCase()
          .replace(/[\s_-]/g, "")
    );

    if (found) {
      return found;
    }

  }

  return null;
}


// ============================================================
// GET VALUE
// ============================================================

function getValue(row, names) {

  const column = findColumn(row, names);

  if (!column) {
    return "-";
  }

  return row[column] || "-";
}


// ============================================================
// NUMBER
// ============================================================

function getNumber(row, names) {

  const value = getValue(row, names);

  const number = Number(
    String(value).replace(/[$₹,%]/g, "")
  );

  return Number.isNaN(number)
    ? 0
    : number;
}


// ============================================================
// CURRENCY
// ============================================================

function currency(value) {

  return `₹${Number(value).toLocaleString(
    undefined,
    {
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

        setData(parseCSV(text));

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
  // CALCULATE SUMMARY
  // ==========================================================

  const successful = data.filter((row) => {

    const value = getValue(
      row,
      [
        "Decision_Success",
        "decision_success",
        "Decision Success",
      ]
    );

    return String(value)
      .toLowerCase()
      .trim() === "successful";

  }).length;


  const partial = data.filter((row) => {

    const value = getValue(
      row,
      [
        "Decision_Success",
        "decision_success",
        "Decision Success",
      ]
    );

    return String(value)
      .toLowerCase()
      .includes("partial");

  }).length;


  const unsuccessful = data.filter((row) => {

    const value = getValue(
      row,
      [
        "Decision_Success",
        "decision_success",
        "Decision Success",
      ]
    );

    return String(value)
      .toLowerCase()
      .includes("unsuccessful");

  }).length;


  const successRate =
    data.length > 0
      ? (successful / data.length) * 100
      : 0;


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="history-page">

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

        <div className="loading-box">

          <h2>
            Loading Decision History...
          </h2>

          <p>
            Reading decision outcome data
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

      <div className="history-page">

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

        <div className="error-box">

          <h2>
            Data Loading Error
          </h2>

          <p>
            {error}
          </p>

          <button
            className="back-button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </div>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="history-page">

      {/* ================================================== */}
      {/* INLINE CSS */}
      {/* ================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .history-page {
          min-height: 100vh;
          padding: 28px;
          background: #f7f8fa;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
        }


        /* HEADER */

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .history-header h1 {
          margin: 0 0 7px;
          font-size: 30px;
        }

        .history-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .back-home-button {
          border: none;
          border-radius: 8px;
          padding: 11px 18px;
          background: #111827;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .back-home-button:hover {
          background: #374151;
        }


        /* SUMMARY */

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 25px;
        }

        .summary-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .summary-card span {
          display: block;
          color: #6b7280;
          font-size: 13px;
          margin-bottom: 9px;
        }

        .summary-card strong {
          font-size: 25px;
        }


        /* TABLE CARD */

        .table-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          overflow: hidden;
        }

        .table-header {
          margin-bottom: 18px;
        }

        .table-header h2 {
          margin: 0 0 5px;
          font-size: 19px;
        }

        .table-header p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }


        /* TABLE */

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .decision-table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        .decision-table th {
          padding: 13px 12px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
          font-size: 12px;
          color: #4b5563;
          white-space: nowrap;
        }

        .decision-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
          white-space: nowrap;
        }

        .decision-table tbody tr:hover {
          background: #fafafa;
        }


        /* STATUS */

        .status {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-success {
          background: #dcfce7;
          color: #166534;
        }

        .status-partial {
          background: #fef3c7;
          color: #92400e;
        }

        .status-failed {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-other {
          background: #e5e7eb;
          color: #374151;
        }


        /* DIFFERENCE */

        .positive {
          color: #b91c1c;
          font-weight: 600;
        }

        .negative {
          color: #15803d;
          font-weight: 600;
        }


        /* EMPTY */

        .empty {
          text-align: center;
          padding: 50px;
          color: #6b7280;
        }


        /* RESPONSIVE */

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
            padding: 16px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
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
      {/* SUMMARY CARDS */}
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
            Partially Successful
          </span>

          <strong>
            {partial}
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
      {/* DECISION TABLE */}
      {/* ================================================== */}

      <div className="table-card">

        <div className="table-header">

          <h2>
            Decision / Outcome Records
          </h2>

          <p>
            Expected vs actual performance from the closed-loop process
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

                  <th>
                    Decision ID
                  </th>

                  <th>
                    Shipment ID
                  </th>

                  <th>
                    Decision Date
                  </th>

                  <th>
                    Recommended Action
                  </th>

                  <th>
                    Selected Action
                  </th>

                  <th>
                    Expected Cost
                  </th>

                  <th>
                    Actual Cost
                  </th>

                  <th>
                    Cost Difference
                  </th>

                  <th>
                    Expected Delay
                  </th>

                  <th>
                    Actual Delay
                  </th>

                  <th>
                    Delay Difference
                  </th>

                  <th>
                    Success
                  </th>

                </tr>

              </thead>


              <tbody>

                {data.map((row, index) => {

                  const expectedCost = getNumber(
                    row,
                    [
                      "Expected_Cost",
                      "expected_cost",
                      "Expected Cost",
                    ]
                  );

                  const actualCost = getNumber(
                    row,
                    [
                      "Actual_Cost",
                      "actual_cost",
                      "Actual Cost",
                    ]
                  );

                  const expectedDelay = getNumber(
                    row,
                    [
                      "Expected_Delay_Days",
                      "expected_delay_days",
                      "Expected Delay Days",
                    ]
                  );

                  const actualDelay = getNumber(
                    row,
                    [
                      "Actual_Delay_Days",
                      "actual_delay_days",
                      "Actual Delay Days",
                    ]
                  );

                  const costDifference =
                    actualCost - expectedCost;

                  const delayDifference =
                    actualDelay - expectedDelay;


                  const success = getValue(
                    row,
                    [
                      "Decision_Success",
                      "decision_success",
                      "Decision Success",
                    ]
                  );


                  const successText =
                    String(success).toLowerCase();


                  let statusClass =
                    "status-other";


                  if (
                    successText === "successful"
                  ) {

                    statusClass =
                      "status-success";

                  } else if (
                    successText.includes("partial")
                  ) {

                    statusClass =
                      "status-partial";

                  } else if (
                    successText.includes("unsuccessful")
                  ) {

                    statusClass =
                      "status-failed";

                  }


                  return (

                    <tr key={index}>

                      <td>
                        {getValue(
                          row,
                          [
                            "Decision_ID",
                            "decision_id",
                            "Decision ID",
                          ]
                        )}
                      </td>

                      <td>
                        {getValue(
                          row,
                          [
                            "Shipment_ID",
                            "shipment_id",
                            "Shipment ID",
                          ]
                        )}
                      </td>

                      <td>
                        {getValue(
                          row,
                          [
                            "Decision_Date",
                            "decision_date",
                            "Decision Date",
                          ]
                        )}
                      </td>

                      <td>
                        {getValue(
                          row,
                          [
                            "Recommended_Action",
                            "recommended_action",
                            "Recommended Action",
                          ]
                        )}
                      </td>

                      <td>
                        {getValue(
                          row,
                          [
                            "Selected_Action",
                            "selected_action",
                            "Selected Action",
                          ]
                        )}
                      </td>

                      <td>
                        {currency(expectedCost)}
                      </td>

                      <td>
                        {currency(actualCost)}
                      </td>

                      <td
                        className={
                          costDifference > 0
                            ? "positive"
                            : "negative"
                        }
                      >
                        {currency(costDifference)}
                      </td>

                      <td>
                        {expectedDelay} days
                      </td>

                      <td>
                        {actualDelay} days
                      </td>

                      <td
                        className={
                          delayDifference > 0
                            ? "positive"
                            : "negative"
                        }
                      >
                        {delayDifference} days
                      </td>

                      <td>

                        <span
                          className={`status ${statusClass}`}
                        >
                          {success}
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