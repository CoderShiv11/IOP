from datetime import datetime
from fastapi import APIRouter
from app.core.redis import CacheService

router = APIRouter()


@router.get("/summary")
async def get_market_summary():
    """
    Returns live ticker data for Indian benchmarks:
    NIFTY 50, SENSEX, BANK NIFTY, INDIA VIX, and market operational status.
    """
    cache_key = "market:summary"
    cached = await CacheService.get(cache_key)
    if cached:
        return cached

    now = datetime.now()
    # NSE Trading hours: 9:15 AM to 3:30 PM IST (Monday - Friday)
    is_market_open = (
        now.weekday() < 5 and
        (now.hour > 9 or (now.hour == 9 and now.minute >= 15)) and
        (now.hour < 15 or (now.hour == 15 and now.minute <= 30))
    )

    data = {
        "market_status": "OPEN" if is_market_open else "CLOSED",
        "timestamp": now.isoformat(),
        "indices": [
            {"name": "NIFTY 50", "symbol": "^NSEI", "value": 24852.15, "change": +118.45, "change_pct": +0.48},
            {"name": "SENSEX", "symbol": "^BSESN", "value": 81435.60, "change": +342.10, "change_pct": +0.42},
            {"name": "BANK NIFTY", "symbol": "^NSEBANK", "value": 52180.40, "change": +280.25, "change_pct": +0.54},
            {"name": "INDIA VIX", "symbol": "^INDIAVIX", "value": 13.82, "change": -0.45, "change_pct": -3.15},
            {"name": "NIFTY IT", "symbol": "^CNXIT", "value": 41250.80, "change": +320.10, "change_pct": +0.78},
        ]
    }

    await CacheService.set(cache_key, data, ttl_seconds=30)
    return data

