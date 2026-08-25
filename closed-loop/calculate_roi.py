
from performance_metrics import calculate_cost_savings

def calculate_savings(expected_cost, actual_cost):
    """
    Calculate savings from a decision.

    Formula:
        Expected Cost - Actual Cost
    """
    return calculate_cost_savings(expected_cost, actual_cost)


def calculate_roi(expected_cost, actual_cost):
    """
    Calculate ROI percentage.

    Formula:
        ROI = (Savings / Expected Cost) * 100
    """
    if expected_cost < 0:
        raise ValueError("Expected cost cannot be negative")

    if actual_cost < 0:
        raise ValueError("Actual cost cannot be negative")

    if expected_cost == 0:
        return 0.0

    savings = expected_cost - actual_cost

    return (savings / expected_cost) * 100


def calculate_roi_details(expected_cost, actual_cost):
    """
    Return complete ROI information.
    """
    savings = calculate_savings(expected_cost, actual_cost)
    roi = calculate_roi(expected_cost, actual_cost)
    return {
        "expected_cost": expected_cost,
        "actual_cost": actual_cost,
        "savings": savings,
        "roi_percentage": roi
    }


def calculate_average_roi(roi_values):
    """
    Calculate average ROI from multiple decisions.
    """
    if not roi_values:
        return 0.0
    return sum(roi_values) / len(roi_values)