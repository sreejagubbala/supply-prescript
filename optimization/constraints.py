from .config import DEFAULT_BUDGET


def validate_budget(budget):
    if budget <= 0:
        raise ValueError("Budget must be greater than zero.")

    return True


def validate_delay_probability(delay_probability):
    if not 0 <= delay_probability <= 1:
        raise ValueError(
            "Delay probability must be between 0 and 1."
        )

    return True


def check_budget_constraint(cost, budget=DEFAULT_BUDGET):
    validate_budget(budget)

    return cost <= budget


def check_service_constraint(
    predicted_days,
    maximum_days
):
    if predicted_days < 0:
        raise ValueError(
            "Predicted days cannot be negative."
        )

    if maximum_days <= 0:
        raise ValueError(
            "Maximum allowed days must be positive."
        )

    return predicted_days <= maximum_days