"""
Supply Prescript
Member 5 - ROI Calculation

Generates:

data/processed/roi_summary.csv
data/processed/action_roi_summary.csv
"""

from pathlib import Path

import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "decision_outcomes.csv"
)

OUTPUT_DIR = (
    PROJECT_ROOT
    / "data"
    / "processed"
)

ROI_SUMMARY_FILE = (
    OUTPUT_DIR
    / "roi_summary.csv"
)

ACTION_ROI_FILE = (
    OUTPUT_DIR
    / "action_roi_summary.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

def load_outcomes() -> pd.DataFrame:

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Missing file: {INPUT_FILE}"
        )

    df = pd.read_csv(INPUT_FILE)

    if df.empty:
        raise ValueError(
            "decision_outcomes.csv is empty."
        )

    return df


# ============================================================
# OVERALL ROI
# ============================================================

def calculate_overall_roi(
    df: pd.DataFrame,
) -> pd.DataFrame:

    expected = df["Expected_Cost"].sum()
    actual = df["Actual_Cost"].sum()

    savings = expected - actual

    if expected != 0:
        roi = savings / expected * 100
    else:
        roi = 0

    success_rate = (
        df["Action_Success"]
        .astype(bool)
        .mean()
        * 100
    )

    on_time_rate = (
        df["On_Time"]
        .astype(bool)
        .mean()
        * 100
    )

    result = {
        "total_decisions": len(df),

        "expected_cost": round(
            expected,
            2,
        ),

        "actual_cost": round(
            actual,
            2,
        ),

        "savings": round(
            savings,
            2,
        ),

        "roi_percentage": round(
            roi,
            2,
        ),

        "success_rate": round(
            success_rate,
            2,
        ),

        "on_time_rate": round(
            on_time_rate,
            2,
        ),
    }

    return pd.DataFrame([result])


# ============================================================
# ROI BY ACTION
# ============================================================

def calculate_action_roi(
    df: pd.DataFrame,
) -> pd.DataFrame:

    result = (
        df.groupby("Selected_Action")
        .agg(
            decisions=(
                "Decision_ID",
                "count",
            ),

            expected_cost=(
                "Expected_Cost",
                "sum",
            ),

            actual_cost=(
                "Actual_Cost",
                "sum",
            ),

            savings=(
                "Cost_Saving",
                "sum",
            ),

            average_cost_variance=(
                "Cost_Variance",
                "mean",
            ),

            average_delay_variance=(
                "Delay_Variance_Days",
                "mean",
            ),

            success_rate=(
                "Action_Success",
                "mean",
            ),

            on_time_rate=(
                "On_Time",
                "mean",
            ),
        )
        .reset_index()
    )

    result["roi_percentage"] = (
        result["savings"]
        / result["expected_cost"]
        .replace(0, pd.NA)
        * 100
    )

    result["success_rate"] *= 100
    result["on_time_rate"] *= 100

    return result.round(2)


# ============================================================
# SAVE
# ============================================================

def save_roi_reports(
    df: pd.DataFrame,
) -> None:

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    overall = calculate_overall_roi(df)

    by_action = calculate_action_roi(df)

    overall.to_csv(
        ROI_SUMMARY_FILE,
        index=False,
    )

    by_action.to_csv(
        ACTION_ROI_FILE,
        index=False,
    )

    print(
        f"Saved: {ROI_SUMMARY_FILE}"
    )

    print(
        f"Saved: {ACTION_ROI_FILE}"
    )


# ============================================================
# MAIN
# ============================================================

def main() -> None:

    print("=" * 60)
    print("SUPPLY PRESCRIPT - ROI CALCULATION")
    print("=" * 60)

    df = load_outcomes()

    save_roi_reports(df)

    print("\nOverall ROI:")
    print(
        calculate_overall_roi(df).to_string(
            index=False
        )
    )

    print("\nROI by Action:")
    print(
        calculate_action_roi(df).to_string(
            index=False
        )
    )


if __name__ == "__main__":
    main()