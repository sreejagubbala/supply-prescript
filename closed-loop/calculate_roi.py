def calculate_roi(expected_cost, actual_cost):
    savings = expected_cost - actual_cost

    if expected_cost == 0:
        return 0

    roi = (savings / expected_cost) * 100

    return roi
def calculate_savings(expected_cost, actual_cost):
    
    return expected_cost - actual_cost