import pulp

from .config import (
    SHIPPING_MODES,
    SHIPPING_COST,
    SHIPPING_DAYS,
    DELAY_PENALTY,
)


def solve_optimization(
    delay_probability,
    predicted_shipping_days,
    budget=60.0,
    maximum_days=7.0,
):
    """
    Select the best shipping mode using linear optimization.
    """

    if not 0 <= delay_probability <= 1:
        raise ValueError(
            "Delay probability must be between 0 and 1."
        )

    if predicted_shipping_days < 0:
        raise ValueError(
            "Predicted shipping days cannot be negative."
        )

    if budget <= 0:
        raise ValueError(
            "Budget must be greater than zero."
        )

    if maximum_days <= 0:
        raise ValueError(
            "Maximum days must be greater than zero."
        )

    # --------------------------------------------------
    # Create optimization problem
    # --------------------------------------------------

    problem = pulp.LpProblem(
        "Supply_Prescript_Optimization",
        pulp.LpMinimize,
    )

    # --------------------------------------------------
    # Decision variables
    # --------------------------------------------------

    decision_variables = {
        mode: pulp.LpVariable(
            f"use_{mode.replace(' ', '_')}",
            cat="Binary",
        )
        for mode in SHIPPING_MODES
    }

    # --------------------------------------------------
    # Objective
    # --------------------------------------------------

    objective_terms = []

    for mode in SHIPPING_MODES:

        shipping_cost = SHIPPING_COST[mode]

        expected_delay = SHIPPING_DAYS[mode]

        delay_penalty = (
            expected_delay
            * delay_probability
            * DELAY_PENALTY
        )

        objective_terms.append(
            (
                shipping_cost + delay_penalty
            )
            * decision_variables[mode]
        )

    problem += pulp.lpSum(objective_terms)

    # --------------------------------------------------
    # Constraint 1:
    # Exactly one shipping mode
    # --------------------------------------------------

    problem += (
        pulp.lpSum(
            decision_variables.values()
        )
        == 1
    )

    # --------------------------------------------------
    # Constraint 2:
    # Budget
    # --------------------------------------------------

    problem += pulp.lpSum(
        SHIPPING_COST[mode]
        * decision_variables[mode]
        for mode in SHIPPING_MODES
    ) <= budget

    # --------------------------------------------------
    # Constraint 3:
    # Maximum shipping duration
    # --------------------------------------------------

    problem += pulp.lpSum(
        SHIPPING_DAYS[mode]
        * decision_variables[mode]
        for mode in SHIPPING_MODES
    ) <= maximum_days

    # --------------------------------------------------
    # Solve
    # --------------------------------------------------

    problem.solve(
        pulp.PULP_CBC_CMD(msg=False)
    )

    # --------------------------------------------------
    # Check result
    # --------------------------------------------------

    if pulp.LpStatus[problem.status] != "Optimal":

        return {
            "status": pulp.LpStatus[problem.status],
            "recommended_mode": None,
            "objective_value": None,
        }

    # --------------------------------------------------
    # Get selected mode
    # --------------------------------------------------

    selected_mode = None

    for mode in SHIPPING_MODES:

        if pulp.value(
            decision_variables[mode]
        ) == 1:

            selected_mode = mode
            break

    selected_cost = SHIPPING_COST[selected_mode]
    selected_days = SHIPPING_DAYS[selected_mode]

    delay_penalty = (
        selected_days
        * delay_probability
        * DELAY_PENALTY
    )

    objective_value = (
        selected_cost + delay_penalty
    )

    return {
        "status": "Optimal",
        "recommended_mode": selected_mode,
        "expected_cost": round(
            selected_cost, 2
        ),
        "expected_shipping_days": round(
            selected_days, 2
        ),
        "delay_probability": round(
            delay_probability, 4
        ),
        "delay_penalty": round(
            delay_penalty, 2
        ),
        "objective_value": round(
            objective_value, 2
        ),
    }