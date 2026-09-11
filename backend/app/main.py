# ============================================================
# SUPPLY PRESCRIPT
# Backend Entry Point
# ============================================================

from contextlib import asynccontextmanager
from fastapi import FastAPI

from .database import Base, engine

from .routes import shipments
from .routes import database
from .routes import suppliers
from .routes import operations
from .routes import predictions
from .routes import prescriptions
from .routes import decisions
from .routes import outcomes
from .routes import roi

from .models import (
    Shipment,
    Supplier,
    Prediction,
    Prescription,
    Decision,
    Outcome
)

from scripts.seed_database import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Creating database tables...")

    Base.metadata.create_all(
        bind=engine
    )

    seed_database()

    print("Database tables and sample data ready.")

    yield


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app = FastAPI(
    title="SupplyPrescript API",
    description="Backend API for SupplyPrescript",
    version="1.0.0",
    lifespan=lifespan
)


app.include_router(
    shipments.router
)

app.include_router(
    database.router
)

app.include_router(
    suppliers.router
)

app.include_router(
    operations.router
)

app.include_router(
    predictions.router
)

app.include_router(
    prescriptions.router
)

app.include_router(
    decisions.router
)

app.include_router(
    outcomes.router
)

app.include_router(
    roi.router
)


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


# -------------------------
# API Information
# -------------------------

@app.get("/api")
def api_information():
    return {
        "project": "SupplyPrescript",
        "module": "Backend + Closed-Loop Analytics",
        "endpoints": {
            "shipments": "/shipments",
            "database": "/database",
            "suppliers": "/suppliers",
            "operations": "/operations",
            "predictions": "/predictions",
            "decisions": "/decisions",
            "prescriptions": "/prescriptions",
            "outcomes": "/api/outcomes",
            "roi": "/api/roi"
        }
    }