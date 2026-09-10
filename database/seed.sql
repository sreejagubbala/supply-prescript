INSERT INTO suppliers
    (supplier_name, reliability_score, location)
VALUES
    ('Alpha Electronics', 92.50, 'Delhi'),
    ('Beta Components', 87.00, 'Mumbai'),
    ('Gamma Industries', 95.00, 'Bangalore')
ON CONFLICT DO NOTHING;


INSERT INTO shipments
    (
        shipment_code,
        product,
        supplier_id,
        quantity,
        historical_lead_time,
        current_lead_time,
        inventory_level,
        status
    )
VALUES
    (
        'SHP001',
        'Microchips',
        1,
        5000,
        7,
        21,
        2000,
        'At Risk'
    ),
    (
        'SHP002',
        'Processors',
        2,
        3000,
        5,
        6,
        4000,
        'On Track'
    ),
    (
        'SHP003',
        'Memory Modules',
        3,
        7000,
        8,
        18,
        1500,
        'At Risk'
    )
ON CONFLICT (shipment_code) DO NOTHING;


INSERT INTO predictions
    (
        shipment_id,
        delay_probability,
        predicted_delay_days,
        model_name
    )
VALUES
    (1, 87.00, 14, 'XGBoost'),
    (2, 12.00, 2, 'XGBoost'),
    (3, 76.00, 10, 'XGBoost');


INSERT INTO prescriptions
    (
        shipment_id,
        option_name,
        description,
        estimated_cost,
        delivery_days,
        risk_score,
        recommendation_rank
    )
VALUES
    (
        1,
        'Air Freight',
        'Use air freight for faster delivery',
        15000,
        3,
        10,
        1
    ),
    (
        1,
        'Secondary Supplier',
        'Purchase from an alternate supplier',
        16500,
        5,
        20,
        2
    ),
    (
        1,
        'Delay Product Launch',
        'Delay final product launch',
        5000,
        14,
        60,
        3
    );
