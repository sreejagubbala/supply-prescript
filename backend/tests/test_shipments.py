from backend.app.main import app


def test_shipments_api_exists():

    routes = [
        route.path
        for route in app.routes
    ]

    assert "/api/shipments/" in routes
