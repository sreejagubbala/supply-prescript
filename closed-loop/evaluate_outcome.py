from performance_metrics import (
    calculate_cost_variance,
    calculate_cost_savings,
    calculate_cost_reduction_percentage,
    calculate_delay_variance,
    calculate_delay_improvement_percentage,
    calculate_decision_success,
)
from calculate_roi import calculate_roi

def evaluate_outcome(
    expected_cost,
    actual_cost,
    expected_delay,
    actual_delay
):
    """
    Evaluate the actual outcome of a completed decision.
    """
    cost_variance = calculate_cost_variance(
        expected_cost,
        actual_cost
    )
    cost_savings = calculate_cost_savings(
        expected_cost,
        actual_cost
    )
    cost_reduction = calculate_cost_reduction_percentage(
        expected_cost,
        actual_cost
    )
    delay_variance = calculate_delay_variance(
        expected_delay,
        actual_delay
    )

    delay_improvement = calculate_delay_improvement_percentage(
        expected_delay,
        actual_delay
    )

    decision_success = calculate_decision_success(
        expected_cost,
        actual_cost,
        expected_delay,
        actual_delay
    )

    roi = calculate_roi(
        expected_cost,
        actual_cost
    )

    return {
        "expected_cost": expected_cost,
        "actual_cost": actual_cost,
        "cost_variance": cost_variance,
        "cost_savings": cost_savings,
        "cost_reduction_percentage": cost_reduction,
        "expected_delay": expected_delay,
        "actual_delay": actual_delay,
        "delay_variance": delay_variance,
        "delay_improvement_percentage": delay_improvement,
        "roi_percentage": roi,
        "decision_success": decision_success,
    }


if __name__ == "__main__":

    result = evaluate_outcome(
        expected_cost=10000,
        actual_cost=8500,
        expected_delay=3,
        actual_delay=2
    )

    print("\nOutcome Evaluation")
    print("------------------")

    for key, value in result.items():
        print(f"{key}: {value}")