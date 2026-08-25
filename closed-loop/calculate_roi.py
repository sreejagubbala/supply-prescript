from pathlib import Path

import pandas as pd

from performance_metrics import (
    calculate_metrics,
    metrics_by_action,
    metrics_by_shipping_mode,
    metrics_by_market,
    metrics_by_region,
)


# ============================================================
# Project paths
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
            f"Decision/outcome file not found:\n"
            f"{DATA_FILE}\n\n"
            "Run evaluate_outcome.py first."
        )

    return pd.read_csv(
        DATA_FILE
    )


# ============================================================
# Calculate ROI
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
# Print section
# ============================================================

def print_section(
    title: str,
) -> None:

    print()
    print("=" * 65)
    print(title)
    print("=" * 65)


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    df = load_data()

    overall = calculate_roi(
        df
    )

    action_results = (
        metrics_by_action(df)
    )

    shipping_results = (
        metrics_by_shipping_mode(df)
    )

    market_results = (
        metrics_by_market(df)
    )

    region_results = (
        metrics_by_region(df)
    )

    # --------------------------------------------------------
    # Overall
    # --------------------------------------------------------

    print_section(
        "SUPPLY PRESCRIPT - DAY 6 INITIAL ANALYTICS"
    )

    print(
        "\nOVERALL KPIs"
    )

    print(
        "-" * 65
    )

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
    # Action
    # --------------------------------------------------------

    print_section(
        "PERFORMANCE BY RECOMMENDED ACTION"
    )

    print(
        action_results.to_string(
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
        shipping_results.to_string(
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
        market_results.to_string(
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
        region_results.to_string(
            index=False
        )
    )