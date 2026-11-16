from typing import List, Optional
from pydantic import BaseModel, Field


class ListingGainPredictionRequest(BaseModel):
    ipo_id: Optional[int] = None
    issue_price: float = Field(..., gt=0, description="Upper price band or issue price in INR")
    current_gmp: float = Field(..., ge=0, description="Grey market premium in INR")
    qib_subscription: float = Field(..., ge=0, description="QIB subscription times, e.g. 15.2")
    nii_subscription: float = Field(..., ge=0, description="NII/HNI subscription times, e.g. 8.5")
    retail_subscription: float = Field(..., ge=0, description="Retail subscription times, e.g. 3.2")
    market_sentiment_score: float = Field(0.2, ge=-1.0, le=1.0, description="FinBERT sentiment score -1 to +1")
    pe_ratio: Optional[float] = Field(None, description="P/E of the IPO")
    industry_pe: Optional[float] = Field(None, description="Benchmark industry P/E")


class ListingGainPredictionResponse(BaseModel):
    predicted_listing_price: float
    predicted_gain_pct: float
    predicted_price_low: float
    predicted_price_high: float
    confidence_interval_pct: float
    success_probability: float  # Chance of positive listing (> 0% gain)
    risk_level: str             # "LOW", "MODERATE", "HIGH", "EXTREME"
    feature_importance: List[dict]
    recommendation: str         # "APPLY FOR LISTING GAIN", "APPLY FOR LONG TERM", "AVOID"

