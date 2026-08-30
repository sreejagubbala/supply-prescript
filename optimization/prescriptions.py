from .solver import solve_optimization


def generate_prescription(
    shipment,
    prediction,
    budget=60.0,
    maximum_days=7.0,
):
    """
    Generate an actionable recommendation.

    shipment:
        Original shipment information.

    prediction:
        Output from Member 1 ML model.
    """

    delay_probability = float(
        prediction["delay_probability"]
    )

    predicted_shipping_days = float(
        prediction["predicted_shipping_days"]
    )

    result = solve_optimization(
        delay_probability=delay_probability,
        predicted_shipping_days=predicted_shipping_days,
        budget=budget,
        maximum_days=maximum_days,
    )

    if result["recommended_mode"] is None:

        return {
            "status": result["status"],
            "recommendation": None,
            "reason": (
                "No feasible shipping option "
                "satisfies the constraints."
            ),
        }

    recommended_mode = result[
        "recommended_mode"
    ]

    risk_level = prediction.get(
        "risk_level",
        "Unknown",
    )

    if risk_level == "High":
        reason = (
            "High delay risk detected. "
            "Optimization recommends a faster "
            "shipping mode."
        )

    elif risk_level == "Medium":
        reason = (
            "Medium delay risk detected. "
            "Optimization balances cost and delay."
        )

    else:
        reason = (
            "Low delay risk detected. "
            "Optimization prioritizes cost efficiency."
        )

    return {
        "status": result["status"],
        "recommendation": {
            "shipping_mode": recommended_mode,
            "expected_cost": result["expected_cost"],
            "expected_shipping_days": (
                result["expected_shipping_days"]
            ),
            "delay_probability": (
                result["delay_probability"]
            ),
            "delay_penalty": result["delay_penalty"],
            "objective_value": (
                result["objective_value"]
            ),
            "risk_level": risk_level,
            "reason": reason,
        },
        "shipment": shipment,
    }