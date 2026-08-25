
def validate_non_negative(value, field_name):
    """Validate that a numeric value is not negative."""
    if value is None:
        raise ValueError(f"{field_name} cannot be None")
    if not isinstance(value, (int, float)):
        raise TypeError(f"{field_name} must be a number")
    if value < 0:
        raise ValueError(f"{field_name} cannot be negative")
    return value

def calculate_cost_variance(expected_cost, actual_cost):
    """
    Calculate cost variance.

    Formula:
        Actual Cost - Expected Cost

    Negative value:
        Actual cost was lower than expected.

    Positive value:
        Actual cost was higher than expected.
    """
    validate_non_negative(expected_cost, "Expected cost")
    validate_non_negative(actual_cost, "Actual cost")
    return actual_cost - expected_cost

def calculate_cost_savings(expected_cost, actual_cost):
    """
    Calculate cost savings.

    Formula:
        Expected Cost - Actual Cost

    Positive value means savings were achieved.
    Negative value means additional cost was incurred.
    """
    validate_non_negative(expected_cost, "Expected cost")
    validate_non_negative(actual_cost, "Actual cost")
    return expected_cost - actual_cost


def calculate_cost_reduction_percentage(expected_cost, actual_cost):
    """
    Calculate cost reduction percentage.
    """
    validate_non_negative(expected_cost, "Expected cost")
    validate_non_negative(actual_cost, "Actual cost")
    if expected_cost == 0:
        return 0.0
    savings = expected_cost - actual_cost
    return (savings / expected_cost) * 100

def calculate_delay_variance(expected_delay, actual_delay):
    """
    Calculate delay variance.

    Formula:
        Actual Delay - Expected Delay
    """
    validate_non_negative(expected_delay, "Expected delay")
    validate_non_negative(actual_delay, "Actual delay")
    return actual_delay - expected_delay

def calculate_delay_improvement_percentage(expected_delay, actual_delay):
    """
    Calculate delay improvement percentage.

    Positive value means delay improved.
    Negative value means delay increased.
    """
    validate_non_negative(expected_delay, "Expected delay")
    validate_non_negative(actual_delay, "Actual delay")
    if expected_delay == 0:
        return 0.0
    improvement = expected_delay - actual_delay
    return (improvement / expected_delay) * 100

def calculate_decision_success(expected_cost, actual_cost, expected_delay, actual_delay):
    """
    Determine whether a decision was successful.

    A decision is successful when:
        Actual Cost <= Expected Cost
        AND
        Actual Delay <= Expected Delay
    """
    validate_non_negative(expected_cost, "Expected cost")
    validate_non_negative(actual_cost, "Actual cost")
    validate_non_negative(expected_delay, "Expected delay")
    validate_non_negative(actual_delay, "Actual delay")
    return (
        actual_cost <= expected_cost
        and actual_delay <= expected_delay
    )

def calculate_decision_success_rate(successful_decisions, total_decisions):
    """
    Calculate decision success rate.
    """
    validate_non_negative(
        successful_decisions,
        "Successful decisions"
    )
    validate_non_negative(
        total_decisions,
        "Total decisions"
    )
    if total_decisions == 0:
        return 0.0
    if successful_decisions > total_decisions:
        raise ValueError(
            "Successful decisions cannot exceed total decisions"
        )
    return (
        successful_decisions /
        total_decisions
    ) * 100


def calculate_total_savings(savings):
    """
    Calculate total savings from a collection of decisions.
    """
    if savings is None:
        raise ValueError("Savings cannot be None")
    if not savings:
        return 0.0
    return sum(savings)

def calculate_average_roi(roi_values):
    """
    Calculate average ROI.
    """
    if roi_values is None:
        raise ValueError("ROI values cannot be None")
    if not roi_values:
        return 0.0
    return sum(roi_values) / len(roi_values)