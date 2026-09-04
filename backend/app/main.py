from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import shipments
from .routes import database
from .routes import suppliers


app = FastAPI(
    title="SupplyPrescript API",
    description="Backend API for SupplyPrescript",
    version="1.0.0"
)


# -------------------------
# CORS Configuration
# -------------------------

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# -------------------------
# API Routes
# -------------------------

app.include_router(
    shipments.router
)

app.include_router(
    database.router
)

app.include_router(
    suppliers.router
)


# -------------------------
# Root Endpoint
# -------------------------

@app.get("/")
def root():

    return {
        "message": "SupplyPrescript Backend is running"
    }


# -------------------------
# Health Endpoint
# -------------------------

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }
