from fastapi import APIRouter


router = APIRouter(
    prefix="/api/shipments",
    tags=["Shipments"]
)


# Sample shipment data
sample_shipments = [
    {
        "id": "SHP-001",
        "origin": "Chennai",
        "destination": "Bengaluru",
        "status": "On-Time",
        "eta": "2026-08-28",
        "riskScore": 12
    },
    {
        "id": "SHP-002",
        "origin": "Mumbai",
        "destination": "Delhi",
        "status": "Delayed",
        "eta": "2026-08-30",
        "riskScore": 78
    },
    {
        "id": "SHP-003",
        "origin": "Hyderabad",
        "destination": "Pune",
        "status": "On-Time",
        "eta": "2026-08-29",
        "riskScore": 18
    },
    {
        "id": "SHP-004",
        "origin": "Kolkata",
        "destination": "Chennai",
        "status": "Delayed",
        "eta": "2026-08-31",
        "riskScore": 65
    },
    {
        "id": "SHP-005",
        "origin": "Delhi",
        "destination": "Jaipur",
        "status": "On-Time",
        "eta": "2026-08-28",
        "riskScore": 9
    }
]


@router.get("/")
def get_shipments():

    return sample_shipments
