def calculate_cost_variance(expected_cost, actual_cost):
    return actual_cost - expected_cost


def calculate_cost_savings(expected_cost, actual_cost):
    return expected_cost - actual_cost


def calculate_delay_variance(expected_delay, actual_delay):
    return actual_delay - expected_delay


def calculate_decision_success(expected_cost, actual_cost, expected_delay, actual_delay):
    return (
        actual_cost <= expected_cost
        and actual_delay <= expected_delay
    )