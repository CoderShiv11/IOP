import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


@pytest.mark.asyncio
async def test_market_summary(client):
    response = await client.get("/api/v1/market/summary")
    assert response.status_code == 200
    data = response.json()
    assert "market_status" in data
    assert "indices" in data
    assert len(data["indices"]) > 0


@pytest.mark.asyncio
async def test_listing_gain_predictor(client):
    payload = {
        "issue_price": 500.0,
        "current_gmp": 150.0,
        "qib_subscription": 25.0,
        "nii_subscription": 12.0,
        "retail_subscription": 4.5,
        "market_sentiment_score": 0.35,
        "pe_ratio": 28.0,
        "industry_pe": 35.0
    }
    response = await client.post("/api/v1/prediction/listing-gain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_listing_price"] > 500.0
    assert data["predicted_gain_pct"] > 0
    assert "risk_level" in data
    assert "recommendation" in data

