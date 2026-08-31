import sys
from pathlib import Path

# ---------------------------------------------------------
# ADD CLOSED-LOOP DIRECTORY TO PYTHON PATH
# ---------------------------------------------------------

CLOSED_LOOP_DIR = (
    Path(__file__).resolve().parent.parent / "closed-loop"
)

sys.path.insert(0, str(CLOSED_LOOP_DIR))


from performance_metrics import (
    calculate_cost_variance,
    calculate_cost_savings,
    calculate_cost_reduction_percentage,
    calculate_delay_variance,
    calculate_delay_improvement_percentage,
    calculate_decision_success,
    calculate_decision_success_rate,
    calculate_total_savings,
    calculate_average_roi,
)

from closed_loop_analysis import (
    calculate_savings,
    calculate_roi,
    calculate_roi_details,
)

from evaluate_outcome import evaluate_outcome


# =========================================================
# COST KPI TESTS
# =========================================================

def test_cost_variance():

    result = calculate_cost_variance(
        10000,
        8500
    )

    assert result == -1500


def test_cost_savings():

    result = calculate_cost_savings(
        10000,
        8500
    )

    assert result == 1500


def test_negative_savings():

    result = calculate_cost_savings(
        10000,
        12000
    )

    assert result == -2000


def test_cost_reduction_percentage():

    result = calculate_cost_reduction_percentage(
        10000,
        8500
    )

    assert result == 15.0


# =========================================================
# DELAY KPI TESTS
# =========================================================

def test_delay_variance():

    result = calculate_delay_variance(
        3,
        2
    )

    assert result == -1


def test_delay_increase():

    result = calculate_delay_variance(
        3,
        5
    )

    assert result == 2


def test_delay_improvement_percentage():

    result = calculate_delay_improvement_percentage(
        4,
        2
    )

    assert result == 50.0


# =========================================================
# DECISION KPI TESTS
# =========================================================

def test_successful_decision():

    result = calculate_decision_success(
        expected_cost=10000,
        actual_cost=8500,
        expected_delay=3,
        actual_delay=2
    )

    assert result is True


def test_failed_decision():

    result = calculate_decision_success(
        expected_cost=10000,
        actual_cost=12000,
        expected_delay=3,
        actual_delay=5
    )

    assert result is False


def test_cost_good_but_delay_bad():

    result = calculate_decision_success(
        expected_cost=10000,
        actual_cost=9000,
        expected_delay=3,
        actual_delay=5
    )

    assert result is False


def test_decision_success_rate():

    result = calculate_decision_success_rate(
        successful_decisions=8,
        total_decisions=10
    )

    assert result == 80.0


# =========================================================
# ROI TESTS
# =========================================================

def test_savings():

    result = calculate_savings(
        10000,
        8500
    )

    assert result == 1500


def test_roi():

    result = calculate_roi(
        10000,
        8500
    )

    assert result == 15.0


def test_negative_roi():

    result = calculate_roi(
        10000,
        12000
    )

    assert result == -20.0


def test_zero_expected_cost():

    result = calculate_roi(
        0,
        500
    )

    assert result == 0.0


def test_roi_details():

    result = calculate_roi_details(
        10000,
        8500
    )

    assert result["savings"] == 1500
    assert result["roi_percentage"] == 15.0


# =========================================================
# MULTIPLE DECISION KPI TESTS
# =========================================================

def test_total_savings():

    savings = [
        1000,
        1500,
        2000
    ]

    result = calculate_total_savings(
        savings
    )

    assert result == 4500


def test_average_roi():

    roi_values = [
        10,
        15,
        20
    ]

    result = calculate_average_roi(
        roi_values
    )

    assert result == 15


# =========================================================
# COMPLETE OUTCOME TEST
# =========================================================

def test_complete_successful_outcome():

    result = evaluate_outcome(
        expected_cost=10000,
        actual_cost=8500,
        expected_delay=3,
        actual_delay=2
    )

    assert result["cost_savings"] == 1500

    assert result["cost_variance"] == -1500

    assert result["delay_variance"] == -1

    assert result["roi_percentage"] == 15.0

    assert result["decision_success"] is True


def test_complete_failed_outcome():

    result = evaluate_outcome(
        expected_cost=10000,
        actual_cost=12000,
        expected_delay=3,
        actual_delay=5
    )

    assert result["cost_savings"] == -2000

    assert result["roi_percentage"] == -20.0

    assert result["decision_success"] is False


# =========================================================
# EDGE CASE TESTS
# =========================================================

def test_negative_cost_rejected():

    try:
        calculate_cost_savings(
            -1000,
            500
        )

        assert False

    except ValueError:
        assert True


def test_negative_delay_rejected():

    try:
        calculate_delay_variance(
            -3,
            2
        )

        assert False

    except ValueError:
        assert True


def test_zero_total_decisions():

    result = calculate_decision_success_rate(
        0,
        0
    )

    assert result == 0.0