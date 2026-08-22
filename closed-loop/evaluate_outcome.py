from performance_metrics import (
    calculate_cost_variance,
    calculate_cost_savings,
    calculate_delay_variance,
    calculate_decision_success,
)


def evaluate_outcome(
    expected_cost,
    actual_cost,
    expected_delay,
    actual_delay
):
    cost_variance = calculate_cost_variance(
        expected_cost,
        actual_cost
    )

    savings = calculate_cost_savings(
        expected_cost,
        actual_cost
    )

    delay_variance = calculate_delay_variance(
        expected_delay,
        actual_delay
    )

    success = calculate_decision_success(
        expected_cost,
        actual_cost,
        expected_delay,
        actual_delay
    )

    return {
        "expected_cost": expected_cost,
        "actual_cost": actual_cost,
        "cost_variance": cost_variance,
        "savings": savings,
        "expected_delay": expected_delay,
        "actual_delay": actual_delay,
        "delay_variance": delay_variance,
        "decision_success": success,
    }