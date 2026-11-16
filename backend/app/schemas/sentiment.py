from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.sentiment import SentimentLabel


class NewsArticleBase(BaseModel):
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None
    source: str
    url: Optional[str] = None
    symbol: Optional[str] = None
    published_at: Optional[datetime] = None


class NewsArticleCreate(NewsArticleBase):
    ipo_id: Optional[int] = None


class NewsArticleResponse(NewsArticleBase):
    id: int
    ipo_id: Optional[int] = None
    sentiment_label: SentimentLabel
    sentiment_score: float
    confidence: float
    positive_prob: float
    negative_prob: float
    neutral_prob: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TextSentimentAnalysisRequest(BaseModel):
    text: str
    symbol: Optional[str] = None


class TextSentimentAnalysisResponse(BaseModel):
    text: str
    symbol: Optional[str] = None
    sentiment_label: SentimentLabel
    sentiment_score: float
    confidence: float
    positive_prob: float
    negative_prob: float
    neutral_prob: float
    key_drivers: List[str] = []


class MarketSentimentOverview(BaseModel):
    nifty_index: float
    nifty_change_pct: float
    sensex_index: float
    sensex_change_pct: float
    market_sentiment_label: SentimentLabel
    sentiment_index: float  # 0 to 100
    bullish_percentage: float
    bearish_percentage: float
    neutral_percentage: float
    total_analyzed: int
    trending_ipo_symbols: List[str] = []

