# Optimization configuration

# Available intervention actions
ACTIONS = [
    "Expedite Shipping",
    "Change Shipping Mode",
    "Change Supplier",
    "No Action",
]

# Cost assigned to each intervention
ACTION_COSTS = {
    "Expedite Shipping": 50,
    "Change Shipping Mode": 30,
    "Change Supplier": 40,
    "No Action": 0,
}

# Estimated delay reduction for each action
DELAY_REDUCTION = {
    "Expedite Shipping": 0.30,
    "Change Shipping Mode": 0.20,
    "Change Supplier": 0.15,
    "No Action": 0.00,
}

# Maximum intervention budget
MAX_BUDGET = 100

# Delay probability above which an intervention is considered
MIN_RISK_THRESHOLD = 0.35