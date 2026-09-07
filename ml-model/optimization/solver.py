from config import (
    ACTIONS,
    ACTION_COSTS,
    DELAY_REDUCTION,
    MIN_RISK_THRESHOLD,
)
from constraints import is_action_allowed
from objective import calculate_objective


def find_best_action(delay_probability):
    """
    Select the best intervention for a shipment.

    Returns the recommended action, objective value,
    and expected remaining risk.
    """

    if delay_probability < MIN_RISK_THRESHOLD:
        return {
            "recommended_action": "No Action",
            "objective": calculate_objective(
                delay_probability,
                "No Action"
            ),
            "expected_risk": round(delay_probability, 4),
            "estimated_cost": 0,
        }

    best_action = None
    best_objective = float("inf")

    for action in ACTIONS:
        if not is_action_allowed(action):
            continue

        objective = calculate_objective(
            delay_probability,
            action
        )

        if objective < best_objective:
            best_objective = objective
            best_action = action

    reduction = DELAY_REDUCTION.get(best_action, 0.0)

    expected_risk = max(
        delay_probability - reduction,
        0.0
    )

    return {
        "recommended_action": best_action,
        "objective": round(best_objective, 4),
        "expected_risk": round(expected_risk, 4),
        "estimated_cost": ACTION_COSTS.get(best_action, 0),
    }