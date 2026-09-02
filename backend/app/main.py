from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import shipments


app = FastAPI(
    title="SupplyPrescript API",
    description="Backend API for SupplyPrescript",
    version="1.0.0"
)


# -------------------------
# CORS Configuration
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Routers
# -------------------------

app.include_router(
    shipments.router
)


# -------------------------
# Sample Operations Summary
# -------------------------

@app.get("/api/operations/summary")
def get_operations_summary():

    return {
        "totalShipments": 128,
        "onTimeCount": 96,
        "delayedCount": 32,
        "trendData": [
            {
                "day": "Mon",
                "delays": 4
            },
            {
                "day": "Tue",
                "delays": 6
            },
            {
                "day": "Wed",
                "delays": 3
            },
            {
                "day": "Thu",
                "delays": 7
            },
            {
                "day": "Fri",
                "delays": 5
            },
            {
                "day": "Sat",
                "delays": 4
            },
            {
                "day": "Sun",
                "delays": 3
            }
        ]
    }


# -------------------------
# Root
# -------------------------

@app.get("/")
def root():

    return {
        "message": "SupplyPrescript Backend is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }
