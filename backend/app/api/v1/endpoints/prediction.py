from fastapi import APIRouter
from app.schemas.prediction import ListingGainPredictionRequest, ListingGainPredictionResponse
from app.services.predictor_service import predictor_service

router = APIRouter()


@router.post("/listing-gain", response_model=ListingGainPredictionResponse)
async def predict_listing_gain(payload: ListingGainPredictionRequest):
    """
    Predict IPO listing gain percentage and price band using Scikit-learn
    gradient boosting regressor and random forest classifier.
    """
    return predictor_service.predict_listing_gain(payload)

