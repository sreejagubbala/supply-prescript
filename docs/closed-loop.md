# Supply Prescript – Closed-Loop Analytics

## 1. Overview

Supply Prescript is a closed-loop prescriptive analytics system for supply chain decision-making.

Traditional predictive analytics identify what is likely to happen, but they do not always explain what action should be taken. Supply Prescript combines prediction, optimization, decision tracking, and outcome evaluation to create a continuous decision-making loop.

The Closed-Loop Analytics module is responsible for tracking decisions, recording actual outcomes, comparing predicted and actual results, calculating performance metrics, and generating feedback that can improve future decisions.

---

## 2. Closed-Loop Workflow

The Supply Prescript closed-loop process follows these stages:

```text
Historical Shipment Data
          ↓
   Predictive Analysis
          ↓
   Risk / Delay Prediction
          ↓
   Optimization Engine
          ↓
 Recommended Actions
          ↓
    Manager Decision
          ↓
    Decision Logging
          ↓
    Actual Outcome
          ↓
 Predicted vs Actual
     Comparison
          ↓
 Performance / ROI
      Evaluation
          ↓
   Feedback & Learning
          ↓
 Improved Future Decisions
```

The loop allows the system to learn from previously selected decisions and their actual operational outcomes.

---

## 3. Objectives

The Closed-Loop Analytics module has the following objectives:

* Track recommended and selected decisions.
* Record manager overrides.
* Store expected operational costs and delays.
* Record actual operational outcomes.
* Compare predicted outcomes with actual outcomes.
* Calculate cost savings.
* Calculate delivery performance.
* Measure decision success.
* Calculate ROI.
* Analyze manager overrides.
* Generate feedback for future optimization.

---

## 4. Decision Tracking

Every decision made by the system or manager is recorded.

### Decision Fields

| Field               | Description                                              |
| ------------------- | -------------------------------------------------------- |
| Decision_ID         | Unique identifier for the decision                       |
| Shipment_ID         | Shipment associated with the decision                    |
| Decision_Date       | Date on which the decision was made                      |
| Recommended_Action  | Action recommended by the system                         |
| Selected_Action     | Action selected by the manager                           |
| Expected_Cost       | Predicted operational cost                               |
| Expected_Delay_Days | Predicted delay                                          |
| Manager_Override    | Indicates whether the manager changed the recommendation |

Example:

```text
Decision_ID: DEC-0001
Shipment_ID: SHIP-1001
Recommended_Action: Air Freight
Selected_Action: Air Freight
Expected_Cost: 15000
Expected_Delay_Days: 2
Manager_Override: False
```

---

## 5. Outcome Recording

After the selected action has been executed, the actual result is recorded.

The outcome data contains information such as:

* Actual cost
* Actual delivery days
* Expected cost
* Expected delivery days
* Selected action
* Shipment information

The outcome recording process makes it possible to determine whether the original recommendation was successful.

---

## 6. Predicted vs Actual Analysis

The system compares expected results with actual results.

### Cost Comparison

```text
Cost Difference =
Actual Cost - Expected Cost
```

A negative difference indicates that the actual cost was lower than expected.

### Cost Saving

```text
Cost Saving =
Expected Cost - Actual Cost
```

### Cost Saving Percentage

```text
Cost Saving Percentage =
(Cost Saving / Expected Cost) × 100
```

### Delivery Difference

```text
Delivery Difference =
Actual Delivery Days - Expected Delivery Days
```

A negative value means that the shipment was delivered faster than expected.

---

## 7. Performance Metrics

The Closed-Loop Analytics module calculates several KPIs.

### Total Shipments

The total number of shipment decisions evaluated.

### Expected Cost

Total predicted operational cost across evaluated decisions.

### Actual Cost

Total actual operational cost after decisions were executed.

### Total Savings

```text
Total Savings =
Total Expected Cost - Total Actual Cost
```

### On-Time Rate

The percentage of shipments that were delivered within the expected delivery period.

```text
On-Time Rate =
On-Time Shipments / Total Shipments × 100
```

### Decision Success Rate

The percentage of decisions that achieved the desired operational outcome.

```text
Decision Success Rate =
Successful Decisions / Total Decisions × 100
```

### ROI

ROI measures the financial benefit obtained from the prescribed decisions.

```text
ROI =
Savings / Decision Cost × 100
```

The exact ROI calculation can be adjusted depending on the project's final business-cost assumptions.

---

## 8. Action Performance

The system analyzes the performance of different prescription actions.

Examples include:

* Air Freight
* Secondary Supplier
* Delay Launch
* Standard Shipping

For every action, the system can analyze:

* Number of decisions
* Expected cost
* Actual cost
* Cost savings
* Success rate
* Average delivery performance

This helps identify which actions perform best under different supply-chain conditions.

---

## 9. Shipping Mode Analysis

Performance can also be grouped by shipping mode.

Examples:

* Standard Class
* Second Class
* First Class
* Same Day

The system evaluates:

```text
Shipping Mode
      ↓
Number of Shipments
      ↓
Expected Cost
      ↓
Actual Cost
      ↓
Savings
      ↓
Success Rate
```

This allows supply-chain managers to identify inefficient shipping modes and better-performing alternatives.

---

## 10. Market and Region Analysis

Closed-loop analytics can be grouped by:

* Market
* Order Region
* Shipping Mode
* Recommended Action
* Selected Action

This helps identify geographic or operational areas where the prescription system performs particularly well or poorly.

---

## 11. Manager Override Analysis

Managers may sometimes reject the system recommendation.

The system records this using the `Manager_Override` field.

The override rate is calculated as:

```text
Override Rate =
Number of Overrides / Total Decisions × 100
```

A high override rate may indicate:

* The recommendation does not match business requirements.
* Important operational constraints are missing.
* The manager has additional information unavailable to the system.
* The optimization weights need adjustment.

Therefore, manager overrides are treated as valuable feedback rather than simply as errors.

---

## 12. Feedback Loop

The most important part of the module is the feedback mechanism.

```text
Recommendation
      ↓
Manager Selection
      ↓
Actual Outcome
      ↓
Performance Evaluation
      ↓
Error Identification
      ↓
Feedback
      ↓
Optimization Adjustment
      ↓
Future Recommendation
```

For example:

```text
Recommended Action:
Air Freight

Expected Cost:
₹15,000

Actual Cost:
₹18,000

Cost Difference:
₹3,000 higher than expected
```

This result indicates that the assumed cost of Air Freight was underestimated.

The result can be used as feedback when future optimization decisions are generated.

---

## 13. Main Backend Components

The Closed-Loop Analytics implementation contains the following Python modules:

### `decision_tracking.py`

Responsible for:

* Creating decision IDs
* Tracking decisions
* Saving decisions
* Loading decisions
* Calculating manager override rate
* Generating decision summaries

### `performance_metrics.py`

Responsible for:

* Validating source data
* Validating outcome data
* Preparing outcome data
* Calculating savings
* Calculating delay performance
* Calculating decision success
* Calculating prediction accuracy
* Generating KPI metrics
* Generating grouped analytics

### `outcome_recording.py`

Responsible for recording the actual outcome associated with a selected decision.

### `evaluate_outcome.py`

Responsible for generating/evaluating sample operational outcomes and comparing expected and actual results.

### `closed_loop_analysis.py`

Acts as the main analytics layer.

It combines:

```text
Decision Tracking
        +
Outcome Data
        +
Performance Metrics
        +
ROI Analysis
        +
Feedback
```

---

## 14. API Integration

The Closed-Loop Analytics functionality is exposed through the FastAPI backend.

The frontend communicates with the backend using REST APIs.

Example architecture:

```text
React Frontend
      ↓
FastAPI Backend
      ↓
Closed-Loop Routes
      ↓
Analytics Functions
      ↓
CSV / Processed Data
```

The backend can provide:

* Decision information
* Outcome information
* ROI metrics
* Performance metrics
* Decision history
* Closed-loop analytics

---

## 15. Frontend Analytics

The frontend provides dashboards for visualizing closed-loop performance.

Important pages include:

### Decision ROI

Displays:

* Total shipments
* Total savings
* On-time rate
* Action success
* ROI
* Expected vs actual cost
* Delivery performance
* Action performance
* Shipping-mode performance
* Market performance

### Decision History

Displays previously recorded decisions.

Typical information includes:

* Decision ID
* Shipment ID
* Decision date
* Recommended action
* Selected action
* Expected cost
* Expected delay
* Manager override
* Decision status

---

## 16. Data Flow

The complete data flow is:

```text
sample_shipments.csv
        ↓
Prediction / Risk Analysis
        ↓
Optimization
        ↓
Decision
        ↓
decision_tracking.py
        ↓
Decision Record
        ↓
Outcome Recording
        ↓
decision_outcomes.csv
        ↓
performance_metrics.py
        ↓
closed_loop_analysis.py
        ↓
FastAPI API
        ↓
React Dashboard
```

---

## 17. Example Closed-Loop Scenario

A shipment has a predicted delay of 14 days.

The optimization engine recommends:

```text
Option A – Air Freight
Expected Cost: ₹15,000
Expected Delay: 2 days
```

The manager selects Air Freight.

The decision is logged.

After execution:

```text
Actual Cost: ₹18,000
Actual Delivery Delay: 3 days
```

The system calculates:

```text
Cost Difference = ₹18,000 - ₹15,000
                = ₹3,000

Cost Saving = ₹15,000 - ₹18,000
            = -₹3,000
```

The decision therefore did not achieve the expected cost benefit.

This result becomes feedback for future decisions.

---

## 18. Benefits

The Closed-Loop Analytics module provides:

* Better decision accountability
* Measurement of recommendation quality
* Visibility into actual business outcomes
* ROI measurement
* Detection of prediction errors
* Identification of successful actions
* Analysis of manager overrides
* Continuous improvement of optimization decisions

---

## 19. Future Improvements

The module can be extended with:

* Machine-learning-based feedback
* Automatic optimization-weight adjustment
* PostgreSQL decision storage
* Real-time outcome ingestion
* Advanced ROI calculations
* Model drift monitoring
* Automated retraining
* Action recommendation learning
* Real-time analytics dashboards

---

## 20. Conclusion

The Closed-Loop Analytics module completes the Supply Prescript decision lifecycle.

Instead of stopping after generating a recommendation, the system records the decision, observes the actual result, measures performance, calculates ROI, and feeds the result back into the decision-making process.

This creates a continuous:

**Predict → Prescribe → Decide → Execute → Measure → Learn → Improve**

closed-loop system for supply-chain operations.
