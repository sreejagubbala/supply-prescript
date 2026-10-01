from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    Outcome,
)


# ============================================================
# APPLICATION LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("=" * 60)
    print("SUPPLY PRESCRIPT BACKEND")
    print("=" * 60)

    print("Creating database tables...")

    Base.metadata.create_all(
        bind=engine
    )

    print("Database tables ready.")
    print("=" * 60)

    # IMPORTANT:
    # DO NOT call seed_database() here.
    #
    # Seeding here would delete Decisions and Outcomes
    # every time FastAPI restarts.

    yield

    print("SupplyPrescript backend shutting down...")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="SupplyPrescript API",
    description=(
        "Backend API for SupplyPrescript"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

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


# ============================================================
# DECISIONS
# ============================================================

app.include_router(
    decisions.router,
    prefix="/api/decisions",
)


# ============================================================
# OUTCOMES
# ============================================================

app.include_router(
    outcomes.router,
    prefix="/api/outcomes",
)


# ============================================================
# ROI
# ============================================================

app.include_router(
    roi.router,
    prefix="/api/roi",
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message":
            "SupplyPrescript Backend is running"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# API INFORMATION
# ============================================================

@app.get("/api")
def api_information():

    return {

        "project":
            "SupplyPrescript",

        "module":
            "Backend + Closed-Loop Analytics",

        "endpoints": {

            "shipments":
                "/shipments",

            "database":
                "/database",

            "suppliers":
                "/suppliers",

            "operations":
                "/operations",

            "predictions":
                "/predictions",

            "prescriptions":
                "/prescriptions",

            "decisions":
                "/api/decisions",

            "outcomes":
                "/api/outcomes",

            "decision_history":
                "/api/outcomes/history",

            "roi":
                "/api/roi",
        },
    }