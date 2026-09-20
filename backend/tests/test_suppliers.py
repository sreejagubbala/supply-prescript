from backend.app.main import app


def test_supplier_list_api_exists():

    routes = [
        route.path
        for route in app.routes
    ]

    assert "/api/suppliers/" in routes


def test_supplier_detail_api_exists():

    routes = [
        route.path
        for route in app.routes
    ]

    assert "/api/suppliers/{supplier_id}" in routes
