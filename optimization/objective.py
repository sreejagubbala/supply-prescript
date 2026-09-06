from .config import DELAY_PENALTY


def calculate_objective(cost, predicted_delay, delay_probability):
    """
    Calculate optimization objective.

    Lower objective value is better.

    Parameters
    ----------
    cost : float
        Estimated shipping cost.

    predicted_delay : float
        Expected shipping delay/duration.

    delay_probability : float
        Probability of delay between 0 and 1.
    """

    if cost < 0:
        raise ValueError("Cost cannot be negative.")

    if predicted_delay < 0:
        raise ValueError("Predicted delay cannot be negative.")

    if not 0 <= delay_probability <= 1:
        raise ValueError(
            "Delay probability must be between 0 and 1."
        )

    delay_penalty = (
        predicted_delay
        * delay_probability
        * DELAY_PENALTY
    )

    total_objective = cost + delay_penalty

    return round(total_objective, 2)