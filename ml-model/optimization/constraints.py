from config import ACTION_COSTS, MAX_BUDGET


def is_action_allowed(action):
    """Check whether an action exists and is within the budget."""
    if action not in ACTION_COSTS:
        return False

    return ACTION_COSTS[action] <= MAX_BUDGET


def is_budget_feasible(actions):
    """Check whether a combination of actions fits within the budget."""
    total_cost = sum(ACTION_COSTS[action] for action in actions)

    return total_cost <= MAX_BUDGET


def calculate_total_cost(actions):
    """Calculate the total cost of selected actions."""
    return sum(ACTION_COSTS[action] for action in actions)