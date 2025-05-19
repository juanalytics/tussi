from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Products API"}

# Add more tests for product CRUD operations here later
# For example:
# def test_create_product():
#     response = client.post("/products/", json={"name": "Test Product", "price": 9.99, "stock": 100})
#     assert response.status_code == 200 # or 201 if you prefer
#     data = response.json()
#     assert data["name"] == "Test Product"
#     assert "id" in data

# def test_read_products():
#     response = client.get("/products/")
#     assert response.status_code == 200
#     assert isinstance(response.json(), list) 