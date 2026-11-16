import asyncio
from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.ipo import IPO, IPOSubscription, GMPHistory, IPOStatus, IPOSeries
from app.models.sentiment import NewsArticle, SentimentLabel
from app.models.rag import ProspectusChunk
from app.models.user import User, UserRole
from app.services.finbert_service import finbert_service


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if already seeded IPOs
        result = await session.execute(select(IPO).limit(1))
        existing_ipo = result.scalar_one_or_none()
        
        # Check and seed default users
        user_check = await session.execute(select(User).limit(1))
        existing_user = user_check.scalar_one_or_none()
        if not existing_user:
            admin_user = User(
                email="admin@ipoanalyzer.in",
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash("Admin@123456"),
                role=UserRole.ADMIN,
                is_active=True,
                is_superuser=True,
                bio="Platform administrator for Indian equity capital markets analytics."
            )
            demo_user = User(
                email="demo@ipoanalyzer.in",
                username="demouser",
                full_name="Demo Investor",
                hashed_password=get_password_hash("Demo@123456"),
                role=UserRole.USER,
                is_active=True,
                bio="Retail equity investor tracking NSE/BSE Mainboard and SME public issues."
            )
            analyst_user = User(
                email="analyst@ipoanalyzer.in",
                username="analyst",
                full_name="SEBI Research Analyst",
                hashed_password=get_password_hash("Analyst@123456"),
                role=UserRole.ANALYST,
                is_active=True,
                bio="Chartered Financial Analyst tracking DRHP valuation disclosures and GMP momentum."
            )
            session.add_all([admin_user, demo_user, analyst_user])
            await session.commit()

        if existing_ipo:
            return

        today = date.today()

        # Seed IPOs
        ipos_data = [
            {
                "company_name": "Swiggy Limited",
                "symbol": "SWIGGY",
                "series": IPOSeries.MAINBOARD,
                "status": IPOStatus.LISTED,
                "sector": "Consumer Tech / Quick Commerce",
                "open_date": today - timedelta(days=12),
                "close_date": today - timedelta(days=9),
                "allotment_date": today - timedelta(days=7),
                "listing_date": today - timedelta(days=5),
                "price_band_low": 371.0,
                "price_band_high": 390.0,
                "issue_price": 390.0,
                "lot_size": 38,
                "issue_size_cr": 11327.43,
                "fresh_issue_cr": 4499.00,
                "ofs_cr": 6828.43,
                "face_value": 1.0,
                "listing_exchanges": "NSE, BSE",
                "registrar": "Link Intime India Pvt Ltd",
                "lead_managers": "Kotak Mahindra Capital, Citigroup, Jefferies, Avendus",
                "drhp_url": "https://www.sebi.gov.in/filings/public-issues/swiggy-drhp.pdf",
                "pe_ratio": -38.5,
                "industry_pe": 45.0,
                "market_cap_cr": 87500.0,
                "revenue_cr": 11247.0,
                "pat_cr": -2350.0,
                "eps": -10.4,
                "roe": -18.2,
                "roce": -14.6,
                "debt_to_equity": 0.12,
                "current_gmp": 25.0,
                "listing_price": 420.0,
                "listing_gain_pct": 7.69,
                "subs": [
                    {"day": 1, "qib": 0.08, "nii": 0.14, "retail": 0.54, "total": 0.25},
                    {"day": 2, "qib": 0.42, "nii": 0.60, "retail": 1.15, "total": 0.72},
                    {"day": 3, "qib": 6.02, "nii": 4.14, "retail": 3.15, "total": 3.59},
                ],
                "gmp_trend": [
                    {"days_ago": 6, "gmp": 12.0, "est": 402.0, "gain": 3.08},
                    {"days_ago": 4, "gmp": 18.0, "est": 408.0, "gain": 4.62},
                    {"days_ago": 2, "gmp": 25.0, "est": 415.0, "gain": 6.41},
                ]
            },
            {
                "company_name": "Hyundai Motor India Limited",
                "symbol": "HYUNDAI",
                "series": IPOSeries.MAINBOARD,
                "status": IPOStatus.LISTED,
                "sector": "Automobile / Passenger Vehicles",
                "open_date": today - timedelta(days=25),
                "close_date": today - timedelta(days=22),
                "allotment_date": today - timedelta(days=20),
                "listing_date": today - timedelta(days=18),
                "price_band_low": 1865.0,
                "price_band_high": 1960.0,
                "issue_price": 1960.0,
                "lot_size": 7,
                "issue_size_cr": 27870.16,
                "fresh_issue_cr": 0.0,
                "ofs_cr": 27870.16,
                "face_value": 10.0,
                "listing_exchanges": "NSE, BSE",
                "registrar": "KFin Technologies Limited",
                "lead_managers": "Kotak, Morgan Stanley, JP Morgan, HSBC, Citigroup",
                "drhp_url": "https://www.sebi.gov.in/filings/public-issues/hyundai-drhp.pdf",
                "pe_ratio": 26.28,
                "industry_pe": 29.50,
                "market_cap_cr": 159258.0,
                "revenue_cr": 69829.0,
                "pat_cr": 6060.0,
                "eps": 74.58,
                "roe": 54.2,
                "roce": 61.8,
                "debt_to_equity": 0.05,
                "current_gmp": -15.0,
                "listing_price": 1934.0,
                "listing_gain_pct": -1.33,
                "subs": [
                    {"day": 1, "qib": 0.05, "nii": 0.13, "retail": 0.26, "total": 0.18},
                    {"day": 2, "qib": 0.58, "nii": 0.35, "retail": 0.38, "total": 0.42},
                    {"day": 3, "qib": 6.97, "nii": 0.60, "retail": 0.50, "total": 2.37},
                ],
                "gmp_trend": [
                    {"days_ago": 10, "gmp": 65.0, "est": 2025.0, "gain": 3.32},
                    {"days_ago": 6, "gmp": 15.0, "est": 1975.0, "gain": 0.77},
                    {"days_ago": 2, "gmp": -15.0, "est": 1945.0, "gain": -0.77},
                ]
            },
            {
                "company_name": "Bajaj Housing Finance Limited",
                "symbol": "BAJAJHFL",
                "series": IPOSeries.MAINBOARD,
                "status": IPOStatus.LISTED,
                "sector": "Financials / Housing Finance",
                "open_date": today - timedelta(days=60),
                "close_date": today - timedelta(days=57),
                "allotment_date": today - timedelta(days=55),
                "listing_date": today - timedelta(days=53),
                "price_band_low": 66.0,
                "price_band_high": 70.0,
                "issue_price": 70.0,
                "lot_size": 214,
                "issue_size_cr": 6560.00,
                "fresh_issue_cr": 3560.00,
                "ofs_cr": 3000.00,
                "face_value": 10.0,
                "listing_exchanges": "NSE, BSE",
                "registrar": "KFin Technologies Limited",
                "lead_managers": "Kotak, BofA Securities, Axis Capital, Goldman Sachs, SBI Capital",
                "drhp_url": "https://www.sebi.gov.in/filings/public-issues/bajajhfl-drhp.pdf",
                "pe_ratio": 29.8,
                "industry_pe": 24.5,
                "market_cap_cr": 58297.0,
                "revenue_cr": 7617.7,
                "pat_cr": 1731.2,
                "eps": 2.35,
                "roe": 15.2,
                "roce": 12.8,
                "debt_to_equity": 6.1,
                "current_gmp": 82.0,
                "listing_price": 150.0,
                "listing_gain_pct": 114.29,
                "subs": [
                    {"day": 1, "qib": 1.51, "nii": 4.35, "retail": 1.50, "total": 2.02},
                    {"day": 2, "qib": 7.46, "nii": 16.45, "retail": 3.84, "total": 7.51},
                    {"day": 3, "qib": 209.36, "nii": 41.51, "retail": 7.41, "total": 67.43},
                ],
                "gmp_trend": [
                    {"days_ago": 15, "gmp": 45.0, "est": 115.0, "gain": 64.29},
                    {"days_ago": 10, "gmp": 68.0, "est": 138.0, "gain": 97.14},
                    {"days_ago": 5, "gmp": 82.0, "est": 152.0, "gain": 117.14},
                ]
            },
            {
                "company_name": "NTPC Green Energy Limited",
                "symbol": "NTPCGREEN",
                "series": IPOSeries.MAINBOARD,
                "status": IPOStatus.OPEN,
                "sector": "Renewable Power & Clean Utilities",
                "open_date": today - timedelta(days=1),
                "close_date": today + timedelta(days=2),
                "allotment_date": today + timedelta(days=5),
                "listing_date": today + timedelta(days=8),
                "price_band_low": 102.0,
                "price_band_high": 108.0,
                "issue_price": 108.0,
                "lot_size": 138,
                "issue_size_cr": 10000.00,
                "fresh_issue_cr": 10000.00,
                "ofs_cr": 0.0,
                "face_value": 10.0,
                "listing_exchanges": "NSE, BSE",
                "registrar": "KFin Technologies Limited",
                "lead_managers": "IDBI Capital, HDFC Bank, IIFL Securities, Nuvama",
                "drhp_url": "https://www.sebi.gov.in/filings/public-issues/ntpcgreen-drhp.pdf",
                "pe_ratio": 95.4,
                "industry_pe": 62.0,
                "market_cap_cr": 91000.0,
                "revenue_cr": 2037.0,
                "pat_cr": 344.7,
                "eps": 1.13,
                "roe": 5.4,
                "roce": 6.8,
                "debt_to_equity": 1.85,
                "current_gmp": 3.5,
                "listing_price": None,
                "listing_gain_pct": None,
                "subs": [
                    {"day": 1, "qib": 0.00, "nii": 0.16, "retail": 1.33, "total": 0.33},
                ],
                "gmp_trend": [
                    {"days_ago": 3, "gmp": 10.0, "est": 118.0, "gain": 9.26},
                    {"days_ago": 2, "gmp": 6.0, "est": 114.0, "gain": 5.56},
                    {"days_ago": 0, "gmp": 3.5, "est": 111.5, "gain": 3.24},
                ]
            },
            {
                "company_name": "Tata Technologies Limited",
                "symbol": "TATATECH",
                "series": IPOSeries.MAINBOARD,
                "status": IPOStatus.LISTED,
                "sector": "Information Technology / ER&D",
                "open_date": today - timedelta(days=300),
                "close_date": today - timedelta(days=297),
                "allotment_date": today - timedelta(days=295),
                "listing_date": today - timedelta(days=293),
                "price_band_low": 475.0,
                "price_band_high": 500.0,
                "issue_price": 500.0,
                "lot_size": 30,
                "issue_size_cr": 3042.51,
                "fresh_issue_cr": 0.0,
                "ofs_cr": 3042.51,
                "face_value": 2.0,
                "listing_exchanges": "NSE, BSE",
                "registrar": "Link Intime India Pvt Ltd",
                "lead_managers": "JM Financial, Citigroup, BofA",
                "drhp_url": "https://www.sebi.gov.in/filings/public-issues/tatatech-drhp.pdf",
                "pe_ratio": 32.5,
                "industry_pe": 65.0,
                "market_cap_cr": 41800.0,
                "revenue_cr": 4414.0,
                "pat_cr": 624.0,
                "eps": 15.37,
                "roe": 23.7,
                "roce": 28.5,
                "debt_to_equity": 0.02,
                "current_gmp": 410.0,
                "listing_price": 1200.0,
                "listing_gain_pct": 140.0,
                "subs": [
                    {"day": 1, "qib": 4.08, "nii": 13.20, "retail": 5.42, "total": 6.55},
                    {"day": 2, "qib": 8.55, "nii": 31.03, "retail": 11.19, "total": 14.85},
                    {"day": 3, "qib": 203.41, "nii": 62.11, "retail": 16.50, "total": 69.43},
                ],
                "gmp_trend": [
                    {"days_ago": 6, "gmp": 350.0, "est": 850.0, "gain": 70.0},
                    {"days_ago": 3, "gmp": 390.0, "est": 890.0, "gain": 78.0},
                    {"days_ago": 1, "gmp": 410.0, "est": 910.0, "gain": 82.0},
                ]
            },
            {
                "company_name": "Apex Semiconductor Instruments",
                "symbol": "APEXSEMI",
                "series": IPOSeries.SME,
                "status": IPOStatus.UPCOMING,
                "sector": "Semiconductor / Industrial Electronics",
                "open_date": today + timedelta(days=7),
                "close_date": today + timedelta(days=10),
                "allotment_date": today + timedelta(days=12),
                "listing_date": today + timedelta(days=15),
                "price_band_low": 125.0,
                "price_band_high": 132.0,
                "issue_price": 132.0,
                "lot_size": 1000,
                "issue_size_cr": 65.50,
                "fresh_issue_cr": 65.50,
                "ofs_cr": 0.0,
                "face_value": 10.0,
                "listing_exchanges": "NSE SME",
                "registrar": "Bigshare Services Pvt Ltd",
                "lead_managers": "Hem Securities Limited",
                "drhp_url": "https://www.nseindia.com/sme/apex-drhp.pdf",
                "pe_ratio": 18.4,
                "industry_pe": 35.0,
                "market_cap_cr": 240.0,
                "revenue_cr": 82.5,
                "pat_cr": 13.2,
                "eps": 7.15,
                "roe": 22.4,
                "roce": 25.1,
                "debt_to_equity": 0.35,
                "current_gmp": 55.0,
                "listing_price": None,
                "listing_gain_pct": None,
                "subs": [],
                "gmp_trend": [
                    {"days_ago": 3, "gmp": 40.0, "est": 172.0, "gain": 30.3},
                    {"days_ago": 1, "gmp": 55.0, "est": 187.0, "gain": 41.6},
                ]
            }
        ]

        # Insert IPOs and their children
        for idx, item in enumerate(ipos_data, start=1):
            subs_data = item.pop("subs", [])
            gmp_data = item.pop("gmp_trend", [])
            
            ipo_obj = IPO(**item)
            session.add(ipo_obj)
            await session.flush()

            for s in subs_data:
                sub_rec = IPOSubscription(
                    ipo_id=ipo_obj.id,
                    day_number=s["day"],
                    qib_subscription=s["qib"],
                    nii_subscription=s["nii"],
                    b_nii_subscription=round(s["nii"] * 1.15, 2),
                    s_nii_subscription=round(s["nii"] * 0.85, 2),
                    retail_subscription=s["retail"],
                    employee_subscription=round(s["retail"] * 0.4, 2),
                    total_subscription=s["total"],
                    recorded_at=datetime.utcnow() - timedelta(days=4 - s["day"])
                )
                session.add(sub_rec)

            for g in gmp_data:
                gmp_rec = GMPHistory(
                    ipo_id=ipo_obj.id,
                    gmp_in_inr=g["gmp"],
                    estimated_listing_price=g["est"],
                    expected_gain_pct=g["gain"],
                    recorded_at=datetime.utcnow() - timedelta(days=g["days_ago"])
                )
                session.add(gmp_rec)

        # Seed Financial News & FinBERT Sentiment records
        news_items = [
            {
                "symbol": "SWIGGY",
                "title": "Swiggy shares debut with 8% premium over issue price on NSE amid high trading volume",
                "summary": "Swiggy shares listed at Rs 420 on the NSE, an 8% gain over its upper price band of Rs 390. Institutional buying supported the tech major after strong anchor participation.",
                "source": "Economic Times",
                "published_at": datetime.utcnow() - timedelta(hours=3),
            },
            {
                "symbol": "SWIGGY",
                "title": "Quick Commerce war heats up: Instamart expands dark store footprint to take on Blinkit",
                "summary": "Swiggy plans to deploy major proceeds from its fresh issue to expand Instamart fulfillment centers across tier-1 and tier-2 Indian cities.",
                "source": "LiveMint",
                "published_at": datetime.utcnow() - timedelta(hours=8),
            },
            {
                "symbol": "HYUNDAI",
                "title": "Hyundai India shares list at discount on BSE as retail participation remains subdued",
                "summary": "India's largest ever IPO faced subdued retail interest due to aggressive parent valuation and sluggish car industry sales growth in Q2.",
                "source": "Moneycontrol",
                "published_at": datetime.utcnow() - timedelta(hours=14),
            },
            {
                "symbol": "BAJAJHFL",
                "title": "Bajaj Housing Finance surges over 114% on blockbuster debut; analysts advise profit booking",
                "summary": "Bajaj Housing Finance delivered massive multibagger listing gains for allottees as share price crossed Rs 160 on Day 1.",
                "source": "Business Standard",
                "published_at": datetime.utcnow() - timedelta(days=2),
            },
            {
                "symbol": "NTPCGREEN",
                "title": "NTPC Green Energy IPO subscribed 33% on Day 1 led by retail investors; QIB book awaited",
                "summary": "Retail book was oversubscribed on Day 1, while big institutions typically bid on Day 3 for sovereign renewable PSU issues.",
                "source": "CNBC-TV18",
                "published_at": datetime.utcnow() - timedelta(hours=5),
            },
            {
                "symbol": "TATATECH",
                "title": "Tata Technologies reports 15% YoY EBITDA margin expansion driven by automotive ER&D contracts",
                "summary": "Tata group engineering arm continues robust momentum with major European OEM electric vehicle deals.",
                "source": "Financial Express",
                "published_at": datetime.utcnow() - timedelta(days=4),
            }
        ]

        for n in news_items:
            # Score each article with FinBERT
            sentiment_res = finbert_service.analyze_sentiment(n["title"] + " " + n["summary"])
            article = NewsArticle(
                symbol=n["symbol"],
                title=n["title"],
                summary=n["summary"],
                source=n["source"],
                published_at=n["published_at"],
                sentiment_label=sentiment_res["label"],
                sentiment_score=sentiment_res["score"],
                confidence=sentiment_res["confidence"],
                positive_prob=sentiment_res["positive_prob"],
                negative_prob=sentiment_res["negative_prob"],
                neutral_prob=sentiment_res["neutral_prob"]
            )
            session.add(article)

        await session.commit()

