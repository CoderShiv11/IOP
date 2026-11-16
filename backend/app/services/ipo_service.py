from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ipo import IPO, IPOSubscription, GMPHistory, IPOStatus
from app.models.sentiment import NewsArticle
from app.schemas.ipo import IPOSummaryResponse, IPODetailResponse, IPOCreate


class IPOService:
    @staticmethod
    async def get_all_ipos(
        db: AsyncSession,
        status: Optional[IPOStatus] = None,
        series: Optional[str] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[IPOSummaryResponse]:
        query = select(IPO).options(
            selectinload(IPO.subscriptions),
            selectinload(IPO.gmp_history),
            selectinload(IPO.news_articles)
        )

        if status:
            query = query.where(IPO.status == status)
        if series:
            query = query.where(IPO.series == series)

        query = query.order_by(desc(IPO.open_date)).offset(skip).limit(limit)
        result = await db.execute(query)
        ipos = result.scalars().all()

        summaries = []
        for item in ipos:
            expected_gain = 0.0
            if item.price_band_high > 0 and item.current_gmp:
                expected_gain = round((item.current_gmp / item.price_band_high) * 100, 2)

            latest_sub = 0.0
            if item.subscriptions:
                latest_sub = item.subscriptions[-1].total_subscription

            # Aggregate sentiment
            sentiment_score = 0.0
            sentiment_label = "NEUTRAL"
            if item.news_articles:
                scores = [n.sentiment_score for n in item.news_articles if n.sentiment_score is not None]
                if scores:
                    sentiment_score = round(sum(scores) / len(scores), 2)
                    if sentiment_score > 0.15:
                        sentiment_label = "BULLISH"
                    elif sentiment_score < -0.15:
                        sentiment_label = "BEARISH"

            summary = IPOSummaryResponse(
                id=item.id,
                company_name=item.company_name,
                symbol=item.symbol,
                series=item.series,
                status=item.status,
                sector=item.sector,
                open_date=item.open_date,
                close_date=item.close_date,
                allotment_date=item.allotment_date,
                listing_date=item.listing_date,
                price_band_low=item.price_band_low,
                price_band_high=item.price_band_high,
                lot_size=item.lot_size,
                issue_size_cr=item.issue_size_cr,
                fresh_issue_cr=item.fresh_issue_cr,
                ofs_cr=item.ofs_cr,
                face_value=item.face_value,
                listing_exchanges=item.listing_exchanges,
                registrar=item.registrar,
                lead_managers=item.lead_managers,
                drhp_url=item.drhp_url,
                rhp_url=item.rhp_url,
                pe_ratio=item.pe_ratio,
                industry_pe=item.industry_pe,
                market_cap_cr=item.market_cap_cr,
                revenue_cr=item.revenue_cr,
                pat_cr=item.pat_cr,
                eps=item.eps,
                roe=item.roe,
                roce=item.roce,
                debt_to_equity=item.debt_to_equity,
                current_gmp=item.current_gmp,
                listing_price=item.listing_price,
                listing_gain_pct=item.listing_gain_pct,
                expected_gain_pct=expected_gain,
                latest_total_subscription=latest_sub,
                sentiment_score=sentiment_score,
                sentiment_label=sentiment_label
            )
            summaries.append(summary)

        return summaries

    @staticmethod
    async def get_ipo_by_id(db: AsyncSession, ipo_id: int) -> Optional[IPODetailResponse]:
        query = select(IPO).options(
            selectinload(IPO.subscriptions),
            selectinload(IPO.gmp_history),
            selectinload(IPO.news_articles)
        ).where(IPO.id == ipo_id)

        result = await db.execute(query)
        item = result.scalar_one_or_none()
        if not item:
            return None

        expected_gain = 0.0
        if item.price_band_high > 0 and item.current_gmp:
            expected_gain = round((item.current_gmp / item.price_band_high) * 100, 2)

        latest_sub = 0.0
        if item.subscriptions:
            latest_sub = item.subscriptions[-1].total_subscription

        sentiment_score = 0.0
        sentiment_label = "NEUTRAL"
        if item.news_articles:
            scores = [n.sentiment_score for n in item.news_articles if n.sentiment_score is not None]
            if scores:
                sentiment_score = round(sum(scores) / len(scores), 2)
                if sentiment_score > 0.15:
                    sentiment_label = "BULLISH"
                elif sentiment_score < -0.15:
                    sentiment_label = "BEARISH"

        return IPODetailResponse(
            id=item.id,
            company_name=item.company_name,
            symbol=item.symbol,
            series=item.series,
            status=item.status,
            sector=item.sector,
            open_date=item.open_date,
            close_date=item.close_date,
            allotment_date=item.allotment_date,
            listing_date=item.listing_date,
            price_band_low=item.price_band_low,
            price_band_high=item.price_band_high,
            lot_size=item.lot_size,
            issue_size_cr=item.issue_size_cr,
            fresh_issue_cr=item.fresh_issue_cr,
            ofs_cr=item.ofs_cr,
            face_value=item.face_value,
            listing_exchanges=item.listing_exchanges,
            registrar=item.registrar,
            lead_managers=item.lead_managers,
            drhp_url=item.drhp_url,
            rhp_url=item.rhp_url,
            pe_ratio=item.pe_ratio,
            industry_pe=item.industry_pe,
            market_cap_cr=item.market_cap_cr,
            revenue_cr=item.revenue_cr,
            pat_cr=item.pat_cr,
            eps=item.eps,
            roe=item.roe,
            roce=item.roce,
            debt_to_equity=item.debt_to_equity,
            current_gmp=item.current_gmp,
            listing_price=item.listing_price,
            listing_gain_pct=item.listing_gain_pct,
            expected_gain_pct=expected_gain,
            latest_total_subscription=latest_sub,
            sentiment_score=sentiment_score,
            sentiment_label=sentiment_label,
            subscriptions=item.subscriptions,
            gmp_history=item.gmp_history,
            created_at=item.created_at,
            updated_at=item.updated_at
        )


ipo_service = IPOService()

