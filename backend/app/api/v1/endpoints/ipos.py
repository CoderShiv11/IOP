from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.redis import CacheService
from app.models.ipo import IPOStatus, IPOSeries
from app.schemas.ipo import IPOSummaryResponse, IPODetailResponse, IPOCreate, GMPHistoryResponse
from app.services.ipo_service import ipo_service

router = APIRouter()


@router.get("", response_model=List[IPOSummaryResponse])
async def list_ipos(
    status: Optional[IPOStatus] = Query(None, description="Filter by status: UPCOMING, OPEN, CLOSED, LISTED"),
    series: Optional[IPOSeries] = Query(None, description="Filter by series: MAINBOARD, SME"),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve Indian Stock Market (NSE/BSE) IPOs with real-time GMP,
    latest subscription ratios, and aggregated FinBERT sentiment.
    """
    cache_key = f"ipos:list:{status}:{series}:{limit}:{skip}"
    cached = await CacheService.get(cache_key)
    if cached:
        return cached

    ipos = await ipo_service.get_all_ipos(db, status=status, series=series, limit=limit, skip=skip)
    serialized = [item.model_dump(mode="json") for item in ipos]
    await CacheService.set(cache_key, serialized, ttl_seconds=60)
    return ipos


@router.get("/compare", response_model=List[IPODetailResponse])
async def compare_ipos(
    ids: List[int] = Query(..., description="Comma-separated list of 2–4 IPO IDs to compare"),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare 2–4 IPOs side by side.
    Pass multiple `ids` query params e.g. ?ids=1&ids=2&ids=3
    Returns full detail for each IPO in the requested order.
    """
    if len(ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least 2 IPO IDs for comparison."
        )
    if len(ids) > 4:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Comparison supports at most 4 IPOs at a time."
        )

    ipos = await ipo_service.get_ipos_by_ids(db, ids=ids)
    if not ipos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No IPOs found for the given IDs.")
    return ipos


@router.get("/{ipo_id}/evaluation")
async def get_ipo_evaluation(
    ipo_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Compute a transparent, factor-by-factor IPO evaluation score.

    Returns composite score (0-100), grade (A+ / A / B / C / D),
    recommendation, and per-factor breakdowns for:
    - Financial Health (ROE, ROCE, D/E, Profitability)
    - Valuation (P/E vs Industry, P/B, MCap/Revenue)
    - Growth (Revenue & PAT CAGR over 2 years from history)
    - Risk (Leverage, Operating Cash Flow, Subscription, GMP signal)
    """
    cache_key = f"ipo:evaluation:{ipo_id}"
    cached = await CacheService.get(cache_key)
    if cached:
        return cached

    ipo = await ipo_service.get_ipo_by_id(db, ipo_id=ipo_id)
    if not ipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"IPO with ID {ipo_id} not found."
        )

    evaluation = ipo_service.compute_evaluation(ipo)
    await CacheService.set(cache_key, evaluation, ttl_seconds=300)
    return evaluation


@router.get("/{ipo_id}", response_model=IPODetailResponse)
async def get_ipo_details(
    ipo_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve comprehensive details of an IPO, including day-wise QIB/NII/Retail
    subscription breakdown, historical GMP time series, and fundamentals.
    """
    cache_key = f"ipo:detail:{ipo_id}"
    cached = await CacheService.get(cache_key)
    if cached:
        return cached

    ipo = await ipo_service.get_ipo_by_id(db, ipo_id=ipo_id)
    if not ipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"IPO with ID {ipo_id} not found."
        )

    await CacheService.set(cache_key, ipo.model_dump(mode="json"), ttl_seconds=120)
    return ipo


@router.get("/{ipo_id}/gmp-history", response_model=List[GMPHistoryResponse])
async def get_ipo_gmp_history(
    ipo_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve historical Grey Market Premium (GMP) data points for charting.
    """
    ipo = await ipo_service.get_ipo_by_id(db, ipo_id=ipo_id)
    if not ipo:
        raise HTTPException(status_code=404, detail="IPO not found.")
    return ipo.gmp_history

