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
  return `₹${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ============================================================
// GENERATE FEEDBACK
// ============================================================

function generateFeedback(row) {
  const expectedDelivery = getNumber(
    row,
    "expected_delivery_days"
  );

  const actualDelivery = getNumber(
    row,
    "actual_delivery_days"
  );

  const expectedCost = getNumber(
    row,
    "expected_cost"
  );

  const actualCost = getNumber(
    row,
    "actual_cost"
  );

  const deliveryDifference =
    actualDelivery - expectedDelivery;

  const costDifference =
    actualCost - expectedCost;

  const outcome = String(
    getValue(row, "outcome_status")
  ).toLowerCase();

  const deliveryStatus = String(
    getValue(row, "delivery_status")
  ).toLowerCase();

  const messages = [];

  // Delivery feedback
  if (deliveryDifference > 0) {
    messages.push(
      `Delivery was ${deliveryDifference} day(s) slower than expected.`
    );
  } else if (deliveryDifference < 0) {
    messages.push(
      `Delivery was ${Math.abs(
        deliveryDifference
      )} day(s) faster than expected.`
    );
  } else {
    messages.push(
      "Delivery matched the expected delivery time."
    );
  }

  // Cost feedback
  if (costDifference > 0) {
    messages.push(
      `Actual operational cost was ${currency(
        costDifference
      )} higher than expected.`
    );
  } else if (costDifference < 0) {
    messages.push(
      `Actual operational cost was ${currency(
        Math.abs(costDifference)
      )} lower than expected.`
    );
  } else {
    messages.push(
      "Actual cost matched the expected cost."
    );
  }

  // Outcome feedback
  if (outcome === "successful") {
    messages.push(
      "The selected decision produced a successful outcome."
    );
  } else {
    messages.push(
      "The decision was unsuccessful and should be reviewed for the next optimization cycle."
    );
  }

  // Closed-loop recommendation
  if (
    deliveryStatus.includes("delayed") ||
    deliveryDifference > 0
  ) {
    messages.push(
      "Future recommendations should consider additional delivery-risk factors."
    );
  }

  if (costDifference > 0) {
    messages.push(
      "Future optimization should give greater importance to operational cost."
    );
  }

  return messages;
}

// ============================================================
// FEEDBACK PAGE
// ============================================================

function Feedback() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD DECISION DATA
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
  // SUMMARY
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

  const totalCostDifference = data.reduce(
    (total, row) => {
      const expected = getNumber(
        row,
        "expected_cost"
      );

      const actual = getNumber(
        row,
        "actual_cost"
      );

      return total + (actual - expected);
    },
    0
  );

  const successRate =
    data.length > 0
      ? (successful / data.length) * 100
      : 0;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="feedback-page">
        <div className="loading-box">
          <h2>Loading Feedback...</h2>
          <p>
            Evaluating closed-loop decision outcomes
          </p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="feedback-page">
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

        <style>{styles}</style>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="feedback-page">
      <style>{styles}</style>

      {/* HEADER */}

      <div className="feedback-header">
        <div>
          <h1>Closed-Loop Feedback</h1>

          <p>
            Evaluate actual outcomes and generate feedback
            for the next optimization cycle
          </p>
        </div>

        <button
          className="back-home-button"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </div>

      {/* SUMMARY */}

      <div className="summary-grid">

        <div className="summary-card">
          <span>Total Decisions</span>
          <strong>{data.length}</strong>
        </div>

        <div className="summary-card">
          <span>Successful</span>
          <strong>{successful}</strong>
        </div>

        <div className="summary-card">
          <span>Unsuccessful</span>
          <strong>{unsuccessful}</strong>
        </div>

        <div className="summary-card">
          <span>Delayed</span>
          <strong>{delayed}</strong>
        </div>

        <div className="summary-card">
          <span>Success Rate</span>
          <strong>
            {successRate.toFixed(1)}%
          </strong>
        </div>

        <div className="summary-card">
          <span>Total Cost Difference</span>
          <strong
            className={
              totalCostDifference > 0
                ? "negative-value"
                : "positive-value"
            }
          >
            {currency(totalCostDifference)}
          </strong>
        </div>

      </div>

      {/* FEEDBACK RECORDS */}

      <div className="feedback-card">

        <div className="card-header">
          <h2>Decision Feedback</h2>

          <p>
            Actual performance is compared with predicted
            performance to improve future decisions.
          </p>
        </div>

        {data.length === 0 ? (
          <div className="empty">
            No decision records available.
          </div>
        ) : (
          <div className="feedback-list">

            {data.map((row, index) => {

              const feedback =
                generateFeedback(row);

              const outcome =
                String(
                  getValue(
                    row,
                    "outcome_status"
                  )
                ).toLowerCase();

              const successfulOutcome =
                outcome === "successful";

              return (
                <div
                  className="feedback-record"
                  key={index}
                >

                  {/* RECORD HEADER */}

                  <div className="record-header">

                    <div>
                      <h3>
                        DEC-
                        {String(index + 1).padStart(
                          4,
                          "0"
                        )}
                      </h3>

                      <p>
                        Shipment:{" "}
                        {getValue(
                          row,
                          "Shipment_ID"
                        )}
                      </p>
                    </div>

                    <span
                      className={
                        successfulOutcome
                          ? "status success"
                          : "status failed"
                      }
                    >
                      {getValue(
                        row,
                        "outcome_status"
                      )}
                    </span>

                  </div>

                  {/* DECISION INFORMATION */}

                  <div className="record-info">

                    <div>
                      <span>Recommended Action</span>

                      <strong>
                        {getValue(
                          row,
                          "recommended_action"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Expected Delivery</span>

                      <strong>
                        {getValue(
                          row,
                          "expected_delivery_days"
                        )}{" "}
                        days
                      </strong>
                    </div>

                    <div>
                      <span>Actual Delivery</span>

                      <strong>
                        {getValue(
                          row,
                          "actual_delivery_days"
                        )}{" "}
                        days
                      </strong>
                    </div>

                    <div>
                      <span>Expected Cost</span>

                      <strong>
                        {currency(
                          getNumber(
                            row,
                            "expected_cost"
                          )
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Actual Cost</span>

                      <strong>
                        {currency(
                          getNumber(
                            row,
                            "actual_cost"
                          )
                        )}
                      </strong>
                    </div>

                  </div>

                  {/* FEEDBACK */}

                  <div className="feedback-section">

                    <h4>
                      Feedback for Next Cycle
                    </h4>

                    {feedback.map(
                      (message, feedbackIndex) => (
                        <div
                          className="feedback-message"
                          key={feedbackIndex}
                        >
                          <span>•</span>
                          <p>{message}</p>
                        </div>
                      )
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

// ============================================================
// CSS
// ============================================================

const styles = `

* {
  box-sizing: border-box;
}

.feedback-page {
  min-height: 100vh;
  padding: 20px;
  background: #000000;
  color: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
}

/* HEADER */

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 18px;
}

.feedback-header h1 {
  margin: 0 0 5px;
  font-size: 26px;
}

.feedback-header p {
  margin: 0;
  color: #9ca3af;
  font-size: 13px;
}

.back-home-button,
.back-button {
  border: 1px solid #374151;
  border-radius: 7px;
  padding: 9px 15px;
  background: #111827;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.back-home-button:hover,
.back-button:hover {
  background: #1f2937;
}

/* SUMMARY */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
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
  font-size: 20px;
}

.positive-value {
  color: #4ade80;
}

.negative-value {
  color: #f87171;
}

/* MAIN CARD */

.feedback-card {
  background: #0b0b0b;
  border: 1px solid #292929;
  border-radius: 10px;
  padding: 15px;
}

.card-header {
  margin-bottom: 15px;
}

.card-header h2 {
  margin: 0 0 4px;
  font-size: 17px;
}

.card-header p {
  margin: 0;
  color: #8f96a3;
  font-size: 12px;
}

/* RECORD */

.feedback-record {
  background: #050505;
  border: 1px solid #292929;
  border-radius: 9px;
  padding: 16px;
  margin-bottom: 12px;
}

.feedback-record:last-child {
  margin-bottom: 0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #222222;
}

.record-header h3 {
  margin: 0 0 4px;
  font-size: 14px;
}

.record-header p {
  margin: 0;
  color: #8f96a3;
  font-size: 11px;
}

/* STATUS */

.status {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.status.success {
  background: #12351f;
  color: #4ade80;
}

.status.failed {
  background: #3b1515;
  color: #f87171;
}

/* INFO */

.record-info {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 15px 0;
}

.record-info div {
  background: #111111;
  border: 1px solid #222222;
  border-radius: 7px;
  padding: 10px;
}

.record-info span {
  display: block;
  color: #8f96a3;
  font-size: 10px;
  margin-bottom: 5px;
}

.record-info strong {
  display: block;
  color: #e5e7eb;
  font-size: 11px;
}

/* FEEDBACK */

.feedback-section {
  border-top: 1px solid #222222;
  padding-top: 13px;
}

.feedback-section h4 {
  margin: 0 0 10px;
  font-size: 12px;
  color: #ffffff;
}

.feedback-message {
  display: flex;
  gap: 8px;
  margin-bottom: 7px;
}

.feedback-message span {
  color: #60a5fa;
  font-weight: bold;
}

.feedback-message p {
  margin: 0;
  color: #b9c0cc;
  font-size: 11px;
  line-height: 1.5;
}

/* EMPTY */

.empty {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

/* LOADING */

.feedback-page:has(.loading-box) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-box {
  background: #111111;
  border: 1px solid #2a2a2a;
  padding: 35px;
  border-radius: 12px;
  text-align: center;
}

.loading-box h2 {
  margin: 0 0 8px;
}

.loading-box p {
  color: #9ca3af;
  font-size: 13px;
}

/* ERROR */

.error-box {
  max-width: 600px;
  margin: 100px auto;
  padding: 30px;
  background: #3b1515;
  border: 1px solid #632323;
  border-radius: 12px;
  text-align: center;
}

.error-box p {
  color: #fca5a5;
}

/* RESPONSIVE */

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .record-info {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .record-info {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .feedback-page {
    padding: 12px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .record-info {
    grid-template-columns: 1fr;
  }
}

`;

export default Feedback;
