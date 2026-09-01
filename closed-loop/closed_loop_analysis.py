from pathlib import Path
from typing import Optional

import pandas as pd

from performance_metrics import (
    calculate_metrics,
    metrics_by_action,
    metrics_by_shipping_mode,
    metrics_by_market,
    metrics_by_region,
)
from decision_tracking import (
    decision_summary,
)


# ============================================================
# SUPPLY PRESCRIPT
# Member 5 - Closed Loop & Analytics
# Closed Loop Analysis
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

def load_data(
    file_path: Optional[Path] = None,
) -> pd.DataFrame:

    path = file_path or DATA_FILE

    if not path.exists():
        raise FileNotFoundError(
            f"Decision/outcome file not found:\n{path}\n\n"
            "Run outcome_recording.py first."
        )

    return pd.read_csv(path)


# ============================================================
# ROI calculation
# ============================================================

def calculate_roi(
    df: pd.DataFrame,
) -> dict:

    metrics = calculate_metrics(
        df
    )

    expected_cost = metrics[
        "total_expected_cost"
    ]

    cost_saving = metrics[
        "total_cost_saving"
    ]

    if expected_cost == 0:
        roi = 0.0
    else:
        roi = (
            cost_saving
            / expected_cost
            * 100
        )

    metrics["roi_percentage"] = round(
        roi,
        2,
    )

    return metrics


# ============================================================
# Predicted vs actual cost
# ============================================================

def predicted_vs_actual_cost(
    df: pd.DataFrame,
) -> pd.DataFrame:

    result = df.copy()

    result["Expected_Cost"] = pd.to_numeric(
        result["expected_cost"],
        errors="coerce",
    )

    result["Actual_Cost"] = pd.to_numeric(
        result["actual_cost"],
        errors="coerce",
    )

    result["Cost_Difference"] = (
        result["Actual_Cost"]
        - result["Expected_Cost"]
    )

    result["Cost_Saving"] = (
        result["Expected_Cost"]
        - result["Actual_Cost"]
    )

    return result[
        [
            "Shipment_ID",
            "recommended_action",
            "Expected_Cost",
            "Actual_Cost",
            "Cost_Difference",
            "Cost_Saving",
        ]
    ].round(2)


# ============================================================
# Predicted vs actual delivery
# ============================================================

def predicted_vs_actual_delivery(
    df: pd.DataFrame,
) -> pd.DataFrame:

    result = df.copy()

    result["Expected_Delivery_Days"] = (
        pd.to_numeric(
            result[
                "expected_delivery_days"
            ],
            errors="coerce",
        )
    )

    result["Actual_Delivery_Days"] = (
        pd.to_numeric(
            result[
                "actual_delivery_days"
            ],
            errors="coerce",
        )
    )

    result["Delay_Difference"] = (
        result["Actual_Delivery_Days"]
        - result["Expected_Delivery_Days"]
    )

    return result[
        [
            "Shipment_ID",
            "recommended_action",
            "Expected_Delivery_Days",
            "Actual_Delivery_Days",
            "Delay_Difference",
            "delivery_status",
        ]
    ].round(2)


# ============================================================
# Total savings
# ============================================================

def total_savings(
    df: pd.DataFrame,
) -> float:

    expected = pd.to_numeric(
        df["expected_cost"],
        errors="coerce",
    ).sum()

    actual = pd.to_numeric(
        df["actual_cost"],
        errors="coerce",
    ).sum()

    return round(
        expected - actual,
        2,
    )


# ============================================================
# Decision success rate
# ============================================================

def decision_success_rate(
    df: pd.DataFrame,
) -> float:

    if len(df) == 0:
        return 0.0

    successful = (
        df["outcome_status"]
        .astype(str)
        .str.strip()
        .str.lower()
        == "successful"
    ).sum()

    return round(
        successful / len(df) * 100,
        2,
    )


# ============================================================
# Successful decisions
# ============================================================

def successful_decisions(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return df[
        df["outcome_status"]
        .astype(str)
        .str.strip()
        .str.lower()
        == "successful"
    ].copy()


# ============================================================
# Unsuccessful decisions
# ============================================================

def unsuccessful_decisions(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return df[
        df["outcome_status"]
        .astype(str)
        .str.strip()
        .str.lower()
        == "unsuccessful"
    ].copy()


# ============================================================
# Manager overrides
# ============================================================

def manager_override_analysis(
    df: pd.DataFrame,
) -> dict:

    if (
        "Recommended_Action" in df.columns
        and "Selected_Action" in df.columns
    ):

        total = len(df)

        overrides = (
            df["Recommended_Action"]
            .astype(str)
            .str.strip()
            !=
            df["Selected_Action"]
            .astype(str)
            .str.strip()
        ).sum()

    else:
        total = len(df)
        overrides = 0

    if total == 0:
        rate = 0.0
    else:
        rate = (
            overrides / total * 100
        )

    return {
        "total_decisions": int(total),
        "manager_overrides": int(
            overrides
        ),
        "override_rate": round(
            rate,
            2,
        ),
    }


# ============================================================
# Closed-loop feedback
# ============================================================

def closed_loop_feedback(
    df: pd.DataFrame,
) -> dict:
    """
    Summarize what the system learned
    from actual outcomes.

    Positive cost saving means actual cost
    was lower than expected.

    Positive delay difference means actual
    delivery was slower than expected.
    """

    expected_cost = pd.to_numeric(
        df["expected_cost"],
        errors="coerce",
    )

    actual_cost = pd.to_numeric(
        df["actual_cost"],
        errors="coerce",
    )

    expected_days = pd.to_numeric(
        df["expected_delivery_days"],
        errors="coerce",
    )

    actual_days = pd.to_numeric(
        df["actual_delivery_days"],
        errors="coerce",
    )

    cost_difference = (
        actual_cost - expected_cost
    )

    delay_difference = (
        actual_days - expected_days
    )

    return {
        "average_cost_difference":
            round(
                cost_difference.mean(),
                2,
            ),

        "average_delay_difference":
            round(
                delay_difference.mean(),
                2,
            ),

        "cost_prediction_better_than_actual":
            int(
                (
                    actual_cost
                    <= expected_cost
                ).sum()
            ),

        "delivery_prediction_on_target":
            int(
                (
                    actual_days
                    <= expected_days
                ).sum()
            ),
    }


# ============================================================
# Action learning summary
# ============================================================

def action_learning_summary(
    df: pd.DataFrame,
) -> pd.DataFrame:

    result = (
        df.groupby(
            "recommended_action"
        )
        .agg(
            decisions=(
                "Shipment_ID",
                "nunique",
            ),

            average_expected_cost=(
                "expected_cost",
                "mean",
            ),

            average_actual_cost=(
                "actual_cost",
                "mean",
            ),

            average_expected_days=(
                "expected_delivery_days",
                "mean",
            ),

            average_actual_days=(
                "actual_delivery_days",
                "mean",
            ),
        )
        .reset_index()
    )

    result["average_cost_difference"] = (
        result["average_actual_cost"]
        - result["average_expected_cost"]
    )

    result["average_delay_difference"] = (
        result["average_actual_days"]
        - result["average_expected_days"]
    )

    return result.round(2)


# ============================================================
# Print section
# ============================================================

def print_section(
    title: str,
) -> None:

    print()
    print("=" * 70)
    print(title)
    print("=" * 70)


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    df = load_data()

    # --------------------------------------------------------
    # Overall ROI / KPIs
    # --------------------------------------------------------

    print_section(
        "SUPPLY PRESCRIPT - CLOSED LOOP ANALYTICS"
    )

    overall = calculate_roi(
        df
    )

    print("\nOVERALL KPIs")
    print("-" * 70)

    for key, value in overall.items():

        readable_key = (
            key
            .replace("_", " ")
            .title()
        )

        print(
            f"{readable_key}: {value}"
        )

    # --------------------------------------------------------
    # Predicted vs Actual Cost
    # --------------------------------------------------------

    print_section(
        "PREDICTED VS ACTUAL COST"
    )

    print(
        predicted_vs_actual_cost(
            df
        ).to_string(
            index=False
        )
    )

    # --------------------------------------------------------
    # Predicted vs Actual Delivery
    # --------------------------------------------------------

    print_section(
        "PREDICTED VS ACTUAL DELIVERY"
    )

    print(
        predicted_vs_actual_delivery(
            df
        ).to_string(
            index=False
        )
    )

    # --------------------------------------------------------
    # Decision success
    # --------------------------------------------------------

    print_section(
        "DECISION SUCCESS"
    )

    print(
        f"Success Rate: "
        f"{decision_success_rate(df):.2f}%"
    )

    print(
        f"Successful Decisions: "
        f"{len(successful_decisions(df))}"
    )

    print(
        f"Unsuccessful Decisions: "
        f"{len(unsuccessful_decisions(df))}"
    )

    # --------------------------------------------------------
    # Manager overrides
    # --------------------------------------------------------

    print_section(
        "MANAGER OVERRIDES"
    )

    print(
        manager_override_analysis(df)
    )

    # --------------------------------------------------------
    # Closed-loop feedback
    # --------------------------------------------------------

    print_section(
        "CLOSED-LOOP FEEDBACK"
    )

    feedback = closed_loop_feedback(
        df
    )

    for key, value in feedback.items():

        readable_key = (
            key
            .replace("_", " ")
            .title()
        )

        print(
            f"{readable_key}: {value}"
        )

    # --------------------------------------------------------
    # Action learning
    # --------------------------------------------------------

    print_section(
        "ACTION LEARNING SUMMARY"
    )

    print(
        action_learning_summary(
            df
        ).to_string(
            index=False
        )
    )

    # --------------------------------------------------------
    # Shipping mode
    # --------------------------------------------------------

    print_section(
        "PERFORMANCE BY SHIPPING MODE"
    )

    print(
        metrics_by_shipping_mode(
            df
        ).to_string(
            index=False
        )
    )

    # --------------------------------------------------------
    # Recommended action
    # --------------------------------------------------------

    print_section(
        "PERFORMANCE BY RECOMMENDED ACTION"
    )

    print(
        metrics_by_action(
            df
        ).to_string(
            index=False
        )
    )

    # --------------------------------------------------------
    # Market
    # --------------------------------------------------------

    print_section(
        "PERFORMANCE BY MARKET"
    )

    print(
        metrics_by_market(
            df
        ).to_string(
            index=False
        )
    )

    # --------------------------------------------------------
    # Region
    # --------------------------------------------------------

    print_section(
        "PERFORMANCE BY ORDER REGION"
    )

    print(
        metrics_by_region(
            df
        ).to_string(
            index=False
        )
    )

    # --------------------------------------------------------
    # Final
    # --------------------------------------------------------

    print_section(
        "DAY 12 CLOSED-LOOP ANALYTICS COMPLETED"
    )