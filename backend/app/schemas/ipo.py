from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.ipo import IPOStatus, IPOSeries


class IPOSubscriptionBase(BaseModel):
    day_number: int
    qib_subscription: float
    nii_subscription: float
    b_nii_subscription: float = 0.0
    s_nii_subscription: float = 0.0
    retail_subscription: float
    employee_subscription: float = 0.0
    total_subscription: float


class IPOSubscriptionCreate(IPOSubscriptionBase):
    ipo_id: int


class IPOSubscriptionResponse(IPOSubscriptionBase):
    id: int
    ipo_id: int
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GMPHistoryBase(BaseModel):
    gmp_in_inr: float
    estimated_listing_price: float
    expected_gain_pct: float
    source: str = "Grey Market Desk"


class GMPHistoryCreate(GMPHistoryBase):
    ipo_id: int


class GMPHistoryResponse(GMPHistoryBase):
    id: int
    ipo_id: int
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IPOBase(BaseModel):
    company_name: str
    symbol: str
    series: IPOSeries = IPOSeries.MAINBOARD
    status: IPOStatus = IPOStatus.UPCOMING
    sector: Optional[str] = None
    open_date: Optional[date] = None
    close_date: Optional[date] = None
    allotment_date: Optional[date] = None
    listing_date: Optional[date] = None
    price_band_low: float
    price_band_high: float
    lot_size: int
    issue_size_cr: float
    fresh_issue_cr: float = 0.0
    ofs_cr: float = 0.0
    face_value: float = 10.0
    listing_exchanges: str = "NSE, BSE"
    registrar: Optional[str] = None
    lead_managers: Optional[str] = None
    drhp_url: Optional[str] = None
    rhp_url: Optional[str] = None
    pe_ratio: Optional[float] = None
    industry_pe: Optional[float] = None
    market_cap_cr: Optional[float] = None
    revenue_cr: Optional[float] = None
    pat_cr: Optional[float] = None
    eps: Optional[float] = None
    roe: Optional[float] = None
    roce: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_gmp: float = 0.0


class IPOCreate(IPOBase):
    pass


class IPOUpdate(BaseModel):
    status: Optional[IPOStatus] = None
    current_gmp: Optional[float] = None
    listing_price: Optional[float] = None
    listing_gain_pct: Optional[float] = None


class IPOSummaryResponse(IPOBase):
    id: int
    listing_price: Optional[float] = None
    listing_gain_pct: Optional[float] = None
    expected_gain_pct: float = 0.0
    latest_total_subscription: float = 0.0
    sentiment_score: Optional[float] = 0.0
    sentiment_label: Optional[str] = "NEUTRAL"

    model_config = ConfigDict(from_attributes=True)


class IPODetailResponse(IPOSummaryResponse):
    subscriptions: List[IPOSubscriptionResponse] = []
    gmp_history: List[GMPHistoryResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

