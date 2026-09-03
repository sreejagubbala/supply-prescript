from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------
# SHIPPING OPTIONS
# --------------------------------------------------

SHIPPING_MODES = [
    "Same Day",
    "First Class",
    "Second Class",
    "Standard Class",
]

# --------------------------------------------------
# BASE COSTS
# --------------------------------------------------

SHIPPING_COST = {
    "Same Day": 80.0,
    "First Class": 50.0,
    "Second Class": 30.0,
    "Standard Class": 20.0,
}

# --------------------------------------------------
# EXPECTED SHIPPING DAYS
# --------------------------------------------------

SHIPPING_DAYS = {
    "Same Day": 1.0,
    "First Class": 2.0,
    "Second Class": 3.0,
    "Standard Class": 4.0,
}

# --------------------------------------------------
# DELAY PENALTY
# --------------------------------------------------

DELAY_PENALTY = 25.0

# --------------------------------------------------
# MAXIMUM ALLOWED COST
# --------------------------------------------------

DEFAULT_BUDGET = 60.0