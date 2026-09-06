import sys
from pathlib import Path

import pandas as pd
import pytest


# ============================================================
# ADD CLOSED-LOOP DIRECTORY TO PYTHON PATH
# ============================================================

CLOSED_LOOP_DIR = (
    Path(__file__).resolve().parent.parent
    / "closed-loop"
)

sys.path.insert(
    0,
    str(CLOSED_LOOP_DIR),
)


# ============================================================
# IMPORT CLOSED-LOOP MODULES
# ============================================================

from performance_metrics import (
    validate_source_data,
    validate_outcome_data,
    prepare_outcome_data,
    total_shipments,
    total_expected_cost,
    total_actual_cost,
    total_cost_saving,
    average_cost_saving,
    cost_saving_percentage,
    average_delivery_time,
    average_delay,
    total_delayed_shipments,
    on_time_delivery_rate,
    successful_actions,
    action_success_rate,
    high_risk_shipments,
    risk_prediction_accuracy,
    calculate_metrics,
    metrics_by_shipping_mode,
    metrics_by_action,
    metrics_by_market,
    metrics_by_region,
)

from calculate_roi import (
    calculate_roi,
    predicted_vs_actual_cost,
    predicted_vs_actual_delivery,
    total_savings,
    decision_success_rate,
    successful_decisions,
    unsuccessful_decisions,
    manager_override_analysis,
    closed_loop_feedback,
    action_learning_summary,
)

from learning_pipeline import (
    create_decision_id,
    track_decision,
    save_decision,
    calculate_override_rate,
    decision_summary,
)

from outcome_recording import (
    validate_shipments,
    recommend_action,
    expected_delivery_days,
    expected_operational_cost,
    actual_delivery_days,
    actual_operational_cost,
    create_decision_outcomes,
    save_decision_outcomes,
    record_outcome,
)

from feedback import (
    generate_feedback,
    create_feedback,
    calculate_action_feedback,
    calculate_learning_signals,
)


# ============================================================
# SAMPLE OUTCOME FIXTURE
# ============================================================

@pytest.fixture
def sample_outcomes():

    return pd.DataFrame(
        {
            "Shipment_ID": [
                "SHP-1",
                "SHP-2",
                "SHP-3",
            ],

            "Shipping_Mode": [
                "Standard Class",
                "First Class",
                "Second Class",
            ],

            "Days_for_shipment_scheduled": [
                5,
                3,
                4,
            ],

            "Late_delivery_risk": [
                0,
                1,
                0,
            ],

            "recommended_action": [
                "Maintain current plan",
                "Upgrade shipping mode",
                "Consolidate shipment",
            ],

            "expected_delivery_days": [
                5,
                3,
                4,
            ],

            "actual_delivery_days": [
                5,
                5,
                3,
            ],

            "expected_cost": [
                10000,
                8000,
                6000,
            ],

            "actual_cost": [
                8500,
                9000,
                5500,
            ],

            "delivery_status": [
                "On Time",
                "Delayed",
                "On Time",
            ],

            "outcome_status": [
                "Successful",
                "Unsuccessful",
                "Successful",
            ],

            "Market": [
                "US",
                "EU",
                "US",
            ],

            "Order_Region": [
                "East",
                "West",
                "East",
            ],
        }
    )


# ============================================================
# SOURCE DATA VALIDATION
# ============================================================

def test_validate_outcome_data(sample_outcomes):

    validate_outcome_data(
        sample_outcomes
    )


def test_missing_outcome_column(sample_outcomes):

    df = sample_outcomes.drop(
        columns=["actual_cost"]
    )

    with pytest.raises(ValueError):

        validate_outcome_data(df)


# ============================================================
# PREPARE OUTCOME DATA
# ============================================================

def test_prepare_outcome_data(sample_outcomes):

    result = prepare_outcome_data(
        sample_outcomes
    )

    assert "cost_saving" in result.columns
    assert "cost_saving_percentage" in result.columns
    assert "delay_days" in result.columns
    assert "on_time" in result.columns
    assert "action_success" in result.columns
    assert "risk_prediction_correct" in result.columns


def test_cost_saving(sample_outcomes):

    result = prepare_outcome_data(
        sample_outcomes
    )

    assert result.loc[
        0,
        "cost_saving",
    ] == 1500


def test_delay_days(sample_outcomes):

    result = prepare_outcome_data(
        sample_outcomes
    )

    assert result.loc[
        0,
        "delay_days",
    ] == 0


def test_on_time(sample_outcomes):

    result = prepare_outcome_data(
        sample_outcomes
    )

    assert bool(
        result.loc[0, "on_time"]
    ) is True


def test_action_success(sample_outcomes):

    result = prepare_outcome_data(
        sample_outcomes
    )

    assert bool(
        result.loc[0, "action_success"]
    ) is True


# ============================================================
# BASIC KPI TESTS
# ============================================================

def test_total_shipments(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert total_shipments(
        prepared
    ) == 3


def test_total_expected_cost(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert total_expected_cost(
        prepared
    ) == 24000


def test_total_actual_cost(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert total_actual_cost(
        prepared
    ) == 23000


def test_total_cost_saving(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert total_cost_saving(
        prepared
    ) == 1000


def test_average_cost_saving(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert round(
        average_cost_saving(prepared),
        2,
    ) == 333.33


def test_cost_saving_percentage(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert round(
        cost_saving_percentage(prepared),
        2,
    ) == round(
        1000 / 24000 * 100,
        2,
    )


# ============================================================
# DELIVERY KPI TESTS
# ============================================================

def test_average_delivery_time(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert round(
        average_delivery_time(prepared),
        2,
    ) == 4.33


def test_average_delay(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert round(
        average_delay(prepared),
        2,
    ) == 0.33


def test_total_delayed_shipments(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert total_delayed_shipments(
        prepared
    ) == 1


def test_on_time_delivery_rate(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert round(
        on_time_delivery_rate(prepared),
        2,
    ) == round(
        2 / 3 * 100,
        2,
    )


# ============================================================
# DECISION KPI TESTS
# ============================================================

def test_successful_actions(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert successful_actions(
        prepared
    ) == 2


def test_action_success_rate(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert round(
        action_success_rate(prepared),
        2,
    ) == round(
        2 / 3 * 100,
        2,
    )


# ============================================================
# RISK KPI TESTS
# ============================================================

def test_high_risk_shipments(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert high_risk_shipments(
        prepared
    ) == 1


def test_risk_prediction_accuracy(sample_outcomes):

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    # All three predictions match:
    #
    # SHP-1 -> risk 0 + On Time
    # SHP-2 -> risk 1 + Delayed
    # SHP-3 -> risk 0 + On Time

    assert round(
        risk_prediction_accuracy(prepared),
        2,
    ) == 100.0


# ============================================================
# OVERALL METRICS
# ============================================================

def test_calculate_metrics(sample_outcomes):

    result = calculate_metrics(
        sample_outcomes
    )

    assert result[
        "total_shipments"
    ] == 3

    assert result[
        "total_expected_cost"
    ] == 24000

    assert result[
        "total_actual_cost"
    ] == 23000

    assert result[
        "total_cost_saving"
    ] == 1000

    assert result[
        "successful_actions"
    ] == 2


# ============================================================
# GROUPED METRICS
# ============================================================

def test_metrics_by_shipping_mode(
    sample_outcomes,
):

    result = metrics_by_shipping_mode(
        sample_outcomes
    )

    assert len(result) == 3
    assert "Shipping_Mode" in result.columns


def test_metrics_by_action(
    sample_outcomes,
):

    result = metrics_by_action(
        sample_outcomes
    )

    assert len(result) == 3
    assert "recommended_action" in result.columns


def test_metrics_by_market(
    sample_outcomes,
):

    result = metrics_by_market(
        sample_outcomes
    )

    assert len(result) == 2
    assert "Market" in result.columns


def test_metrics_by_region(
    sample_outcomes,
):

    result = metrics_by_region(
        sample_outcomes
    )

    assert len(result) == 2
    assert "Order_Region" in result.columns


# ============================================================
# CLOSED LOOP ANALYSIS
# ============================================================

def test_calculate_roi(sample_outcomes):

    result = calculate_roi(
        sample_outcomes
    )

    assert result[
        "total_cost_saving"
    ] == 1000

    assert result[
        "roi_percentage"
    ] == round(
        1000 / 24000 * 100,
        2,
    )


def test_total_savings(sample_outcomes):

    result = total_savings(
        sample_outcomes
    )

    assert result == 1000


def test_decision_success_rate(
    sample_outcomes,
):

    result = decision_success_rate(
        sample_outcomes
    )

    assert round(
        result,
        2,
    ) == round(
        2 / 3 * 100,
        2,
    )


def test_successful_decisions(
    sample_outcomes,
):

    result = successful_decisions(
        sample_outcomes
    )

    assert len(result) == 2


def test_unsuccessful_decisions(
    sample_outcomes,
):

    result = unsuccessful_decisions(
        sample_outcomes
    )

    assert len(result) == 1


def test_predicted_vs_actual_cost(
    sample_outcomes,
):

    result = predicted_vs_actual_cost(
        sample_outcomes
    )

    assert "Expected_Cost" in result.columns
    assert "Actual_Cost" in result.columns
    assert "Cost_Difference" in result.columns
    assert "Cost_Saving" in result.columns

    assert result.loc[
        0,
        "Cost_Saving",
    ] == 1500


def test_predicted_vs_actual_delivery(
    sample_outcomes,
):

    result = predicted_vs_actual_delivery(
        sample_outcomes
    )

    assert (
        "Expected_Delivery_Days"
        in result.columns
    )

    assert (
        "Actual_Delivery_Days"
        in result.columns
    )

    assert (
        "Delay_Difference"
        in result.columns
    )


def test_manager_override_analysis(
    sample_outcomes,
):

    df = sample_outcomes.copy()

    df[
        "Recommended_Action"
    ] = df["recommended_action"]

    df[
        "Selected_Action"
    ] = df["recommended_action"]

    df.loc[
        0,
        "Selected_Action",
    ] = "Manager Override"

    result = manager_override_analysis(
        df
    )

    assert result[
        "total_decisions"
    ] == 3

    assert result[
        "manager_overrides"
    ] == 1

    assert result[
        "override_rate"
    ] == round(
        1 / 3 * 100,
        2,
    )


def test_closed_loop_feedback(
    sample_outcomes,
):

    result = closed_loop_feedback(
        sample_outcomes
    )

    assert (
        "average_cost_difference"
        in result
    )

    assert (
        "average_delay_difference"
        in result
    )

    assert (
        "cost_prediction_better_than_actual"
        in result
    )

    assert (
        "delivery_prediction_on_target"
        in result
    )


def test_action_learning_summary(
    sample_outcomes,
):

    result = action_learning_summary(
        sample_outcomes
    )

    assert len(result) == 3

    assert (
        "average_cost_difference"
        in result.columns
    )

    assert (
        "average_delay_difference"
        in result.columns
    )


# ============================================================
# DECISION TRACKING
# ============================================================

def test_create_decision_id():

    result = create_decision_id(
        "SHP-1001"
    )

    assert result == "DEC-SHP-1001"


def test_create_decision_id_unique():

    result = create_decision_id(
        "SHP-1001",
        ["DEC-SHP-1001"],
    )

    assert result == "DEC-SHP-1001-2"


def test_create_decision_id_multiple_duplicates():

    result = create_decision_id(
        "SHP-1001",
        [
            "DEC-SHP-1001",
            "DEC-SHP-1001-2",
            "DEC-SHP-1001-3",
        ],
    )

    assert result == "DEC-SHP-1001-4"


def test_track_decision():

    result = track_decision(
        shipment_id="SHP-1001",
        recommended_action="Upgrade shipping mode",
        expected_cost=10000,
        expected_delivery_days=3,
    )

    assert result[
        "Decision_ID"
    ] == "DEC-SHP-1001"

    assert result[
        "Shipment_ID"
    ] == "SHP-1001"

    assert result[
        "Recommended_Action"
    ] == "Upgrade shipping mode"

    assert result[
        "Selected_Action"
    ] == "Upgrade shipping mode"

    assert result[
        "Manager_Override"
    ] is False


def test_track_decision_manager_override():

    result = track_decision(
        shipment_id="SHP-1002",
        recommended_action="Upgrade shipping mode",
        selected_action="Delay launch",
        expected_cost=10000,
        expected_delivery_days=3,
    )

    assert result[
        "Manager_Override"
    ] is True


def test_track_decision_custom_date():

    result = track_decision(
        shipment_id="SHP-1003",
        recommended_action="Prioritize shipment",
        expected_cost=5000,
        expected_delivery_days=2,
        decision_date="2026-09-01",
    )

    assert result[
        "Decision_Date"
    ] == "2026-09-01"


def test_track_decision_rounds_cost():

    result = track_decision(
        shipment_id="SHP-1004",
        recommended_action="Consolidate shipment",
        expected_cost=12345.6789,
        expected_delivery_days=4.567,
    )

    assert result[
        "Expected_Cost"
    ] == 12345.68

    assert result[
        "Expected_Delay_Days"
    ] == 4.57


# ============================================================
# SAVE DECISION
# ============================================================

def test_save_decision(tmp_path):

    file_path = (
        tmp_path
        / "decisions.csv"
    )

    record = track_decision(
        shipment_id="SHP-1001",
        recommended_action="Prioritize shipment",
        expected_cost=5000,
        expected_delivery_days=3,
    )

    result = save_decision(
        record,
        file_path,
    )

    assert len(result) == 1
    assert file_path.exists()


def test_save_multiple_decisions(tmp_path):

    file_path = (
        tmp_path
        / "decisions.csv"
    )

    record1 = track_decision(
        shipment_id="SHP-1001",
        recommended_action="Prioritize shipment",
        expected_cost=5000,
        expected_delivery_days=3,
        file_path=file_path,
    )

    record2 = track_decision(
        shipment_id="SHP-1002",
        recommended_action="Upgrade shipping mode",
        expected_cost=7000,
        expected_delivery_days=2,
        file_path=file_path,
    )

    save_decision(
        record1,
        file_path,
    )

    result = save_decision(
        record2,
        file_path,
    )

    assert len(result) == 2


def test_save_duplicate_decision_replaces_record(
    tmp_path,
):

    file_path = (
        tmp_path
        / "decisions.csv"
    )

    record1 = {
        "Decision_ID": "DEC-SHP-1",
        "Shipment_ID": "SHP-1",
        "Recommended_Action": "Action A",
        "Selected_Action": "Action A",
    }

    record2 = {
        "Decision_ID": "DEC-SHP-1",
        "Shipment_ID": "SHP-1",
        "Recommended_Action": "Action B",
        "Selected_Action": "Action B",
    }

    save_decision(
        record1,
        file_path,
    )

    result = save_decision(
        record2,
        file_path,
    )

    assert len(result) == 1

    assert result.iloc[0][
        "Recommended_Action"
    ] == "Action B"


# ============================================================
# OVERRIDE ANALYSIS
# ============================================================

def test_calculate_override_rate():

    df = pd.DataFrame(
        {
            "Recommended_Action": [
                "A",
                "B",
                "C",
                "D",
            ],

            "Selected_Action": [
                "A",
                "X",
                "C",
                "Y",
            ],
        }
    )

    result = calculate_override_rate(
        df
    )

    assert result == 50.0


def test_calculate_override_rate_empty():

    df = pd.DataFrame()

    result = calculate_override_rate(
        df
    )

    assert result == 0.0


def test_decision_summary():

    df = pd.DataFrame(
        {
            "Recommended_Action": [
                "A",
                "B",
                "C",
            ],

            "Selected_Action": [
                "A",
                "X",
                "C",
            ],
        }
    )

    result = decision_summary(
        df
    )

    assert result[
        "total_decisions"
    ] == 3

    assert result[
        "manager_overrides"
    ] == 1

    assert result[
        "override_rate"
    ] == round(
        1 / 3 * 100,
        2,
    )


def test_decision_summary_empty():

    result = decision_summary(
        pd.DataFrame()
    )

    assert result == {
        "total_decisions": 0,
        "manager_overrides": 0,
        "override_rate": 0.0,
    }


# ============================================================
# OUTCOME RECORDING
# ============================================================

def test_recommend_action():

    row = pd.Series(
        {
            "Late_delivery_risk": 1,
            "Shipping_Mode": "Standard Class",
            "Order_Item_Quantity": 2,
        }
    )

    result = recommend_action(
        row
    )

    assert result == (
        "Upgrade shipping mode"
    )


def test_recommend_action_high_risk_quantity():

    row = pd.Series(
        {
            "Late_delivery_risk": 1,
            "Shipping_Mode": "First Class",
            "Order_Item_Quantity": 5,
        }
    )

    result = recommend_action(
        row
    )

    assert result == (
        "Split shipment"
    )


def test_recommend_action_low_risk():

    row = pd.Series(
        {
            "Late_delivery_risk": 0,
            "Shipping_Mode": "Same Day",
            "Order_Item_Quantity": 1,
        }
    )

    result = recommend_action(
        row
    )

    assert result == (
        "Maintain current mode"
    )


def test_expected_delivery_days():

    row = pd.Series(
        {
            "Days_for_shipment_scheduled": 5
        }
    )

    assert (
        expected_delivery_days(row)
        == 5
    )


def test_expected_operational_cost():

    row = pd.Series(
        {
            "Order_Item_Total": 1000,
            "Order_Item_Quantity": 5,
            "Shipping_Mode": "Standard Class",
        }
    )

    result = expected_operational_cost(
        row
    )

    assert result == 118.0


def test_actual_delivery_days():

    row = pd.Series(
        {
            "Days_for_shipment_scheduled": 5,
            "Late_delivery_risk": 1,
            "Shipment_ID": "SHP-2",
        }
    )

    result = actual_delivery_days(
        row
    )

    assert result == 7


def test_actual_operational_cost():

    row = pd.Series(
        {
            "Order_Item_Total": 1000,
            "Order_Item_Quantity": 5,
            "Shipping_Mode": "Standard Class",
            "Late_delivery_risk": 0,
            "Shipment_ID": "SHP-2",
        }
    )

    result = actual_operational_cost(
        row
    )

    assert result == round(
        118.0 * 1.02,
        2,
    )


# ============================================================
# CREATE DECISION OUTCOMES
# ============================================================

def test_create_decision_outcomes():

    shipments = pd.DataFrame(
        {
            "Shipment_ID": ["SHP-1"],

            "Shipment_Date": [
                "2026-08-20"
            ],

            "Shipping_Mode": [
                "Standard Class"
            ],

            "Days_for_shipment_scheduled": [
                5
            ],

            "Category_Name": [
                "Technology"
            ],

            "Market": [
                "US"
            ],

            "Order_Region": [
                "East"
            ],

            "Customer_Country": [
                "United States"
            ],

            "Customer_City": [
                "New York"
            ],

            "Order_Item_Quantity": [
                2
            ],

            "Sales_per_customer": [
                1000
            ],

            "Order_Item_Total": [
                1000
            ],

            "Order_Profit_Per_Order": [
                100
            ],

            "Late_delivery_risk": [
                0
            ],
        }
    )

    result = create_decision_outcomes(
        shipments
    )

    assert len(result) == 1

    assert (
        "recommended_action"
        in result.columns
    )

    assert (
        "expected_cost"
        in result.columns
    )

    assert (
        "actual_cost"
        in result.columns
    )

    assert (
        "outcome_status"
        in result.columns
    )


def test_save_decision_outcomes(
    tmp_path,
):

    file_path = (
        tmp_path
        / "decision_outcomes.csv"
    )

    df = pd.DataFrame(
        {
            "Shipment_ID": ["SHP-1"],
            "expected_cost": [1000],
            "actual_cost": [900],
        }
    )

    save_decision_outcomes(
        df,
        file_path,
    )

    assert file_path.exists()

    loaded = pd.read_csv(
        file_path
    )

    assert len(loaded) == 1


# ============================================================
# RECORD OUTCOME
# ============================================================

def test_record_outcome_success(
    tmp_path,
):

    file_path = (
        tmp_path
        / "outcomes.csv"
    )

    df = pd.DataFrame(
        {
            "Shipment_ID": [
                "SHP-1"
            ],

            "expected_delivery_days": [
                5
            ],

            "actual_delivery_days": [
                5
            ],

            "expected_cost": [
                1000
            ],

            "actual_cost": [
                900
            ],

            "delivery_status": [
                "On Time"
            ],

            "outcome_status": [
                "Successful"
            ],
        }
    )

    df.to_csv(
        file_path,
        index=False,
    )

    result = record_outcome(
        shipment_id="SHP-1",
        actual_delivery_days=4,
        actual_cost=800,
        file_path=file_path,
    )

    assert result[
        "actual_delivery_days"
    ] == 4

    assert result[
        "actual_cost"
    ] == 800

    assert result[
        "delivery_status"
    ] == "On Time"

    assert result[
        "outcome_status"
    ] == "Successful"


def test_record_outcome_unsuccessful(
    tmp_path,
):

    file_path = (
        tmp_path
        / "outcomes.csv"
    )

    df = pd.DataFrame(
        {
            "Shipment_ID": [
                "SHP-1"
            ],

            "expected_delivery_days": [
                5
            ],

            "actual_delivery_days": [
                5
            ],

            "expected_cost": [
                1000
            ],

            "actual_cost": [
                1000
            ],

            "delivery_status": [
                "On Time"
            ],

            "outcome_status": [
                "Successful"
            ],
        }
    )

    df.to_csv(
        file_path,
        index=False,
    )

    result = record_outcome(
        shipment_id="SHP-1",
        actual_delivery_days=7,
        actual_cost=1200,
        file_path=file_path,
    )

    assert result[
        "delivery_status"
    ] == "Delayed"

    assert result[
        "outcome_status"
    ] == "Unsuccessful"


def test_record_outcome_unknown_shipment(
    tmp_path,
):

    file_path = (
        tmp_path
        / "outcomes.csv"
    )

    df = pd.DataFrame(
        {
            "Shipment_ID": [
                "SHP-1"
            ],

            "expected_delivery_days": [
                5
            ],

            "actual_delivery_days": [
                5
            ],

            "expected_cost": [
                1000
            ],

            "actual_cost": [
                1000
            ],

            "delivery_status": [
                "On Time"
            ],

            "outcome_status": [
                "Successful"
            ],
        }
    )

    df.to_csv(
        file_path,
        index=False,
    )

    with pytest.raises(
        ValueError
    ):

        record_outcome(
            shipment_id="SHP-999",
            actual_delivery_days=5,
            actual_cost=1000,
            file_path=file_path,
        )


# ============================================================
# FEEDBACK TESTS
# ============================================================

def test_generate_positive_feedback():

    row = pd.Series(
        {
            "Shipment_ID": "SHP-1",
            "recommended_action": "Action A",
            "expected_cost": 1000,
            "actual_cost": 900,
            "expected_delivery_days": 5,
            "actual_delivery_days": 4,
            "outcome_status": "Successful",
        }
    )

    result = generate_feedback(
        row
    )

    assert (
        result["Feedback_Status"]
        == "Positive"
    )


def test_generate_negative_feedback():

    row = pd.Series(
        {
            "Shipment_ID": "SHP-2",
            "recommended_action": "Action B",
            "expected_cost": 1000,
            "actual_cost": 1200,
            "expected_delivery_days": 5,
            "actual_delivery_days": 7,
            "outcome_status": "Unsuccessful",
        }
    )

    result = generate_feedback(
        row
    )

    assert (
        result["Feedback_Status"]
        == "Negative"
    )


def test_generate_mixed_feedback():

    row = pd.Series(
        {
            "Shipment_ID": "SHP-3",
            "recommended_action": "Action C",
            "expected_cost": 1000,
            "actual_cost": 900,
            "expected_delivery_days": 5,
            "actual_delivery_days": 7,
            "outcome_status": "Unsuccessful",
        }
    )

    result = generate_feedback(
        row
    )

    assert (
        result["Feedback_Status"]
        == "Mixed"
    )


def test_create_feedback(
    sample_outcomes,
):

    result = create_feedback(
        sample_outcomes
    )

    assert len(result) == 3

    assert (
        "Feedback_Status"
        in result.columns
    )

    assert (
        "Cost_Difference"
        in result.columns
    )

    assert (
        "Delay_Difference"
        in result.columns
    )


def test_calculate_action_feedback(
    sample_outcomes,
):

    feedback_df = create_feedback(
        sample_outcomes
    )

    result = calculate_action_feedback(
        feedback_df
    )

    assert len(result) == 3

    assert (
        "positive_rate"
        in result.columns
    )

    assert (
        "negative_rate"
        in result.columns
    )


def test_calculate_learning_signals(
    sample_outcomes,
):

    feedback_df = create_feedback(
        sample_outcomes
    )

    result = calculate_learning_signals(
        feedback_df
    )

    assert (
        "total_feedback"
        in result
    )

    assert (
        "positive_feedback_rate"
        in result
    )

    assert (
        "negative_feedback_rate"
        in result
    )

    assert (
        "average_cost_error"
        in result
    )

    assert (
        "average_delay_error"
        in result
    )

    assert (
        "recommended_weight_adjustment"
        in result
    )


def test_empty_learning_signals():

    result = calculate_learning_signals(
        pd.DataFrame(
            columns=[
                "Feedback_Status",
                "Cost_Difference",
                "Delay_Difference",
            ]
        )
    )

    assert result[
        "total_feedback"
    ] == 0

    assert result[
        "positive_feedback_rate"
    ] == 0.0

    assert result[
        "negative_feedback_rate"
    ] == 0.0


# ============================================================
# DAY 13 – DECISION TRACKING TEST
# ============================================================

def test_day13_complete_decision_tracking(
    tmp_path,
):

    file_path = (
        tmp_path
        / "decisions.csv"
    )

    record = track_decision(
        shipment_id="SHP-DAY13",
        recommended_action="Upgrade shipping mode",
        selected_action="Upgrade shipping mode",
        expected_cost=15000,
        expected_delivery_days=3,
        decision_date="2026-09-01",
    )

    saved = save_decision(
        record,
        file_path,
    )

    assert len(saved) == 1

    assert (
        saved.iloc[0]["Decision_ID"]
        == "DEC-SHP-DAY13"
    )

    assert (
        saved.iloc[0]["Manager_Override"]
        in [False, "False"]
    )

    summary = decision_summary(
        saved
    )

    assert (
        summary["total_decisions"]
        == 1
    )

    assert (
        summary["manager_overrides"]
        == 0
    )

    assert (
        summary["override_rate"]
        == 0.0
    )


def test_day13_manager_override_tracking(
    tmp_path,
):

    file_path = (
        tmp_path
        / "decisions.csv"
    )

    record = track_decision(
        shipment_id="SHP-DAY13-OVERRIDE",
        recommended_action="Air Freight",
        selected_action="Secondary Supplier",
        expected_cost=15000,
        expected_delivery_days=3,
        decision_date="2026-09-01",
    )

    saved = save_decision(
        record,
        file_path,
    )

    summary = decision_summary(
        saved
    )

    assert (
        summary["total_decisions"]
        == 1
    )

    assert (
        summary["manager_overrides"]
        == 1
    )

    assert (
        summary["override_rate"]
        == 100.0
    )


# ============================================================
# FULL CLOSED-LOOP PIPELINE TEST
# ============================================================

def test_full_closed_loop_pipeline(
    sample_outcomes,
):

    # ------------------------------------
    # Step 1: Prepare outcomes
    # ------------------------------------

    prepared = prepare_outcome_data(
        sample_outcomes
    )

    assert len(prepared) == 3

    # ------------------------------------
    # Step 2: Calculate metrics
    # ------------------------------------

    metrics = calculate_metrics(
        sample_outcomes
    )

    assert (
        metrics["total_shipments"]
        == 3
    )

    # ------------------------------------
    # Step 3: Calculate ROI
    # ------------------------------------

    roi = calculate_roi(
        sample_outcomes
    )

    assert (
        "roi_percentage"
        in roi
    )

    # ------------------------------------
    # Step 4: Generate feedback
    # ------------------------------------

    feedback_df = create_feedback(
        sample_outcomes
    )

    assert len(feedback_df) == 3

    # ------------------------------------
    # Step 5: Calculate learning signals
    # ------------------------------------

    learning = calculate_learning_signals(
        feedback_df
    )

    assert (
        learning["total_feedback"]
        == 3
    )

    # ------------------------------------
    # Step 6: Track decision
    # ------------------------------------

    record = track_decision(
        shipment_id="SHP-PIPELINE",
        recommended_action="Prioritize shipment",
        expected_cost=5000,
        expected_delivery_days=3,
    )

    assert (
        record["Decision_ID"]
        == "DEC-SHP-PIPELINE"
    )

    # ------------------------------------
    # Pipeline completed
    # ------------------------------------

    assert True
