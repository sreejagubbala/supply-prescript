import sys
from pathlib import Path

import pandas as pd

# ------------------------------------------------------------
# Allow importing from closed-loop directory
# ------------------------------------------------------------

PROJECT_ROOT = Path(
    __file__
).resolve().parent.parent

CLOSED_LOOP_DIR = (
    PROJECT_ROOT
    / "closed-loop"
)

sys.path.insert(
    0,
    str(CLOSED_LOOP_DIR),
)


from evaluate_outcome import (
    recommend_action,
    calculate_expected_cost,
    calculate_expected_delay,
    calculate_actual_cost,
    calculate_actual_delay,
    calculate_action_success,
    create_decision_outcomes,
)


# ============================================================
# SAMPLE ROW
# ============================================================

def sample_row():

    return pd.Series(
        {
            "Shipment_ID":
                "SHP-1001",

            "Shipment_Date":
                "2026-01-03",

            "Shipping_Mode":
                "Standard Class",

            "Days_for_shipment_scheduled":
                4,

            "Category_Name":
                "Sporting Goods",

            "Market":
                "Pacific Asia",

            "Order_Region":
                "Southeast Asia",

            "Customer_Country":
                "India",

            "Customer_City":
                "Hyderabad",

            "Order_Item_Quantity":
                2,

            "Sales_per_customer":
                245.5,

            "Order_Item_Total":
                221,

            "Order_Profit_Per_Order":
                24.5,

            "Late_delivery_risk":
                0,
        }
    )


# ============================================================
# TEST RECOMMENDATION
# ============================================================

def test_recommend_action():

    row = sample_row()

    action = recommend_action(row)

    assert action == "Delay Launch"


# ============================================================
# TEST EXPECTED COST
# ============================================================

def test_expected_cost():

    row = sample_row()

    cost = calculate_expected_cost(
        row
    )

    assert cost > 0


# ============================================================
# TEST EXPECTED DELAY
# ============================================================

def test_expected_delay():

    row = sample_row()

    delay = calculate_expected_delay(
        row
    )

    assert delay == 4


# ============================================================
# TEST ACTUAL COST
# ============================================================

def test_actual_cost():

    row = sample_row()

    expected = calculate_expected_cost(
        row
    )

    actual = calculate_actual_cost(
        row,
        expected,
    )

    assert actual > 0


# ============================================================
# TEST ACTUAL DELAY
# ============================================================

def test_actual_delay():

    row = sample_row()

    expected = calculate_expected_delay(
        row
    )

    actual = calculate_actual_delay(
        row,
        expected,
    )

    assert actual >= 0


# ============================================================
# TEST SUCCESS
# ============================================================

def test_action_success():

    result = calculate_action_success(
        expected_cost=1000,
        actual_cost=1050,
        expected_delay=4,
        actual_delay=5,
    )

    assert result is True
    
# ============================================================
# TEST FAILURE
# ============================================================

def test_action_failure():

    result = calculate_action_success(
        expected_cost=1000,
        actual_cost=1400,
        expected_delay=4,
        actual_delay=8,
    )

    assert result is False


# ============================================================
# TEST COMPLETE OUTCOME
# ============================================================

def test_create_decision_outcomes():

    df = pd.DataFrame(
        [
            sample_row()
        ]
    )

    result = create_decision_outcomes(
        df
    )

    assert len(result) == 1

    assert (
        "Decision_ID"
        in result.columns
    )

    assert (
        "Expected_Cost"
        in result.columns
    )

    assert (
        "Actual_Cost"
        in result.columns
    )

    assert (
        "Action_Success"
        in result.columns
    )