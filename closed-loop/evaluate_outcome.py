"""
Supply Prescript
Member 5 - Closed Loop & Analytics

Outcome Evaluation Module

Flow:

sample_shipments.csv
        |
        v
Decision Recommendation
        |
        v
Expected Outcome
        |
        v
Actual Outcome
        |
        v
Variance / Savings / Success
        |
        v
decision_outcomes.csv
"""

from pathlib import Path
from typing import Dict

import pandas as pd


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

SOURCE_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "sample_shipments.csv"
)

OUTPUT_DIR = (
    PROJECT_ROOT
    / "data"
    / "processed"
)

OUTPUT_FILE = OUTPUT_DIR / "decision_outcomes.csv"


# ============================================================
# REQUIRED COLUMNS
# ============================================================

REQUIRED_COLUMNS = [
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
# VALIDATION
# ============================================================

def validate_source_data(df: pd.DataFrame) -> None:
    """
    Validate the shipment dataset.
    """

    missing_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            "Missing required columns: "
            + ", ".join(missing_columns)
        )

    if df.empty:
        raise ValueError("Shipment dataset is empty.")

    if df["Shipment_ID"].duplicated().any():
        raise ValueError(
            "Shipment_ID contains duplicate values."
        )


# ============================================================
# DECISION RECOMMENDATION
# ============================================================

def recommend_action(row: pd.Series) -> str:
    """
    Recommend an action based on delivery risk and quantity.

    Rules:

    High risk + high quantity
        -> Secondary Supplier

    High risk + lower quantity
        -> Air Freight

    Low risk
        -> Delay Launch / No Expedited Action
    """

    risk = int(row["Late_delivery_risk"])
    quantity = float(row["Order_Item_Quantity"])

    if risk >= 1:
        if quantity >= 5:
            return "Secondary Supplier"

        return "Air Freight"

    return "Delay Launch"


# ============================================================
# EXPECTED COST
# ============================================================

def calculate_expected_cost(row: pd.Series) -> float:
    """
    Calculate the expected operational cost of the
    recommended action.

    This is a demonstration formula for the project.
    """

    order_total = float(row["Order_Item_Total"])
    quantity = float(row["Order_Item_Quantity"])
    risk = int(row["Late_delivery_risk"])

    action = recommend_action(row)

    base_cost = order_total * 0.10
    handling_cost = quantity * 25

    if action == "Air Freight":
        action_cost = 1200

    elif action == "Secondary Supplier":
        action_cost = order_total * 0.10

    elif action == "Delay Launch":
        action_cost = 300

    else:
        action_cost = 500

    risk_cost = 250 if risk else 0

    expected_cost = (
        base_cost
        + handling_cost
        + action_cost
        + risk_cost
    )

    return round(expected_cost, 2)


# ============================================================
# EXPECTED DELAY
# ============================================================

def calculate_expected_delay(row: pd.Series) -> float:
    """
    Expected delay after considering delivery risk.
    """

    scheduled_days = float(
        row["Days_for_shipment_scheduled"]
    )

    risk = int(row["Late_delivery_risk"])

    if risk:
        return round(scheduled_days + 2, 2)

    return round(scheduled_days, 2)


# ============================================================
# ACTUAL COST
# ============================================================

def calculate_actual_cost(
    row: pd.Series,
    expected_cost: float,
) -> float:
    """
    Generate deterministic synthetic actual cost.

    This allows the closed-loop module to demonstrate
    predicted-vs-actual comparison using the sample dataset.
    """

    action = recommend_action(row)
    shipment_number = int(
        str(row["Shipment_ID"]).split("-")[-1]
    )

    quantity = float(row["Order_Item_Quantity"])

    # --------------------------------------------------------
    # Air Freight
    # --------------------------------------------------------

    if action == "Air Freight":

        # Some shipments perform better than expected.
        if shipment_number % 3 == 0:
            actual = expected_cost * 0.92
        else:
            actual = expected_cost * 1.08

    # --------------------------------------------------------
    # Secondary Supplier
    # --------------------------------------------------------

    elif action == "Secondary Supplier":

        if shipment_number % 2 == 0:
            actual = expected_cost * 0.95
        else:
            actual = expected_cost * 1.07

    # --------------------------------------------------------
    # Delay Launch
    # --------------------------------------------------------

    elif action == "Delay Launch":

        if shipment_number % 4 == 0:
            actual = expected_cost * 0.90
        else:
            actual = expected_cost * 1.04

    else:
        actual = expected_cost * 1.05

    # Small quantity-related operational variation.
    actual += quantity * 5

    return round(actual, 2)


# ============================================================
# ACTUAL DELAY
# ============================================================

def calculate_actual_delay(
    row: pd.Series,
    expected_delay: float,
) -> float:
    """
    Generate deterministic synthetic actual delay.
    """

    action = recommend_action(row)

    shipment_number = int(
        str(row["Shipment_ID"]).split("-")[-1]
    )

    risk = int(row["Late_delivery_risk"])

    # --------------------------------------------------------
    # Air Freight
    # --------------------------------------------------------

    if action == "Air Freight":

        if shipment_number % 3 == 0:
            actual = expected_delay - 1
        else:
            actual = expected_delay + 1

    # --------------------------------------------------------
    # Secondary Supplier
    # --------------------------------------------------------

    elif action == "Secondary Supplier":

        if shipment_number % 2 == 0:
            actual = expected_delay - 1
        else:
            actual = expected_delay + 1

    # --------------------------------------------------------
    # Delay Launch
    # --------------------------------------------------------

    elif action == "Delay Launch":

        if risk:
            actual = expected_delay + 2
        else:
            actual = expected_delay

    else:
        actual = expected_delay + 1

    return round(max(actual, 0), 2)


# ============================================================
# SUCCESS CALCULATION
# ============================================================

def calculate_action_success(
    expected_cost: float,
    actual_cost: float,
    expected_delay: float,
    actual_delay: float,
) -> bool:
    """
    Decision is considered successful when:

    Cost is not more than 15% above expected
    AND
    Delay is not more than 2 days above expected.
    """

    cost_acceptable = (
        actual_cost <= expected_cost * 1.15
    )

    delay_acceptable = (
        actual_delay <= expected_delay + 2
    )

    return bool(
        cost_acceptable
        and delay_acceptable
    )


# ============================================================
# CREATE OUTCOMES
# ============================================================

def create_decision_outcomes(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Create the complete decision outcome dataset.
    """

    validate_source_data(df)

    records = []

    for index, row in df.iterrows():

        decision_id = f"D-{index + 1:04d}"

        recommended_action = recommend_action(row)

        # For the sample project we initially assume
        # the manager selected the recommendation.
        selected_action = recommended_action

        expected_cost = calculate_expected_cost(row)

        actual_cost = calculate_actual_cost(
            row,
            expected_cost,
        )

        expected_delay = calculate_expected_delay(row)

        actual_delay = calculate_actual_delay(
            row,
            expected_delay,
        )

        cost_variance = (
            actual_cost - expected_cost
        )

        cost_saving = (
            expected_cost - actual_cost
        )

        if expected_cost != 0:
            cost_saving_percentage = (
                cost_saving
                / expected_cost
                * 100
            )
        else:
            cost_saving_percentage = 0

        delay_variance = (
            actual_delay - expected_delay
        )

        on_time = (
            actual_delay <= expected_delay
        )

        action_success = calculate_action_success(
            expected_cost=expected_cost,
            actual_cost=actual_cost,
            expected_delay=expected_delay,
            actual_delay=actual_delay,
        )

        records.append(
            {
                # --------------------------------------------
                # Decision
                # --------------------------------------------

                "Decision_ID": decision_id,

                "Shipment_ID": row["Shipment_ID"],

                "Decision_Date": row["Shipment_Date"],

                # --------------------------------------------
                # Original shipment information
                # --------------------------------------------

                "Shipping_Mode": row["Shipping_Mode"],

                "Category_Name": row["Category_Name"],

                "Market": row["Market"],

                "Order_Region": row["Order_Region"],

                "Customer_Country": row[
                    "Customer_Country"
                ],

                "Customer_City": row[
                    "Customer_City"
                ],

                "Order_Item_Quantity": row[
                    "Order_Item_Quantity"
                ],

                "Late_delivery_risk": row[
                    "Late_delivery_risk"
                ],

                # --------------------------------------------
                # Actions
                # --------------------------------------------

                "Recommended_Action":
                    recommended_action,

                "Selected_Action":
                    selected_action,

                # --------------------------------------------
                # Cost
                # --------------------------------------------

                "Expected_Cost":
                    round(expected_cost, 2),

                "Actual_Cost":
                    round(actual_cost, 2),

                "Cost_Variance":
                    round(cost_variance, 2),

                "Cost_Saving":
                    round(cost_saving, 2),

                "Cost_Saving_Percentage":
                    round(
                        cost_saving_percentage,
                        2,
                    ),

                # --------------------------------------------
                # Delay
                # --------------------------------------------

                "Expected_Delay_Days":
                    round(expected_delay, 2),

                "Actual_Delay_Days":
                    round(actual_delay, 2),

                "Delay_Variance_Days":
                    round(delay_variance, 2),

                # --------------------------------------------
                # Outcome
                # --------------------------------------------

                "On_Time": on_time,

                "Action_Success":
                    action_success,
            }
        )

    return pd.DataFrame(records)


# ============================================================
# SAVE OUTCOMES
# ============================================================

def save_decision_outcomes(
    outcomes: pd.DataFrame,
    output_file: Path = OUTPUT_FILE,
) -> None:
    """
    Save decision outcomes to CSV.
    """

    output_file.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    outcomes.to_csv(
        output_file,
        index=False,
    )


# ============================================================
# MAIN
# ============================================================

def main() -> None:

    print("=" * 60)
    print("SUPPLY PRESCRIPT - OUTCOME EVALUATION")
    print("=" * 60)

    print(f"Reading: {SOURCE_FILE}")

    if not SOURCE_FILE.exists():
        raise FileNotFoundError(
            f"Source file not found: {SOURCE_FILE}"
        )

    df = pd.read_csv(SOURCE_FILE)

    outcomes = create_decision_outcomes(df)

    save_decision_outcomes(outcomes)

    print()
    print(
        f"Processed shipments: {len(outcomes)}"
    )

    print(
        f"Output saved to: {OUTPUT_FILE}"
    )

    print()
    print("Outcome evaluation completed.")


if __name__ == "__main__":
    main()