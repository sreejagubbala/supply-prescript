# supply-prescript
Download the DataCo Supply Chain dataset from Kaggle and save
DataCoSupplyChainDataset.csv in data/raw/.

# Supply Prescript

## Closed-Loop Prescriptive Analytics for Supply Chain Operations

Supply Prescript is a **closed-loop prescriptive analytics system** designed to help supply-chain managers move from simply predicting problems to making, tracking, and evaluating operational decisions.

The system combines:

* Predictive Analytics
* Prescriptive Analytics
* Optimization
* Decision Tracking
* Outcome Evaluation
* ROI Analysis
* Closed-Loop Feedback

The main idea is:

> **Predict → Prescribe → Decide → Execute → Measure → Learn → Improve**

---

## 1. Problem Statement

Traditional predictive analytics can identify potential supply-chain problems such as:

* Shipment delays
* Delivery risks
* Increased operational costs
* Supplier issues

However, prediction alone does not tell the manager what action should be taken.

Supply Prescript addresses this problem by using optimization to recommend operational actions and then evaluating whether those actions actually worked.

---

## 2. Project Objective

The objective of Supply Prescript is to build a system that can:

1. Analyze historical shipment data.
2. Predict shipment risk and delays.
3. Generate possible operational actions.
4. Select an optimized action.
5. Allow the manager to select or override the recommendation.
6. Track the selected decision.
7. Record the actual outcome.
8. Compare predicted and actual results.
9. Calculate savings and ROI.
10. Feed the outcome back into the decision process.

---

## 3. Closed-Loop Architecture

```text
              Historical Data
                    │
                    ▼
          ┌───────────────────┐
          │ Predictive Model  │
          └─────────┬─────────┘
                    │
                    ▼
          Risk / Delay Prediction
                    │
                    ▼
          ┌───────────────────┐
          │ Optimization      │
          │ Engine            │
          └─────────┬─────────┘
                    │
                    ▼
           Recommended Actions
                    │
                    ▼
          ┌───────────────────┐
          │ Manager Decision  │
          └─────────┬─────────┘
                    │
                    ▼
           Decision Tracking
                    │
                    ▼
            Actual Outcome
                    │
                    ▼
          Predicted vs Actual
                    │
                    ▼
          ROI / KPI Evaluation
                    │
                    ▼
             Feedback Loop
                    │
                    └──────────────► Future Decisions
```

---

## 4. Example Use Case

A shipment of microchips is predicted to experience a **14-day delay**.

The system generates possible actions:

| Option | Action             |        Expected Cost | Expected Delay |
| ------ | ------------------ | -------------------: | -------------: |
| A      | Air Freight        |              ₹15,000 |         2 days |
| B      | Secondary Supplier |         +10% premium |         4 days |
| C      | Delay Launch       | Lower immediate cost |        14 days |

The manager selects **Option A – Air Freight**.

The decision is stored in the decision history.

After execution, the actual outcome is recorded.

For example:

```text
Expected Cost : ₹15,000
Actual Cost   : ₹18,000

Expected Delay: 2 days
Actual Delay  : 3 days
```

The system evaluates the difference and uses the result as feedback for future decisions.

---

## 5. Main Features

### Predictive Analytics

Identifies shipment risks and potential delays using historical shipment information.

### Optimization

Generates or selects operational actions based on cost, delay, and business constraints.

### Decision Tracking

Records:

* Decision ID
* Shipment ID
* Decision date
* Recommended action
* Selected action
* Expected cost
* Expected delay
* Manager override

### Outcome Evaluation

Records actual operational results and compares them with the original prediction.

### ROI Analytics

Calculates:

* Expected cost
* Actual cost
* Savings
* Savings percentage
* Decision success
* ROI

### Closed-Loop Feedback

Uses actual outcomes to identify where previous recommendations performed well or poorly.

---

## 6. Project Structure

```text
supply-prescript/
│
├── README.md
│
├── docs/
│   └── closed-loop.md
│
├── backend/
│   └── app/
│       ├── main.py
│       │
│       ├── routes/
│       │   ├── outcomes.py
│       │   └── roi.py
│       │
│       └── ...
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DecisionROI.jsx
│   │   │   ├── DecisionHistory.jsx
│   │   │   └── ...
│   │   │
│   │   ├── components/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── data/
│   ├── sample_shipments.csv
│   └── processed/
│       └── decision_outcomes.csv
│
├── optimization/
│   └── ...
│
├── closedloop-analytics/
│   ├── decision_tracking.py
│   ├── performance_metrics.py
│   ├── outcome_recording.py
│   ├── evaluate_outcome.py
│   └── closed_loop_analysis.py
│
└── tests/
    └── ...
```

---

## 7. Member 5 – Closed-Loop & Analytics

The Closed-Loop & Analytics module is responsible for evaluating decisions after they are made.

### Main responsibilities

* Decision tracking
* Outcome recording
* Performance calculations
* Predicted vs actual comparison
* ROI calculations
* Decision success analysis
* Manager override analysis
* Closed-loop feedback
* Analytics dashboard integration

### Main Python modules

#### `decision_tracking.py`

Tracks and stores operational decisions.

#### `performance_metrics.py`

Calculates KPIs and performance metrics.

#### `outcome_recording.py`

Records actual decision outcomes.

#### `evaluate_outcome.py`

Evaluates expected versus actual operational results.

#### `closed_loop_analysis.py`

Combines decision, outcome, and performance information to produce closed-loop analytics.

---

## 8. Key Metrics

### Total Shipments

Number of evaluated shipment decisions.

### Total Expected Cost

Sum of predicted operational costs.

### Total Actual Cost

Sum of actual operational costs.

### Cost Saving

```text
Cost Saving =
Expected Cost - Actual Cost
```

### Cost Saving Percentage

```text
Cost Saving % =
Cost Saving / Expected Cost × 100
```

### On-Time Rate

```text
On-Time Rate =
On-Time Shipments / Total Shipments × 100
```

### Decision Success Rate

```text
Decision Success Rate =
Successful Decisions / Total Decisions × 100
```

### ROI

```text
ROI =
Savings / Decision Cost × 100
```

---

## 9. Frontend Dashboard

The React frontend provides analytics and decision-monitoring pages.

### Decision ROI

The Decision ROI dashboard displays:

* Total Shipments
* Cost Savings
* On-Time Rate
* Action Success Rate
* ROI
* Expected vs Actual Cost
* Delivery Performance
* Action Performance
* Shipping Mode Performance
* Market Performance
* Closed-Loop Process

### Decision History

The Decision History page displays historical decisions and their associated information.

It helps managers review:

* What the system recommended
* What action was selected
* Expected cost
* Expected delay
* Manager overrides
* Decision status

---

## 10. Backend

The backend is implemented using **Python and FastAPI**.

It provides APIs for communicating between the frontend and the Closed-Loop Analytics module.

Example architecture:

```text
React
  │
  │ HTTP / REST API
  ▼
FastAPI
  │
  ├── ROI Routes
  │
  ├── Outcome Routes
  │
  └── Analytics Logic
          │
          ▼
      Processed Data
```

---

## 11. Technology Stack

| Layer                | Technology               |
| -------------------- | ------------------------ |
| Frontend             | React                    |
| Build Tool           | Vite                     |
| Charts               | Recharts                 |
| Backend              | FastAPI                  |
| Programming Language | Python                   |
| Data Processing      | Pandas                   |
| Optimization         | Linear Programming       |
| Predictive Analytics | XGBoost / LightGBM       |
| Data Storage         | CSV / processed datasets |
| API                  | REST                     |
| Version Control      | Git / GitHub             |

---

## 12. Data

The project uses shipment-related data containing fields such as:

```text
Shipment_ID
Shipment_Date
Shipping_Mode
Days_for_shipment_scheduled
Category_Name
Market
Order_Region
Customer_Country
Customer_City
Order_Item_Quantity
Sales_per_customer
Order_Item_Total
Order_Profit_Per_Order
Late_delivery_risk
```

The processed outcome data contains expected and actual decision results used for closed-loop evaluation.

---

## 13. Running the Project

### Backend

Open a terminal in the project directory.

Activate the Python virtual environment:

### Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Start FastAPI:

```powershell
uvicorn backend.app.main:app --reload --port 8000
```

The backend runs on:

```text
http://localhost:8000
```

---

## 14. Frontend

Move into the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

The frontend is available through the Vite development URL displayed in the terminal.

---

## 15. API Documentation

When the FastAPI backend is running, interactive API documentation is available through the FastAPI Swagger interface.

The backend documentation can be used to test the available endpoints without directly using the React frontend.

---

## 16. Closed-Loop Decision Lifecycle

A decision follows this lifecycle:

```text
1. Shipment Risk Identified
          ↓
2. Possible Actions Generated
          ↓
3. Best Action Prescribed
          ↓
4. Manager Selects Action
          ↓
5. Decision Logged
          ↓
6. Action Executed
          ↓
7. Actual Outcome Recorded
          ↓
8. Predicted vs Actual Compared
          ↓
9. ROI / Success Calculated
          ↓
10. Feedback Generated
          ↓
11. Future Decisions Improved
```

---

## 17. Benefits

Supply Prescript provides:

* Data-driven supply-chain decisions
* Automated action recommendations
* Decision accountability
* Performance monitoring
* ROI visibility
* Prediction accuracy analysis
* Manager override tracking
* Continuous improvement
* Closed-loop learning

---

## 18. Future Enhancements

Possible future improvements include:

* PostgreSQL integration
* Real-time shipment data
* Real-time decision updates
* Automated model retraining
* Machine-learning-based feedback
* Dynamic optimization weights
* Advanced forecasting
* Model drift detection
* Authentication and role-based access
* Cloud deployment
* Automated alerts

---

## 19. Team

Supply Prescript is developed as a multi-member project with responsibilities divided across:

1. Predictive Analytics
2. Optimization
3. Decision / Business Logic
4. Frontend
5. Closed-Loop Analytics

### Member 5

**Role:** Closed-Loop & Analytics

Main contribution:

* Decision tracking
* Outcome recording
* Performance metrics
* ROI analytics
* Predicted vs actual analysis
* Decision history
* Closed-loop feedback
* Analytics API integration
* Analytics dashboard

---

## 20. Project Goal

The ultimate goal of Supply Prescript is to move supply-chain analytics from:

```text
"What is going to happen?"
```

to:

```text
"What should we do?"
```

and finally to:

```text
"Did our decision work, and how can we make the next decision better?"
```

This creates a complete **closed-loop prescriptive analytics system**.

---

## 21. Conclusion

Supply Prescript combines prediction, optimization, decision-making, and outcome evaluation into one continuous workflow.

The system does not stop after recommending an action. It tracks what happened after the decision, measures the result, calculates business impact, and uses the outcome as feedback.

Therefore, Supply Prescript provides a practical framework for:

**Predict → Prescribe → Decide → Execute → Measure → Learn → Improve**
