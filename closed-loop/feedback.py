"""
Supply Prescript - Closed Loop Feedback

Member 5

Analyzes actual outcomes and identifies:
- Successful actions
- Underperforming actions
- High-risk performance
- Cost-saving performance

This is the initial feedback layer.
"""

from pathlib import Path
from typing import Dict

import pandas as pd

from performance_metrics import (
    prepare_outcome_data,
)


# ============================================================
# Paths
# ============================================================

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

DATA_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "decision_outcomes.csv"
)


# ============================================================
# Load data
# ============================================================

def load_data() -> pd.DataFrame:

    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Outcome file not found:\n{DATA_FILE}"
        )

    return pd.read_csv(
        DATA_FILE
    )


# ============================================================
# Generate overall feedback
# ============================================================

def generate_feedback(
    df: pd.DataFrame,
) -> Dict:

    prepared = prepare_outcome_data(
        df
    )

    if len(prepared) == 0:

        return {
            "status": "no_data",
            "message":
                "No outcome data available.",
        }

    success_rate = (
        prepared["action_success"].mean()
        * 100
    )

    on_time_rate = (
        prepared["on_time"].mean()
        * 100
    )

    cost_saving = (
        prepared["cost_saving"].sum()
    )

    # --------------------------------------------------------
    # Overall status
    # --------------------------------------------------------

    if success_rate >= 80:

        performance_status = "Good"

    elif success_rate >= 60:

        performance_status = "Moderate"

    else:

        performance_status = (
            "Needs Improvement"
        )

    # --------------------------------------------------------
    # Action-level performance
    # --------------------------------------------------------

    action_performance = (
        prepared
        .groupby("recommended_action")
        .agg(
            shipments=(
                "Shipment_ID",
                "nunique",
            ),

            success_rate=(
                "action_success",
                "mean",
            ),

            cost_saving=(
                "cost_saving",
                "sum",
            ),
        )
        .reset_index()
    )

    action_performance[
        "success_rate"
    ] *= 100

    underperforming_actions = (
        action_performance[
            action_performance[
                "success_rate"
            ] < 60
        ][
            "recommended_action"
        ]
        .tolist()
    )

    return {
        "status": "success",

        "performance_status":
            performance_status,

        "total_shipments":
            len(prepared),

        "action_success_rate":
            round(
                success_rate,
                2,
            ),

        "on_time_delivery_rate":
            round(
                on_time_rate,
                2,
            ),

        "total_cost_saving":
            round(
                float(cost_saving),
                2,
            ),

        "underperforming_actions":
            underperforming_actions,
    }


# ============================================================
# Detailed action feedback
# ============================================================

def generate_action_feedback(
    df: pd.DataFrame,
) -> pd.DataFrame:

    prepared = prepare_outcome_data(
        df
    )

    result = (
        prepared
        .groupby("recommended_action")
        .agg(
            total_shipments=(
                "Shipment_ID",
                "nunique",
            ),

            cost_saving=(
                "cost_saving",
                "sum",
            ),

            average_delay=(
                "delay_days",
                "mean",
            ),

            on_time_rate=(
                "on_time",
                "mean",
            ),

            success_rate=(
                "action_success",
                "mean",
            ),
        )
        .reset_index()
    )

    result["on_time_rate"] *= 100

    result["success_rate"] *= 100

    # --------------------------------------------------------
    # Feedback classification
    # --------------------------------------------------------

    def classify(
        value: float,
    ) -> str:

        if value >= 80:
            return "Good performance"

        if value >= 60:
            return "Monitor performance"

        return "Needs improvement"

    result["feedback"] = (
        result["success_rate"]
        .apply(classify)
    )

    return result.round(2)


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    df = load_data()

    feedback = generate_feedback(
        df
    )

    detailed_feedback = (
        generate_action_feedback(df)
    )

    print()
    print("=" * 65)
    print(
        "SUPPLY PRESCRIPT - CLOSED LOOP FEEDBACK"
    )
    print("=" * 65)

    print()

    for key, value in feedback.items():

        print(
            f"{key}: {value}"
        )

    print()
    print(
        "ACTION LEVEL FEEDBACK"
    )

    print(
        "-" * 65
    )

    print(
        detailed_feedback.to_string(
            index=False
        )
    )