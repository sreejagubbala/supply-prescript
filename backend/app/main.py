from fastapi import FastAPI

from .routes import shipments
from .routes import database


app = FastAPI(
    title="SupplyPrescript API",
    description="Backend API for SupplyPrescript",
    version="1.0.0"
)


app.include_router(
    shipments.router
)

app.include_router(
    database.router
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
