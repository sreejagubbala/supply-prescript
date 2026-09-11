from config import ACTION_COSTS, DELAY_REDUCTION


RISK_WEIGHT = 0.8
COST_WEIGHT = 0.2


def calculate_objective(delay_probability, action):
    """
    Calculate the objective value for an intervention.

    Lower objective value is better.

    The objective balances:
    - remaining delay risk
    - intervention cost
    """

    reduction = DELAY_REDUCTION.get(action, 0.0)
    cost = ACTION_COSTS.get(action, 0)

    remaining_risk = max(
        delay_probability - reduction,
        0.0
    )

    normalized_cost = cost / 100

    objective = (
        RISK_WEIGHT * remaining_risk
        + COST_WEIGHT * normalized_cost
    )

    return round(objective, 4)