from fastapi import APIRouter
from app.api.v1.endpoints import ipos, sentiment, rag, prediction, market, auth, dashboard, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & User Profiles"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Statistics"])
api_router.include_router(ipos.router, prefix="/ipos", tags=["IPOs (NSE/BSE)"])
api_router.include_router(sentiment.router, prefix="/sentiment", tags=["FinBERT Sentiment"])
api_router.include_router(rag.router, prefix="/rag", tags=["DRHP RAG Analysis"])
api_router.include_router(prediction.router, prefix="/prediction", tags=["Listing Gain Predictor"])
api_router.include_router(market.router, prefix="/market", tags=["Market Benchmarks"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Portal"])
