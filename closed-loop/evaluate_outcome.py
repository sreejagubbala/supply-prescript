from pathlib import Path

import pandas as pd


# ============================================================
# Project paths
# ============================================================

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

SOURCE_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "sample_shipments.csv"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "decision_outcomes.csv"
)


# ============================================================
# Load source data
# ============================================================

def load_shipments() -> pd.DataFrame:

    if not SOURCE_FILE.exists():
        raise FileNotFoundError(
            f"Source file not found:\n{SOURCE_FILE}"
        )

    df = pd.read_csv(
        SOURCE_FILE
    )

    return df


# ============================================================
# Validate source data
# ============================================================

def validate_shipments(
    df: pd.DataFrame,
) -> None:

    required_columns = [
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

    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "The source CSV is missing: "
            + ", ".join(missing)
        )


# ============================================================
# Determine recommended action
# ============================================================

def recommend_action(row) -> str:
    """
    Generate a simple rule-based prescription for Day 5.

    This is NOT the final optimization algorithm.
    It is only sample decision data for closed-loop testing.
    """

    risk = int(
        row["Late_delivery_risk"]
    )

    mode = str(
        row["Shipping_Mode"]
    )

    quantity = int(
        row["Order_Item_Quantity"]
    )

    # High-risk shipment
    if risk == 1:

        if mode == "Standard Class":
            return "Upgrade shipping mode"

        if quantity >= 5:
            return "Split shipment"

        return "Prioritize shipment"

    # Low-risk shipment
    if mode == "Same Day":
        return "Maintain current mode"

    if quantity >= 5:
        return "Consolidate shipment"

    return "Maintain current plan"


# ============================================================
# Generate expected delivery
# ============================================================

def expected_delivery_days(row) -> int:
    """
    Expected delivery is based on the team's
    Days_for_shipment_scheduled field.
    """

    return int(
        row["Days_for_shipment_scheduled"]
    )


# ============================================================
# Generate expected operational cost
# ============================================================

def expected_operational_cost(row) -> float:
    """
    Create a simple sample logistics cost estimate.

    This is an assumed project-development formula because
    the source CSV does not contain a shipping-cost column.

    Formula:
        10% of order total
        + quantity-based handling cost
        + shipping-mode adjustment
    """

    order_total = float(
        row["Order_Item_Total"]
    )

    quantity = int(
        row["Order_Item_Quantity"]
    )

    mode = str(
        row["Shipping_Mode"]
    )

    mode_cost = {
        "Same Day": 25.0,
        "First Class": 18.0,
        "Second Class": 12.0,
        "Standard Class": 8.0,
    }

    base_cost = (
        order_total * 0.10
    )

    handling_cost = (
        quantity * 2.0
    )

    shipping_cost = mode_cost.get(
        mode,
        10.0,
    )

    return round(
        base_cost
        + handling_cost
        + shipping_cost,
        2,
    )


# ============================================================
# Generate synthetic actual delivery
# ============================================================

def actual_delivery_days(row) -> int:
    """
    Generate deterministic sample actual delivery.

    High-risk shipments receive a sample delay.
    Low-risk shipments are on time or slightly early.

    This is synthetic testing data.
    """

    scheduled = int(
        row["Days_for_shipment_scheduled"]
    )

    risk = int(
        row["Late_delivery_risk"]
    )

    shipment_number = int(
        str(row["Shipment_ID"]).split("-")[-1]
    )

    # Same Day should not become negative
    if scheduled == 0:
        return 0

    # High-risk shipment
    if risk == 1:

        # Alternate 1-day and 2-day delay
        if shipment_number % 2 == 0:
            return scheduled + 2

        return scheduled + 1

    # Low-risk shipment
    if shipment_number % 3 == 0:
        return max(
            scheduled - 1,
            0,
        )

    return scheduled


# ============================================================
# Generate synthetic actual cost
# ============================================================

def actual_operational_cost(
    expected_cost: float,
    row,
) -> float:
    """
    Generate deterministic sample actual cost.

    High-risk shipments have a small disruption overhead.

    This is synthetic testing data.
    """

    risk = int(
        row["Late_delivery_risk"]
    )

    shipment_number = int(
        str(row["Shipment_ID"]).split("-")[-1]
    )

    if risk == 1:

        # Some high-risk shipments save cost,
        # others incur disruption cost.
        if shipment_number % 4 == 0:
            multiplier = 1.08
        else:
            multiplier = 0.96

    else:

        if shipment_number % 5 == 0:
            multiplier = 1.02
        else:
            multiplier = 0.97

    return round(
        expected_cost * multiplier,
        2,
    )


# ============================================================
# Build decision/outcome dataset
# ============================================================

def create_decision_outcomes(
    df: pd.DataFrame,
) -> pd.DataFrame:

    validate_shipments(df)

    records = []

    for _, row in df.iterrows():

        action = recommend_action(
            row
        )

        expected_days = (
            expected_delivery_days(row)
        )

        expected_cost = (
            expected_operational_cost(row)
        )

        actual_days = (
            actual_delivery_days(row)
        )

        actual_cost = (
            actual_operational_cost(
                expected_cost,
                row,
            )
        )

        if actual_days > expected_days:
            delivery_status = "Delayed"
        else:
            delivery_status = "On Time"

        if (
            actual_days <= expected_days
            and actual_cost <= expected_cost
        ):
            outcome_status = "Successful"
        else:
            outcome_status = "Unsuccessful"

        records.append(
            {
                # Original shipment information
                "Shipment_ID":
                    row["Shipment_ID"],

                "Shipment_Date":
                    row["Shipment_Date"],

                "Shipping_Mode":
                    row["Shipping_Mode"],

                "Days_for_shipment_scheduled":
                    row[
                        "Days_for_shipment_scheduled"
                    ],

                "Category_Name":
                    row["Category_Name"],

                "Market":
                    row["Market"],

                "Order_Region":
                    row["Order_Region"],

                "Customer_Country":
                    row["Customer_Country"],

                "Customer_City":
                    row["Customer_City"],

                "Order_Item_Quantity":
                    row[
                        "Order_Item_Quantity"
                    ],

                "Order_Item_Total":
                    row[
                        "Order_Item_Total"
                    ],

                "Order_Profit_Per_Order":
                    row[
                        "Order_Profit_Per_Order"
                    ],

                "Late_delivery_risk":
                    row[
                        "Late_delivery_risk"
                    ],

                # Decision
                "recommended_action":
                    action,

                # Expected outcome
                "expected_delivery_days":
                    expected_days,

                "expected_cost":
                    expected_cost,

                # Actual outcome
                "actual_delivery_days":
                    actual_days,

                "actual_cost":
                    actual_cost,

                "delivery_status":
                    delivery_status,

                "outcome_status":
                    outcome_status,
            }
        )

    return pd.DataFrame(
        records
    )


# ============================================================
# Save data
# ============================================================

def save_decision_outcomes(
    df: pd.DataFrame,
) -> None:

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False,
    )


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    shipments = load_shipments()

    outcomes = create_decision_outcomes(
        shipments
    )

    save_decision_outcomes(
        outcomes
    )

    print()
    print("=" * 65)
    print(
        "SUPPLY PRESCRIPT - DAY 5"
    )
    print(
        "DECISION / OUTCOME DATA PREPARED"
    )
    print("=" * 65)

    print(
        f"Source rows: {len(shipments)}"
    )

    print(
        f"Generated rows: {len(outcomes)}"
    )

    print(
        f"Output: {OUTPUT_FILE}"
    )

    print()
    print(
        outcomes[
            [
                "Shipment_ID",
                "recommended_action",
                "expected_delivery_days",
                "actual_delivery_days",
                "expected_cost",
                "actual_cost",
                "delivery_status",
                "outcome_status",
            ]
        ].to_string(
            index=False
        )
    )