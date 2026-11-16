import pytest


@pytest.mark.asyncio
async def test_register_user(client):
    payload = {
        "email": "newuser@test.com",
        "username": "newuser",
        "password": "Password@123",
        "full_name": "Test User"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "newuser@test.com"
    assert data["user"]["username"] == "newuser"


@pytest.mark.asyncio
async def test_login_user(client):
    # Register first
    await client.post("/api/v1/auth/register", json={
        "email": "loginuser@test.com",
        "username": "loginuser",
        "password": "Password@123",
        "full_name": "Login User"
    })
    
    # Login
    response = await client.post("/api/v1/auth/login", json={
        "email": "loginuser@test.com",
        "password": "Password@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["username"] == "loginuser"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@test.com",
        "password": "WrongPassword"
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_profile_unauthorized(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_dashboard_stats(client):
    response = await client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_ipos" in data
    assert "market_overview" in data
    assert "sentiment_summary" in data
    assert "notifications" in data
