"""
Supply Prescript
Member 5 - Performance Metrics

Calculates:

- Total decisions
- Expected cost
- Actual cost
- Savings
- ROI
- Success rate
- On-time rate
- Cost variance
- Delay variance
- Metrics by action
- Metrics by shipping mode
- Metrics by market
- Metrics by region
"""

from pathlib import Path
from typing import Dict

import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

OUTCOME_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "decision_outcomes.csv"
)


# ============================================================
# REQUIRED COLUMNS
# ============================================================

OUTCOME_COLUMNS = [
    "Decision_ID",
    "Shipment_ID",
    "Decision_Date",
    "Recommended_Action",
    "Selected_Action",
    "Expected_Cost",
    "Actual_Cost",
    "Cost_Variance",
    "Cost_Saving",
    "Cost_Saving_Percentage",
    "Expected_Delay_Days",
    "Actual_Delay_Days",
    "Delay_Variance_Days",
    "On_Time",
    "Action_Success",
]


# ============================================================
# LOAD DATA
# ============================================================

def load_outcome_data(
    file_path: Path = OUTCOME_FILE,
) -> pd.DataFrame:
    """
    Load decision outcome data.
    """

    if not file_path.exists():
        raise FileNotFoundError(
            f"Outcome file not found: {file_path}"
        )

    df = pd.read_csv(file_path)

    validate_outcome_data(df)

    return df


# ============================================================
# VALIDATION
# ============================================================

def validate_outcome_data(
    df: pd.DataFrame,
) -> None:

    missing = [
        column
        for column in OUTCOME_COLUMNS
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "Missing outcome columns: "
            + ", ".join(missing)
        )


# ============================================================
# BOOLEAN NORMALIZATION
# ============================================================

def normalize_boolean(
    series: pd.Series,
) -> pd.Series:

    return (
        series
        .astype(str)
        .str.lower()
        .map(
            {
                "true": True,
                "false": False,
                "1": True,
                "0": False,
                "yes": True,
                "no": False,
            }
        )
        .fillna(False)
    )


# ============================================================
# PREPARE DATA
# ============================================================

def prepare_outcome_data(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()

    numeric_columns = [
        "Expected_Cost",
        "Actual_Cost",
        "Cost_Variance",
        "Cost_Saving",
        "Cost_Saving_Percentage",
        "Expected_Delay_Days",
        "Actual_Delay_Days",
        "Delay_Variance_Days",
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

    df["On_Time"] = normalize_boolean(
        df["On_Time"]
    )

    df["Action_Success"] = normalize_boolean(
        df["Action_Success"]
    )

    # Recalculate values to protect against
    # stale or manually modified CSV values.

    df["Cost_Variance"] = (
        df["Actual_Cost"]
        - df["Expected_Cost"]
    )

    df["Cost_Saving"] = (
        df["Expected_Cost"]
        - df["Actual_Cost"]
    )

    df["Cost_Saving_Percentage"] = (
        df["Cost_Saving"]
        / df["Expected_Cost"]
        .replace(0, pd.NA)
        * 100
    )

    df["Delay_Variance_Days"] = (
        df["Actual_Delay_Days"]
        - df["Expected_Delay_Days"]
    )

    return df


# ============================================================
# BASIC KPIs
# ============================================================

def total_decisions(df: pd.DataFrame) -> int:
    return int(len(df))


def total_expected_cost(
    df: pd.DataFrame,
) -> float:
    return round(
        df["Expected_Cost"].sum(),
        2,
    )


def total_actual_cost(
    df: pd.DataFrame,
) -> float:
    return round(
        df["Actual_Cost"].sum(),
        2,
    )


def total_savings(
    df: pd.DataFrame,
) -> float:

    return round(
        (
            df["Expected_Cost"].sum()
            - df["Actual_Cost"].sum()
        ),
        2,
    )


def savings_percentage(
    df: pd.DataFrame,
) -> float:

    expected = df["Expected_Cost"].sum()

    if expected == 0:
        return 0.0

    return round(
        total_savings(df)
        / expected
        * 100,
        2,
    )


def roi_percentage(
    df: pd.DataFrame,
) -> float:

    expected = df["Expected_Cost"].sum()

    if expected == 0:
        return 0.0

    savings = total_savings(df)

    return round(
        savings
        / expected
        * 100,
        2,
    )


def success_rate(
    df: pd.DataFrame,
) -> float:

    if len(df) == 0:
        return 0.0

    return round(
        df["Action_Success"].mean()
        * 100,
        2,
    )


def on_time_rate(
    df: pd.DataFrame,
) -> float:

    if len(df) == 0:
        return 0.0

    return round(
        df["On_Time"].mean()
        * 100,
        2,
    )


def average_cost_variance(
    df: pd.DataFrame,
) -> float:

    if len(df) == 0:
        return 0.0

    return round(
        df["Cost_Variance"].mean(),
        2,
    )


def average_delay_variance(
    df: pd.DataFrame,
) -> float:

    if len(df) == 0:
        return 0.0

    return round(
        df["Delay_Variance_Days"].mean(),
        2,
    )


# ============================================================
# COMPLETE KPI CALCULATION
# ============================================================

def calculate_metrics(
    df: pd.DataFrame,
) -> Dict:

    df = prepare_outcome_data(df)

    return {
        "total_decisions":
            total_decisions(df),

        "total_expected_cost":
            total_expected_cost(df),

        "total_actual_cost":
            total_actual_cost(df),

        "total_savings":
            total_savings(df),

        "savings_percentage":
            savings_percentage(df),

        "roi_percentage":
            roi_percentage(df),

        "success_rate":
            success_rate(df),

        "on_time_rate":
            on_time_rate(df),

        "average_cost_variance":
            average_cost_variance(df),

        "average_delay_variance_days":
            average_delay_variance(df),
    }


# ============================================================
# GROUPED METRICS
# ============================================================

def grouped_metrics(
    df: pd.DataFrame,
    group_column: str,
) -> pd.DataFrame:

    df = prepare_outcome_data(df)

    if group_column not in df.columns:
        raise ValueError(
            f"Column '{group_column}' does not exist."
        )

    grouped = (
        df.groupby(group_column)
        .agg(
            Decisions=(
                "Decision_ID",
                "count",
            ),

            Expected_Cost=(
                "Expected_Cost",
                "sum",
            ),

            Actual_Cost=(
                "Actual_Cost",
                "sum",
            ),

            Savings=(
                "Cost_Saving",
                "sum",
            ),

            Average_Cost_Variance=(
                "Cost_Variance",
                "mean",
            ),

            Average_Delay_Variance=(
                "Delay_Variance_Days",
                "mean",
            ),

            Success_Rate=(
                "Action_Success",
                "mean",
            ),

            On_Time_Rate=(
                "On_Time",
                "mean",
            ),
        )
        .reset_index()
    )

    grouped["ROI_Percentage"] = (
        grouped["Savings"]
        / grouped["Expected_Cost"]
        .replace(0, pd.NA)
        * 100
    )

    grouped["Success_Rate"] *= 100
    grouped["On_Time_Rate"] *= 100

    return grouped.round(2)


def metrics_by_action(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return grouped_metrics(
        df,
        "Selected_Action",
    )


def metrics_by_shipping_mode(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return grouped_metrics(
        df,
        "Shipping_Mode",
    )


def metrics_by_market(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return grouped_metrics(
        df,
        "Market",
    )


def metrics_by_region(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return grouped_metrics(
        df,
        "Order_Region",
    )


# ============================================================
# MAIN
# ============================================================

def main() -> None:

    df = load_outcome_data()

    metrics = calculate_metrics(df)

    print("=" * 60)
    print("SUPPLY PRESCRIPT - PERFORMANCE METRICS")
    print("=" * 60)

    for key, value in metrics.items():
        print(
            f"{key}: {value}"
        )

    print("\nMetrics by Action:")
    print(
        metrics_by_action(df).to_string(
            index=False
        )
    )

    print("\nMetrics by Shipping Mode:")
    print(
        metrics_by_shipping_mode(df).to_string(
            index=False
        )
    )

    print("\nMetrics by Market:")
    print(
        metrics_by_market(df).to_string(
            index=False
        )
    )


if __name__ == "__main__":
    main()