from typing import Dict

import pandas as pd


# ============================================================
# SUPPLY PRESCRIPT
# Member 5 - Closed Loop & Analytics
# Performance Metrics
# ============================================================


# ============================================================
# Required source columns
# ============================================================

SOURCE_COLUMNS = [
    "Shipment_ID",
    "Shipment_Date",
    "Shipping_Mode",
    "Days_for_shipment_scheduled",
    "Category_Name",
    "Market",
    "Order_Region",
    "Customer_Country",
    "Customer_City",
    "Order_Item_Quantity",
    "Sales_per_customer",
    "Order_Item_Total",
    "Order_Profit_Per_Order",
    "Late_delivery_risk",
]


# ============================================================
# Required outcome columns
# ============================================================

OUTCOME_COLUMNS = [
    "Shipment_ID",
    "Shipping_Mode",
    "Days_for_shipment_scheduled",
    "Late_delivery_risk",
    "recommended_action",
    "expected_delivery_days",
    "actual_delivery_days",
    "expected_cost",
    "actual_cost",
    "delivery_status",
    "outcome_status",
]


# ============================================================
# Validation
# ============================================================

def validate_source_data(df: pd.DataFrame) -> None:
    """Validate the original shipment dataset."""

    missing = [
        column
        for column in SOURCE_COLUMNS
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "Missing source columns: "
            + ", ".join(missing)
        )


def validate_outcome_data(df: pd.DataFrame) -> None:
    """Validate the closed-loop outcome dataset."""

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
# Prepare outcome data
# ============================================================

def prepare_outcome_data(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Prepare decision/outcome data and calculate
    derived closed-loop metrics.
    """

    validate_outcome_data(df)

    result = df.copy()

    numeric_columns = [
        "Days_for_shipment_scheduled",
        "Late_delivery_risk",
        "expected_delivery_days",
        "actual_delivery_days",
        "expected_cost",
        "actual_cost",
    ]

    for column in numeric_columns:
        result[column] = pd.to_numeric(
            result[column],
            errors="coerce",
        )

    # --------------------------------------------------------
    # Cost saving
    # --------------------------------------------------------

    result["cost_saving"] = (
        result["expected_cost"]
        - result["actual_cost"]
    )

    # --------------------------------------------------------
    # Cost saving percentage
    # --------------------------------------------------------

    result["cost_saving_percentage"] = 0.0

    valid_cost = result["expected_cost"] != 0

    result.loc[
        valid_cost,
        "cost_saving_percentage",
    ] = (
        result.loc[
            valid_cost,
            "cost_saving",
        ]
        / result.loc[
            valid_cost,
            "expected_cost",
        ]
        * 100
    )

    # --------------------------------------------------------
    # Delivery delay
    #
    # Positive = delayed
    # Zero = on expected time
    # Negative = early
    # --------------------------------------------------------

    result["delay_days"] = (
        result["actual_delivery_days"]
        - result["expected_delivery_days"]
    )

    # --------------------------------------------------------
    # On-time delivery
    # --------------------------------------------------------

    result["on_time"] = (
        result["actual_delivery_days"]
        <= result["expected_delivery_days"]
    )

    # --------------------------------------------------------
    # Action success
    # --------------------------------------------------------

    result["action_success"] = (
        result["actual_cost"]
        <= result["expected_cost"]
    ) & (
        result["actual_delivery_days"]
        <= result["expected_delivery_days"]
    )

    # --------------------------------------------------------
    # Risk prediction correctness
    # --------------------------------------------------------

    result["risk_prediction_correct"] = (
        (
            result["Late_delivery_risk"] == 1
        )
        ==
        (
            result["delivery_status"] == "Delayed"
        )
    )

    return result


# ============================================================
# Basic KPIs
# ============================================================

def total_shipments(df: pd.DataFrame) -> int:
    return int(
        df["Shipment_ID"].nunique()
    )


def total_expected_cost(df: pd.DataFrame) -> float:
    return float(
        df["expected_cost"].sum()
    )


def total_actual_cost(df: pd.DataFrame) -> float:
    return float(
        df["actual_cost"].sum()
    )


def total_cost_saving(df: pd.DataFrame) -> float:
    return float(
        df["cost_saving"].sum()
    )


def average_cost_saving(df: pd.DataFrame) -> float:
    if len(df) == 0:
        return 0.0

    return float(
        df["cost_saving"].mean()
    )


def cost_saving_percentage(df: pd.DataFrame) -> float:
    expected = df["expected_cost"].sum()

    if expected == 0:
        return 0.0

    saving = df["cost_saving"].sum()

    return float(
        saving / expected * 100
    )


# ============================================================
# Delivery KPIs
# ============================================================

def average_delivery_time(df: pd.DataFrame) -> float:
    if len(df) == 0:
        return 0.0

    return float(
        df["actual_delivery_days"].mean()
    )


def average_delay(df: pd.DataFrame) -> float:
    if len(df) == 0:
        return 0.0

    return float(
        df["delay_days"].mean()
    )


def total_delayed_shipments(df: pd.DataFrame) -> int:
    return int(
        (
            df["delivery_status"]
            == "Delayed"
        ).sum()
    )


def on_time_delivery_rate(df: pd.DataFrame) -> float:
    if len(df) == 0:
        return 0.0

    return float(
        df["on_time"].mean() * 100
    )


# ============================================================
# Decision KPIs
# ============================================================

def successful_actions(df: pd.DataFrame) -> int:
    return int(
        df["action_success"].sum()
    )


def action_success_rate(df: pd.DataFrame) -> float:
    if len(df) == 0:
        return 0.0

    return float(
        df["action_success"].mean() * 100
    )


# ============================================================
# Risk KPIs
# ============================================================

def high_risk_shipments(df: pd.DataFrame) -> int:
    return int(
        (
            df["Late_delivery_risk"] == 1
        ).sum()
    )


def risk_prediction_accuracy(df: pd.DataFrame) -> float:
    if len(df) == 0:
        return 0.0

    return float(
        df["risk_prediction_correct"].mean()
        * 100
    )


# ============================================================
# Overall metrics
# ============================================================

def calculate_metrics(
    df: pd.DataFrame,
) -> Dict:

    prepared = prepare_outcome_data(df)

    return {
        "total_shipments": total_shipments(
            prepared
        ),

        "total_expected_cost": round(
            total_expected_cost(prepared),
            2,
        ),

        "total_actual_cost": round(
            total_actual_cost(prepared),
            2,
        ),

        "total_cost_saving": round(
            total_cost_saving(prepared),
            2,
        ),

        "average_cost_saving": round(
            average_cost_saving(prepared),
            2,
        ),

        "cost_saving_percentage": round(
            cost_saving_percentage(prepared),
            2,
        ),

        "average_delivery_time": round(
            average_delivery_time(prepared),
            2,
        ),

        "average_delay": round(
            average_delay(prepared),
            2,
        ),

        "total_delayed_shipments":
            total_delayed_shipments(prepared),

        "on_time_delivery_rate": round(
            on_time_delivery_rate(prepared),
            2,
        ),

        "successful_actions":
            successful_actions(prepared),

        "action_success_rate": round(
            action_success_rate(prepared),
            2,
        ),

        "high_risk_shipments":
            high_risk_shipments(prepared),

        "risk_prediction_accuracy": round(
            risk_prediction_accuracy(prepared),
            2,
        ),
    }


# ============================================================
# Generic grouped metrics
# ============================================================

def _group_metrics(
    df: pd.DataFrame,
    group_column: str,
) -> pd.DataFrame:

    prepared = prepare_outcome_data(df)

    result = (
        prepared
        .groupby(group_column)
        .agg(
            shipments=(
                "Shipment_ID",
                "nunique",
            ),

            expected_cost=(
                "expected_cost",
                "sum",
            ),

            actual_cost=(
                "actual_cost",
                "sum",
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

    return result.round(2)


# ============================================================
# Performance by shipping mode
# ============================================================

def metrics_by_shipping_mode(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return _group_metrics(
        df,
        "Shipping_Mode",
    )


# ============================================================
# Performance by recommended action
# ============================================================

def metrics_by_action(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return _group_metrics(
        df,
        "recommended_action",
    )


# ============================================================
# Performance by market
# ============================================================

def metrics_by_market(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return _group_metrics(
        df,
        "Market",
    )


# ============================================================
# Performance by region
# ============================================================

def metrics_by_region(
    df: pd.DataFrame,
) -> pd.DataFrame:

    return _group_metrics(
        df,
        "Order_Region",
    )


# ============================================================
# Test
# ============================================================

if __name__ == "__main__":

    print(
        "performance_metrics.py loaded successfully."
    )