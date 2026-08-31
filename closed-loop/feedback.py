from pathlib import Path

import pandas as pd


# ============================================================
# SUPPLY PRESCRIPT
# Day 12 - Closed Loop Feedback
# Member 5 - Closed Loop & Analytics
# ============================================================

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

OUTCOME_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "decision_outcomes.csv"
)

FEEDBACK_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "decision_feedback.csv"
)


# ============================================================
# Load outcome data
# ============================================================

def load_outcomes() -> pd.DataFrame:

    if not OUTCOME_FILE.exists():
        raise FileNotFoundError(
            f"Outcome file not found:\n{OUTCOME_FILE}"
        )

    return pd.read_csv(OUTCOME_FILE)


# ============================================================
# Generate feedback for one decision
# ============================================================

def generate_feedback(
    row,
) -> dict:

    expected_cost = float(
        row["expected_cost"]
    )

    actual_cost = float(
        row["actual_cost"]
    )

    expected_days = float(
        row["expected_delivery_days"]
    )

    actual_days = float(
        row["actual_delivery_days"]
    )

    cost_difference = (
        actual_cost
        - expected_cost
    )

    delay_difference = (
        actual_days
        - expected_days
    )

    if (
        actual_cost <= expected_cost
        and actual_days <= expected_days
    ):
        feedback_status = "Positive"

    elif (
        actual_cost > expected_cost
        and actual_days > expected_days
    ):
        feedback_status = "Negative"

    else:
        feedback_status = "Mixed"

    return {
        "Shipment_ID":
            row["Shipment_ID"],

        "Recommended_Action":
            row["recommended_action"],

        "Selected_Action":
            row.get(
                "selected_action",
                row["recommended_action"],
            ),

        "Expected_Cost":
            round(expected_cost, 2),

        "Actual_Cost":
            round(actual_cost, 2),

        "Cost_Difference":
            round(cost_difference, 2),

        "Expected_Delay_Days":
            round(expected_days, 2),

        "Actual_Delay_Days":
            round(actual_days, 2),

        "Delay_Difference":
            round(delay_difference, 2),

        "Outcome_Status":
            row["outcome_status"],

        "Feedback_Status":
            feedback_status,
    }


# ============================================================
# Generate feedback dataset
# ============================================================

def create_feedback(
    df: pd.DataFrame,
) -> pd.DataFrame:

    required = [
        "Shipment_ID",
        "recommended_action",
        "expected_cost",
        "actual_cost",
        "expected_delivery_days",
        "actual_delivery_days",
        "outcome_status",
    ]

    missing = [
        column
        for column in required
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "Missing columns for feedback: "
            + ", ".join(missing)
        )

    records = [
        generate_feedback(row)
        for _, row in df.iterrows()
    ]

    return pd.DataFrame(records)


# ============================================================
# Calculate action feedback
# ============================================================

def calculate_action_feedback(
    feedback_df: pd.DataFrame,
) -> pd.DataFrame:

    result = (
        feedback_df
        .groupby("Recommended_Action")
        .agg(
            decisions=(
                "Shipment_ID",
                "count",
            ),
            average_cost_difference=(
                "Cost_Difference",
                "mean",
            ),
            average_delay_difference=(
                "Delay_Difference",
                "mean",
            ),
            positive_feedback=(
                "Feedback_Status",
                lambda x: (
                    x == "Positive"
                ).sum(),
            ),
            negative_feedback=(
                "Feedback_Status",
                lambda x: (
                    x == "Negative"
                ).sum(),
            ),
        )
        .reset_index()
    )

    result["positive_rate"] = (
        result["positive_feedback"]
        / result["decisions"]
        * 100
    )

    result["negative_rate"] = (
        result["negative_feedback"]
        / result["decisions"]
        * 100
    )

    return result.round(2)


# ============================================================
# Calculate learning signals
# ============================================================

def calculate_learning_signals(
    feedback_df: pd.DataFrame,
) -> dict:

    if len(feedback_df) == 0:
        return {
            "total_feedback": 0,
            "positive_feedback_rate": 0.0,
            "negative_feedback_rate": 0.0,
            "average_cost_error": 0.0,
            "average_delay_error": 0.0,
            "recommended_weight_adjustment": 0.0,
        }

    positive_rate = (
        (
            feedback_df["Feedback_Status"]
            == "Positive"
        ).mean()
        * 100
    )

    negative_rate = (
        (
            feedback_df["Feedback_Status"]
            == "Negative"
        ).mean()
        * 100
    )

    average_cost_error = (
        feedback_df["Cost_Difference"]
        .abs()
        .mean()
    )

    average_delay_error = (
        feedback_df["Delay_Difference"]
        .abs()
        .mean()
    )

    # Simple learning signal.
    # Positive value = increase caution/penalty.
    # Negative value = reduce penalty.
    if negative_rate > 50:
        weight_adjustment = 0.10

    elif positive_rate > 70:
        weight_adjustment = -0.05

    else:
        weight_adjustment = 0.0

    return {
        "total_feedback":
            int(len(feedback_df)),

        "positive_feedback_rate":
            round(
                positive_rate,
                2,
            ),

        "negative_feedback_rate":
            round(
                negative_rate,
                2,
            ),

        "average_cost_error":
            round(
                average_cost_error,
                2,
            ),

        "average_delay_error":
            round(
                average_delay_error,
                2,
            ),

        "recommended_weight_adjustment":
            weight_adjustment,
    }


# ============================================================
# Save feedback
# ============================================================

def save_feedback(
    feedback_df: pd.DataFrame,
) -> None:

    FEEDBACK_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    feedback_df.to_csv(
        FEEDBACK_FILE,
        index=False,
    )


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    outcomes = load_outcomes()

    feedback = create_feedback(
        outcomes
    )

    save_feedback(
        feedback
    )

    action_feedback = (
        calculate_action_feedback(
            feedback
        )
    )

    learning = (
        calculate_learning_signals(
            feedback
        )
    )

    print("=" * 65)
    print(
        "SUPPLY PRESCRIPT - DAY 12 FEEDBACK"
    )
    print("=" * 65)

    print()

    print("LEARNING SIGNALS")
    print("-" * 65)

    for key, value in learning.items():
        print(
            f"{key.replace('_', ' ').title()}: "
            f"{value}"
        )

    print()
    print("ACTION FEEDBACK")
    print("-" * 65)

    print(
        action_feedback.to_string(
            index=False
        )
    )

    print()
    print(
        f"Feedback file: {FEEDBACK_FILE}"
    )