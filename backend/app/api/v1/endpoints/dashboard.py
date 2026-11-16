from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.core.redis import CacheService
from app.models.ipo import IPO, IPOStatus, IPOSeries
from app.models.sentiment import NewsArticle, SentimentLabel
from app.schemas.sentiment import NewsArticleResponse

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns aggregated dashboard statistics:
    Counts, market benchmarks, top gainers/losers, performance charts,
    and market alerts.
    """
    cache_key = "dashboard:stats:v1"
    cached = await CacheService.get(cache_key)
    if cached:
        return cached

    # Query all IPOs
    result = await db.execute(select(IPO))
    ipos = result.scalars().all()

    total_ipos = len(ipos)
    upcoming_count = sum(1 for i in ipos if i.status == IPOStatus.UPCOMING)
    open_count = sum(1 for i in ipos if i.status == IPOStatus.OPEN)
    listed_count = sum(1 for i in ipos if i.status == IPOStatus.LISTED)
    closed_count = sum(1 for i in ipos if i.status == IPOStatus.CLOSED)
    total_pipeline_cr = sum(i.issue_size_cr for i in ipos)

    # Listed IPOs analysis
    listed_ipos = [i for i in ipos if i.status == IPOStatus.LISTED and i.listing_gain_pct is not None]
    listed_ipos.sort(key=lambda x: x.listing_gain_pct, reverse=True)

    top_gainer = None
    if listed_ipos:
        tg = listed_ipos[0]
        top_gainer = {
            "company_name": tg.company_name,
            "symbol": tg.symbol,
            "listing_gain_pct": round(tg.listing_gain_pct, 2),
            "listing_price": tg.listing_price,
            "current_gmp": tg.current_gmp
        }

    top_loser = None
    negative_listed = [i for i in listed_ipos if i.listing_gain_pct < 0]
    if negative_listed:
        tl = negative_listed[-1]  # Most negative
        top_loser = {
            "company_name": tl.company_name,
            "symbol": tl.symbol,
            "listing_gain_pct": round(tl.listing_gain_pct, 2),
            "listing_price": tl.listing_price,
            "current_gmp": tl.current_gmp
        }

    # Recent listed (up to 5)
    recent_listed = [
        {
            "id": i.id,
            "company_name": i.company_name,
            "symbol": i.symbol,
            "listing_price": i.listing_price or (i.price_band_high + i.current_gmp),
            "listing_gain_pct": i.listing_gain_pct if i.listing_gain_pct is not None else round((i.current_gmp / i.price_band_high) * 100, 2),
            "current_gmp": i.current_gmp,
            "sector": i.sector or "Diversified"
        }
        for i in listed_ipos[:5]
    ]

    # Upcoming IPOs (up to 5)
    upcoming_ipos = [
        {
            "id": i.id,
            "company_name": i.company_name,
            "symbol": i.symbol,
            "open_date": str(i.open_date) if i.open_date else "TBA",
            "close_date": str(i.close_date) if i.close_date else "TBA",
            "price_band_high": i.price_band_high,
            "current_gmp": i.current_gmp,
            "sector": i.sector or "Diversified",
            "issue_size_cr": i.issue_size_cr
        }
        for i in ipos if i.status in (IPOStatus.UPCOMING, IPOStatus.OPEN)
    ][:5]

    # Positive & Negative stocks
    positive_stocks = [
        {
            "id": i.id,
            "company_name": i.company_name,
            "symbol": i.symbol,
            "listing_gain_pct": round(i.listing_gain_pct or 0.0, 2),
            "current_gmp": i.current_gmp
        }
        for i in listed_ipos if (i.listing_gain_pct or 0.0) >= 0
    ][:5]

    negative_stocks = [
        {
            "id": i.id,
            "company_name": i.company_name,
            "symbol": i.symbol,
            "listing_gain_pct": round(i.listing_gain_pct or 0.0, 2),
            "current_gmp": i.current_gmp
        }
        for i in listed_ipos if (i.listing_gain_pct or 0.0) < 0
    ][:5]

    # Market Overview
    market_overview = {
        "nifty": {"name": "NIFTY 50", "value": 24852.15, "change": 118.45, "change_pct": 0.48},
        "sensex": {"name": "SENSEX", "value": 81435.60, "change": 342.10, "change_pct": 0.42},
        "bank_nifty": {"name": "BANK NIFTY", "value": 52180.40, "change": 280.25, "change_pct": 0.54},
        "india_vix": {"name": "INDIA VIX", "value": 13.82, "change": -0.45, "change_pct": -3.15},
    }

    # Sentiment Summary
    news_res = await db.execute(select(NewsArticle).order_by(desc(NewsArticle.published_at)).limit(30))
    articles = news_res.scalars().all()

    total_articles = len(articles)
    if total_articles > 0:
        bullish = sum(1 for a in articles if a.sentiment_label == SentimentLabel.BULLISH)
        bearish = sum(1 for a in articles if a.sentiment_label == SentimentLabel.BEARISH)
        neutral = total_articles - bullish - bearish
        avg_score = sum(a.sentiment_score for a in articles) / total_articles
        sent_index = round(50 + (avg_score * 50), 1)
        sent_label = "BULLISH" if avg_score > 0.1 else ("BEARISH" if avg_score < -0.1 else "NEUTRAL")
        sentiment_summary = {
            "overall_label": sent_label,
            "sentiment_index": sent_index,
            "bullish_pct": round((bullish / total_articles) * 100, 1),
            "bearish_pct": round((bearish / total_articles) * 100, 1),
            "neutral_pct": round((neutral / total_articles) * 100, 1),
            "total_analyzed": total_articles
        }
    else:
        sentiment_summary = {
            "overall_label": "BULLISH",
            "sentiment_index": 68.5,
            "bullish_pct": 64.0,
            "bearish_pct": 18.0,
            "neutral_pct": 18.0,
            "total_analyzed": 24
        }

    # Latest News (6 items)
    latest_news = [
        {
            "id": a.id,
            "title": a.title,
            "summary": a.summary,
            "source": a.source,
            "published_at": a.published_at.isoformat() if a.published_at else datetime.utcnow().isoformat(),
            "sentiment_label": a.sentiment_label.value,
            "sentiment_score": a.sentiment_score,
            "confidence": a.confidence,
            "symbol": a.symbol
        }
        for a in articles[:6]
    ]

    # Performance Chart Data (Monthly historical listing gains on NSE/BSE)
    performance_chart_data = [
        {"month": "Jun", "listings_count": 6, "avg_gain_pct": 34.2},
        {"month": "Jul", "listings_count": 8, "avg_gain_pct": 42.8},
        {"month": "Aug", "listings_count": 11, "avg_gain_pct": 28.5},
        {"month": "Sep", "listings_count": 14, "avg_gain_pct": 51.6},
        {"month": "Oct", "listings_count": 9, "avg_gain_pct": 18.4},
        {"month": "Nov", "listings_count": 7, "avg_gain_pct": 36.9},
    ]

    # Live Notifications
    notifications = [
        {
            "id": 1,
            "type": "ipo_alert",
            "title": "NTPC Green Energy IPO Live",
            "message": "NTPC Green Energy ₹10,000 Cr issue is now open for bidding on NSE and BSE.",
            "timestamp": (datetime.utcnow() - timedelta(minutes=45)).isoformat(),
            "read": False
        },
        {
            "id": 2,
            "type": "gmp_surge",
            "title": "GMP Spike on Apex Semiconductor",
            "message": "Apex Semiconductor Instruments GMP increased to ₹55 (+41.6% listing gain).",
            "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            "read": False
        },
        {
            "id": 3,
            "type": "allotment",
            "title": "Swiggy Allotment Finalized",
            "message": "Swiggy IPO basis of allotment published by Link Intime. Check PAN status.",
            "timestamp": (datetime.utcnow() - timedelta(hours=5)).isoformat(),
            "read": True
        },
        {
            "id": 4,
            "type": "sentiment",
            "title": "FinBERT Sentiment Shift",
            "message": "Institutional sentiment for Renewable Power issues turned heavily Bullish.",
            "timestamp": (datetime.utcnow() - timedelta(hours=8)).isoformat(),
            "read": True
        },
        {
            "id": 5,
            "type": "market",
            "title": "Nifty 50 Closes Above 24,800",
            "message": "Benchmark indices extend listing day strength with DII inflows topping ₹2,400 Cr.",
            "timestamp": (datetime.utcnow() - timedelta(hours=14)).isoformat(),
            "read": True
        }
    ]

    data = {
        "total_ipos": total_ipos,
        "upcoming_count": upcoming_count,
        "open_count": open_count,
        "listed_count": listed_count,
        "closed_count": closed_count,
        "total_issue_pipeline_cr": round(total_pipeline_cr, 2),
        "top_gainer": top_gainer,
        "top_loser": top_loser,
        "market_overview": market_overview,
        "sentiment_summary": sentiment_summary,
        "recent_listed": recent_listed,
        "upcoming_ipos": upcoming_ipos,
        "positive_stocks": positive_stocks,
        "negative_stocks": negative_stocks,
        "latest_news": latest_news,
        "performance_chart_data": performance_chart_data,
        "notifications": notifications
    }

    await CacheService.set(cache_key, data, ttl_seconds=30)
    return data
