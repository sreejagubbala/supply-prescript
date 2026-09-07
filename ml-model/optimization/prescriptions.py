from config import ACTION_COSTS, DELAY_REDUCTION


ACTION_DESCRIPTIONS = {
    "Expedite Shipping":
        "Use expedited transportation to reduce the expected delivery delay.",

    "Change Shipping Mode":
        "Switch to a faster or more reliable shipping mode.",

    "Change Supplier":
        "Use an alternative supplier with better expected delivery performance.",

    "No Action":
        "No intervention is required because the shipment risk is low.",
}


def generate_prescription(
    delay_probability,
    recommended_action,
    expected_risk,
):
    """
    Generate a business-friendly prescription
    from the optimization result.
    """

    cost = ACTION_COSTS.get(recommended_action, 0)
    reduction = DELAY_REDUCTION.get(recommended_action, 0.0)

    return {
        "action": recommended_action,
        "description": ACTION_DESCRIPTIONS.get(
            recommended_action,
            "No recommendation available."
        ),
        "current_risk": round(delay_probability, 4),
        "expected_risk": round(expected_risk, 4),
        "expected_risk_reduction": round(reduction, 4),
        "estimated_cost": cost,
    }