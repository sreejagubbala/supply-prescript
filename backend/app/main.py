# ============================================================
# SUPPLY PRESCRIPT
# Member 5 - Closed-Loop & Analytics
# Backend Entry Point
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes.outcomes import router as outcomes_router
from backend.app.routes.roi import router as roi_router


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Supply Prescript - Closed Loop Analytics",
    description=(
        "Closed-Loop Outcome Evaluation, ROI Analysis "
        "and Decision Performance Analytics"
    ),
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "project": "Supply Prescript",
        "module": "Closed-Loop & Analytics",
        "member": "Member 5",
        "status": "running",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "module": "closed-loop-analytics",
    }


# ============================================================
# MEMBER 5 API INFORMATION
# ============================================================

@app.get("/api")
def api_information():
    return {
        "module": "Closed-Loop & Analytics",
        "endpoints": {
            "outcomes": "/api/outcomes",
            "roi": "/api/roi",
        },
        "features": [
            "Decision Outcome Recording",
            "Predicted vs Actual Comparison",
            "Decision Performance Analysis",
            "ROI Calculation",
            "Feedback Data Generation",
            "Closed-Loop Evaluation",
        ],
    }


# ============================================================
# OUTCOME ROUTES
# ============================================================

app.include_router(
    outcomes_router,
    prefix="/api/outcomes",
    tags=["Outcome Evaluation"],
)


# ============================================================
# ROI & ANALYTICS ROUTES
# ============================================================

app.include_router(
    roi_router,
    prefix="/api/roi",
    tags=["ROI & Analytics"],
)


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup_event():

    print("=" * 60)
    print("SUPPLY PRESCRIPT")
    print("MEMBER 5 - CLOSED-LOOP & ANALYTICS")
    print("=" * 60)

    print("Status   : Running")
    print("Module   : Closed-Loop & Analytics")
    print("Outcomes : /api/outcomes")
    print("ROI      : /api/roi")
    print("Docs     : http://127.0.0.1:8000/docs")

    print("=" * 60)


# ============================================================
# SHUTDOWN
# ============================================================

@app.on_event("shutdown")
async def shutdown_event():

    print("=" * 60)
    print("SUPPLY PRESCRIPT CLOSED-LOOP MODULE STOPPED")
    print("=" * 60)


# ============================================================
# RUN DIRECTLY
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )