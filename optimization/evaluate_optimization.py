from .prescriptions import generate_prescription


def run_demo():

    shipment = {
        "Shipping Mode": "Standard Class",
        "Days for shipment (scheduled)": 4,
        "Type": "DEBIT",
        "Category Name": "Sporting Goods",
        "Department Name": "Fitness",
        "Market": "Pacific Asia",
        "Order Region": "Southeast Asia",
        "Customer Country": "India",
        "Customer City": "Hyderabad",
        "Order Item Quantity": 2,
        "Sales per customer": 245.50,
        "Order Item Total": 221.00,
        "Order Profit Per Order": 24.50,
    }

    # This is the output we expect from Member 1.
    prediction = {
        "predicted_delay": 1,
        "delay_probability": 0.82,
        "risk_level": "High",
        "predicted_shipping_days": 6.2,
    }

    result = generate_prescription(
        shipment=shipment,
        prediction=prediction,
        budget=60.0,
        maximum_days=7.0,
    )

    print("\n==============================")
    print("SUPPLY PRESCRIPT OPTIMIZATION")
    print("==============================")

    print("\nStatus:")
    print(result["status"])

    if result["recommendation"]:

        recommendation = result[
            "recommendation"
        ]

        print("\nRecommended Shipping Mode:")
        print(
            recommendation["shipping_mode"]
        )

        print("\nExpected Cost:")
        print(
            recommendation["expected_cost"]
        )

        print("\nExpected Shipping Days:")
        print(
            recommendation[
                "expected_shipping_days"
            ]
        )

        print("\nDelay Probability:")
        print(
            recommendation[
                "delay_probability"
            ]
        )

        print("\nRisk Level:")
        print(
            recommendation["risk_level"]
        )

        print("\nReason:")
        print(
            recommendation["reason"]
        )


if __name__ == "__main__":
    run_demo()