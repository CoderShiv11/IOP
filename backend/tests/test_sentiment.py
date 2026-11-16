import pytest


@pytest.mark.asyncio
async def test_finbert_text_analyzer_bullish(client):
    payload = {
        "text": "Bajaj Housing Finance surges 114% on debut with record oversubscription and robust revenue growth.",
        "symbol": "BAJAJHFL"
    }
    response = await client.post("/api/v1/sentiment/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sentiment_label"] == "BULLISH"
    assert data["sentiment_score"] > 0
    assert len(data["key_drivers"]) > 0


@pytest.mark.asyncio
async def test_finbert_text_analyzer_bearish(client):
    payload = {
        "text": "Company reports severe quarterly loss as litigation expenses mount and debt burden slumps margins.",
        "symbol": "TEST"
    }
    response = await client.post("/api/v1/sentiment/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sentiment_label"] == "BEARISH"
    assert data["sentiment_score"] < 0


@pytest.mark.asyncio
async def test_drhp_rag_query(client):
    payload = {
        "ipo_id": 1,
        "query": "What are the objects of the offer and dark store funding?"
    }
    response = await client.post("/api/v1/rag/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["citations"]) > 0
    assert data["confidence"] > 0

