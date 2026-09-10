CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    reliability_score DECIMAL(5,2),
    location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    shipment_code VARCHAR(100) UNIQUE NOT NULL,
    product VARCHAR(150) NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    quantity INTEGER NOT NULL,
    historical_lead_time DECIMAL(10,2),
    current_lead_time DECIMAL(10,2),
    inventory_level DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL
        REFERENCES shipments(id)
        ON DELETE CASCADE,
    delay_probability DECIMAL(5,2),
    predicted_delay_days DECIMAL(10,2),
    model_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL
        REFERENCES shipments(id)
        ON DELETE CASCADE,
    option_name VARCHAR(150) NOT NULL,
    description TEXT,
    estimated_cost DECIMAL(12,2),
    delivery_days DECIMAL(10,2),
    risk_score DECIMAL(5,2),
    recommendation_rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS decisions (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL
        REFERENCES shipments(id),
    prescription_id INTEGER NOT NULL
        REFERENCES prescriptions(id),
    selected_option VARCHAR(150) NOT NULL,
    estimated_cost DECIMAL(12,2),
    user_name VARCHAR(150),
    decision_status VARCHAR(50) DEFAULT 'Executed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS outcomes (
    id SERIAL PRIMARY KEY,
    decision_id INTEGER NOT NULL
        REFERENCES decisions(id),
    actual_cost DECIMAL(12,2),
    actual_delivery_days DECIMAL(10,2),
    outcome_status VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
