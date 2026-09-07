from solver import find_best_action
from prescriptions import generate_prescription


def evaluate_cases():
    """Evaluate optimization decisions for different risk levels."""

    test_cases = [
        0.20,
        0.40,
        0.60,
        0.80,
        0.95,
    ]

    print("OPTIMIZATION EVALUATION")
    print("=" * 60)

    for probability in test_cases:
        result = find_best_action(probability)

        prescription = generate_prescription(
            probability,
            result["recommended_action"],
            result["expected_risk"],
        )

        print(f"\nDelay Probability: {probability:.2f}")
        print(f"Recommended Action: {prescription['action']}")
        print(f"Expected Risk: {prescription['expected_risk']:.2f}")
        print(
            f"Risk Reduction: "
            f"{prescription['expected_risk_reduction']:.2f}"
        )
        print(
            f"Estimated Cost: "
            f"{prescription['estimated_cost']}"
        )


if __name__ == "__main__":
    evaluate_cases()