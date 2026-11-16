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
    # Serialize for cache
    serialized = [item.model_dump(mode="json") for item in ipos]
    await CacheService.set(cache_key, serialized, ttl_seconds=60)
    return ipos


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

