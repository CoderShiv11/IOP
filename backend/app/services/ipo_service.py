from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.models.ipo import IPO, IPOSubscription, GMPHistory, IPOStatus
from app.models.sentiment import NewsArticle
from app.schemas.ipo import IPOSummaryResponse, IPODetailResponse, IPOCreate


# ─── Helper: build common kwargs from an IPO ORM row ───────────────────────────
def _base_kwargs(item: IPO, expected_gain: float, latest_sub: float,
                 sentiment_score: float, sentiment_label: str) -> dict:
    return dict(
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
        # Extended fields
        ebitda_cr=item.ebitda_cr,
        ebitda_margin_pct=item.ebitda_margin_pct,
        pat_margin_pct=item.pat_margin_pct,
        pb_ratio=item.pb_ratio,
        revenue_history=item.revenue_history,
        pat_history=item.pat_history,
        ebitda_history=item.ebitda_history,
        operating_cashflow_cr=item.operating_cashflow_cr,
        investing_cashflow_cr=item.investing_cashflow_cr,
        financing_cashflow_cr=item.financing_cashflow_cr,
        year_of_incorporation=item.year_of_incorporation,
        headquarters=item.headquarters,
        company_description=item.company_description,
        business_model=item.business_model,
        website=item.website,
        promoter_holding_pct=item.promoter_holding_pct,
        post_ipo_promoter_pct=item.post_ipo_promoter_pct,
        promoter_names=item.promoter_names,
        market_position=item.market_position,
        competitors=item.competitors,
        total_addressable_market_cr=item.total_addressable_market_cr,
        market_share_pct=item.market_share_pct,
        strengths=item.strengths,
        weaknesses=item.weaknesses,
        risks=item.risks,
        objects_of_issue=item.objects_of_issue,
    )


def _compute_meta(item: IPO):
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

    return expected_gain, latest_sub, sentiment_score, sentiment_label


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
            eg, ls, ss, sl = _compute_meta(item)
            summaries.append(IPOSummaryResponse(**_base_kwargs(item, eg, ls, ss, sl)))

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

        eg, ls, ss, sl = _compute_meta(item)
        return IPODetailResponse(
            **_base_kwargs(item, eg, ls, ss, sl),
            subscriptions=item.subscriptions,
            gmp_history=item.gmp_history,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )

    @staticmethod
    async def get_ipos_by_ids(db: AsyncSession, ids: List[int]) -> List[IPODetailResponse]:
        """Fetch multiple IPOs by their IDs with all relationships loaded."""
        query = select(IPO).options(
            selectinload(IPO.subscriptions),
            selectinload(IPO.gmp_history),
            selectinload(IPO.news_articles)
        ).where(IPO.id.in_(ids))

        result = await db.execute(query)
        items = result.scalars().all()

        # Preserve requested order
        item_map = {item.id: item for item in items}
        responses = []
        for ipo_id in ids:
            item = item_map.get(ipo_id)
            if item:
                eg, ls, ss, sl = _compute_meta(item)
                responses.append(IPODetailResponse(
                    **_base_kwargs(item, eg, ls, ss, sl),
                    subscriptions=item.subscriptions,
                    gmp_history=item.gmp_history,
                    created_at=item.created_at,
                    updated_at=item.updated_at,
                ))
        return responses

    @staticmethod
    def compute_evaluation(ipo: IPODetailResponse) -> dict:
        """
        Compute a transparent, factor-by-factor IPO evaluation score.
        Returns a fully explained JSON-serialisable dict.
        """
        breakdown_financial = []
        breakdown_valuation = []
        breakdown_growth = []
        breakdown_risk = []

        # ── Financial Health (0-100) ────────────────────────────────────────
        fh_score = 0

        # ROE
        roe = ipo.roe or 0.0
        if roe > 15:
            pts, detail = 25, f"ROE of {roe:.1f}% is excellent (>15%)"
        elif roe >= 10:
            pts, detail = 15, f"ROE of {roe:.1f}% is adequate (10-15%)"
        else:
            pts, detail = 5, f"ROE of {roe:.1f}% is below par (<10%)"
        fh_score += pts
        breakdown_financial.append({"factor": "ROE", "points": pts, "max_points": 25, "detail": detail})

        # ROCE
        roce = ipo.roce or 0.0
        if roce > 20:
            pts, detail = 25, f"ROCE of {roce:.1f}% is strong (>20%)"
        elif roce >= 15:
            pts, detail = 15, f"ROCE of {roce:.1f}% is moderate (15-20%)"
        else:
            pts, detail = 5, f"ROCE of {roce:.1f}% is weak (<15%)"
        fh_score += pts
        breakdown_financial.append({"factor": "ROCE", "points": pts, "max_points": 25, "detail": detail})

        # D/E — NBFC/HFC exception
        de = ipo.debt_to_equity or 0.0
        sector = (ipo.sector or "").lower()
        is_nbfc = any(k in sector for k in ["nbfc", "housing finance", "hfc", "financ"])
        if de < 0.5:
            pts, detail = 25, f"D/E of {de:.2f} — very low leverage"
        elif de <= 1.0:
            pts, detail = 15, f"D/E of {de:.2f} — moderate leverage"
        elif is_nbfc and de <= 2.0:
            pts, detail = 15, f"D/E of {de:.2f} — acceptable for NBFC/HFC sector"
        else:
            pts, detail = 5, f"D/E of {de:.2f} — high leverage"
        fh_score += pts
        breakdown_financial.append({"factor": "Debt-to-Equity", "points": pts, "max_points": 25, "detail": detail})

        # Profitability (PAT)
        pat = ipo.pat_cr or 0.0
        if pat > 0:
            pts, detail = 25, f"PAT of ₹{pat:.1f} Cr — company is profitable"
        else:
            pts, detail = 0, f"PAT of ₹{pat:.1f} Cr — company is loss-making"
        fh_score += pts
        breakdown_financial.append({"factor": "Profitability (PAT)", "points": pts, "max_points": 25, "detail": detail})

        # ── Valuation (0-100) ──────────────────────────────────────────────
        val_score = 0
        pe = ipo.pe_ratio or 0.0
        ind_pe = ipo.industry_pe or 0.0

        if pe < 0:
            val_score = 10
            breakdown_valuation.append({"factor": "P/E (loss-making)", "points": 10, "max_points": 100,
                                        "detail": f"Negative P/E ({pe:.1f}) — company is not yet profitable"})
        else:
            # P/E vs Industry P/E
            if ind_pe > 0:
                ratio = pe / ind_pe
                if ratio < 0.8:
                    pts = 50
                    detail = f"IPO P/E ({pe:.1f}x) is >20% below industry P/E ({ind_pe:.1f}x) — attractively valued"
                elif ratio <= 1.2:
                    pts = 30
                    detail = f"IPO P/E ({pe:.1f}x) is within ±20% of industry P/E ({ind_pe:.1f}x) — fairly valued"
                else:
                    pts = 10
                    detail = f"IPO P/E ({pe:.1f}x) is >20% above industry P/E ({ind_pe:.1f}x) — premium priced"
            else:
                pts = 20
                detail = "No industry P/E available — neutral score applied"
            val_score += pts
            breakdown_valuation.append({"factor": "P/E vs Industry P/E", "points": pts, "max_points": 50, "detail": detail})

            # P/B
            pb = ipo.pb_ratio or 0.0
            if pb < 2:
                pts, detail = 25, f"P/B of {pb:.1f}x — trading below 2x book, attractive"
            elif pb <= 5:
                pts, detail = 15, f"P/B of {pb:.1f}x — moderate (2-5x book)"
            else:
                pts, detail = 5, f"P/B of {pb:.1f}x — expensive (>5x book)"
            val_score += pts
            breakdown_valuation.append({"factor": "Price-to-Book (P/B)", "points": pts, "max_points": 25, "detail": detail})

            # Market Cap / Revenue
            mcap = ipo.market_cap_cr or 0.0
            rev = ipo.revenue_cr or 1.0
            mc_rev = mcap / rev if rev > 0 else 0
            if mc_rev < 3:
                pts, detail = 25, f"Market Cap/Revenue of {mc_rev:.1f}x — very reasonable"
            elif mc_rev <= 6:
                pts, detail = 15, f"Market Cap/Revenue of {mc_rev:.1f}x — moderate"
            else:
                pts, detail = 5, f"Market Cap/Revenue of {mc_rev:.1f}x — elevated"
            val_score += pts
            breakdown_valuation.append({"factor": "Market Cap / Revenue", "points": pts, "max_points": 25, "detail": detail})

        # ── Growth (0-100) ─────────────────────────────────────────────────
        growth_score = 0
        if not ipo.revenue_history:
            growth_score = 40
            breakdown_growth.append({"factor": "Revenue Growth", "points": 20, "max_points": 50,
                                     "detail": "No historical data — neutral score of 40 applied"})
            breakdown_growth.append({"factor": "PAT Growth", "points": 20, "max_points": 50,
                                     "detail": "No historical data — neutral score of 40 applied"})
        else:
            # Revenue growth
            try:
                rev_hist = json.loads(ipo.revenue_history)
                if len(rev_hist) >= 3:
                    vals = [r.get("value", 0) for r in rev_hist]
                    g1 = ((vals[1] - vals[0]) / abs(vals[0])) * 100 if vals[0] else 0
                    g2 = ((vals[2] - vals[1]) / abs(vals[1])) * 100 if vals[1] else 0
                    avg_rev_growth = (g1 + g2) / 2
                    if avg_rev_growth > 25:
                        pts, detail = 50, f"Avg revenue growth of {avg_rev_growth:.1f}% (last 2Y) — excellent (>25%)"
                    elif avg_rev_growth >= 15:
                        pts, detail = 35, f"Avg revenue growth of {avg_rev_growth:.1f}% — good (15-25%)"
                    elif avg_rev_growth >= 5:
                        pts, detail = 20, f"Avg revenue growth of {avg_rev_growth:.1f}% — moderate (5-15%)"
                    else:
                        pts, detail = 5, f"Avg revenue growth of {avg_rev_growth:.1f}% — slow (<5%)"
                else:
                    pts, detail = 20, "Insufficient revenue history — moderate score"
                    avg_rev_growth = 0
            except Exception:
                pts, detail = 20, "Could not parse revenue history"
            growth_score += pts
            breakdown_growth.append({"factor": "Revenue Growth (2Y avg)", "points": pts, "max_points": 50, "detail": detail})

            # PAT growth
            try:
                pat_hist = json.loads(ipo.pat_history) if ipo.pat_history else []
                if len(pat_hist) >= 3:
                    pvals = [r.get("value", 0) for r in pat_hist]
                    pg1 = ((pvals[1] - pvals[0]) / abs(pvals[0])) * 100 if pvals[0] else 0
                    pg2 = ((pvals[2] - pvals[1]) / abs(pvals[1])) * 100 if pvals[1] else 0
                    avg_pat_growth = (pg1 + pg2) / 2
                    if avg_pat_growth > 30:
                        pts, detail = 50, f"Avg PAT growth of {avg_pat_growth:.1f}% — exceptional (>30%)"
                    elif avg_pat_growth >= 15:
                        pts, detail = 35, f"Avg PAT growth of {avg_pat_growth:.1f}% — solid (15-30%)"
                    elif avg_pat_growth >= 5:
                        pts, detail = 20, f"Avg PAT growth of {avg_pat_growth:.1f}% — moderate (5-15%)"
                    else:
                        pts, detail = 5, f"Avg PAT growth of {avg_pat_growth:.1f}% — slow (<5%)"
                else:
                    pts, detail = 20, "Insufficient PAT history — moderate score"
            except Exception:
                pts, detail = 20, "Could not parse PAT history"
            growth_score += pts
            breakdown_growth.append({"factor": "PAT Growth (2Y avg)", "points": pts, "max_points": 50, "detail": detail})

        # ── Risk (0-100, higher = lower risk) ─────────────────────────────
        risk_score = 0

        de2 = ipo.debt_to_equity or 0.0
        if de2 < 0.5:
            pts, detail = 30, f"D/E of {de2:.2f} — low financial risk"
        elif de2 <= 1.0:
            pts, detail = 20, f"D/E of {de2:.2f} — moderate financial risk"
        else:
            pts, detail = 10, f"D/E of {de2:.2f} — elevated financial risk"
        risk_score += pts
        breakdown_risk.append({"factor": "Leverage (D/E)", "points": pts, "max_points": 30, "detail": detail})

        ocf = ipo.operating_cashflow_cr
        if ocf is not None and ocf > 0:
            pts, detail = 25, f"Operating cash flow of ₹{ocf:.1f} Cr — positive, business generates cash"
        elif ocf is not None:
            pts, detail = 0, f"Negative operating cash flow of ₹{ocf:.1f} Cr — business is cash-consuming"
        else:
            pts, detail = 10, "Operating cash flow data not available — partial score"
        risk_score += pts
        breakdown_risk.append({"factor": "Operating Cash Flow", "points": pts, "max_points": 25, "detail": detail})

        sub_x = ipo.latest_total_subscription or 0.0
        if sub_x > 10:
            pts, detail = 25, f"Subscription of {sub_x:.1f}x — strong institutional/retail demand"
        elif sub_x >= 1:
            pts, detail = 15, f"Subscription of {sub_x:.1f}x — fully subscribed"
        else:
            pts, detail = 5, f"Subscription of {sub_x:.1f}x — under-subscribed"
        risk_score += pts
        breakdown_risk.append({"factor": "Subscription Level", "points": pts, "max_points": 25, "detail": detail})

        gmp_pct = ipo.expected_gain_pct or 0.0
        if gmp_pct > 15:
            pts, detail = 20, f"GMP implies {gmp_pct:.1f}% gain — strong grey market demand"
        elif gmp_pct >= 5:
            pts, detail = 10, f"GMP implies {gmp_pct:.1f}% gain — moderate grey market interest"
        else:
            pts, detail = 5, f"GMP implies {gmp_pct:.1f}% gain — muted grey market"
        risk_score += pts
        breakdown_risk.append({"factor": "GMP Signal", "points": pts, "max_points": 20, "detail": detail})

        # ── Composite ──────────────────────────────────────────────────────
        composite = round(
            fh_score * 0.30 + val_score * 0.25 + growth_score * 0.25 + risk_score * 0.20, 2
        )

        if composite >= 85:
            grade, recommendation = "A+", "Subscribe"
        elif composite >= 70:
            grade, recommendation = "A", "Subscribe for Long Term"
        elif composite >= 55:
            grade, recommendation = "B", "Neutral"
        elif composite >= 40:
            grade, recommendation = "C", "Risky"
        else:
            grade, recommendation = "D", "Avoid"

        # Build key positives & concerns from breakdowns
        all_items = breakdown_financial + breakdown_valuation + breakdown_growth + breakdown_risk
        key_positives = [
            b["detail"] for b in all_items
            if b["points"] >= b["max_points"] * 0.75
        ][:3]
        key_concerns = [
            b["detail"] for b in all_items
            if b["points"] <= b["max_points"] * 0.25
        ][:3]

        summary = (
            f"{ipo.company_name} scores {composite}/100 — Grade {grade}. "
            f"Financial Health: {fh_score}/100 | Valuation: {val_score}/100 | "
            f"Growth: {growth_score}/100 | Risk: {risk_score}/100."
        )

        return {
            "ipo_id": ipo.id,
            "company_name": ipo.company_name,
            "composite_score": composite,
            "grade": grade,
            "recommendation": recommendation,
            "scores": {
                "financial_health": {
                    "score": fh_score, "max": 100, "breakdown": breakdown_financial
                },
                "valuation": {
                    "score": val_score, "max": 100, "breakdown": breakdown_valuation
                },
                "growth": {
                    "score": growth_score, "max": 100, "breakdown": breakdown_growth
                },
                "risk": {
                    "score": risk_score, "max": 100, "breakdown": breakdown_risk
                },
            },
            "summary": summary,
            "key_positives": key_positives,
            "key_concerns": key_concerns,
        }


ipo_service = IPOService()

