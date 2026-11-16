import re
import logging
from typing import Dict, Any, List
from app.models.sentiment import SentimentLabel
from app.core.config import settings

logger = logging.getLogger(__name__)


class FinBERTService:
    """
    FinBERT Financial Sentiment Analysis Engine.
    Employs HuggingFace transformers ProsusAI/finbert when dependencies and weights
    are available, with an optimized financial lexicon & rule-based engine as fallback.
    """
    _instance = None
    _pipeline = None
    _model_loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FinBERTService, cls).__new__(cls)
        return cls._instance

    def _init_transformer(self):
        if self._model_loaded:
            return
        try:
            from transformers import BertTokenizer, BertForSequenceClassification, pipeline
            logger.info("Initializing FinBERT model: %s", settings.FINBERT_MODEL_NAME)
            tokenizer = BertTokenizer.from_pretrained(settings.FINBERT_MODEL_NAME)
            model = BertForSequenceClassification.from_pretrained(settings.FINBERT_MODEL_NAME)
            self._pipeline = pipeline("text-classification", model=model, tokenizer=tokenizer, return_all_scores=True)
            self._model_loaded = True
            logger.info("FinBERT transformer pipeline loaded successfully.")
        except Exception as e:
            logger.warning("Could not load full FinBERT transformer weights (%s). Activating financial NLP engine.", e)
            self._model_loaded = False

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of a financial news headline or statement.
        Returns:
            label: BULLISH, BEARISH, or NEUTRAL
            score: float (-1.0 to +1.0)
            confidence: float (0.0 to 1.0)
            positive_prob: float
            negative_prob: float
            neutral_prob: float
            key_drivers: list of highlighted financial keywords
        """
        if not text or not text.strip():
            return {
                "label": SentimentLabel.NEUTRAL,
                "score": 0.0,
                "confidence": 1.0,
                "positive_prob": 0.0,
                "negative_prob": 0.0,
                "neutral_prob": 1.0,
                "key_drivers": []
            }

        # Try Transformer pipeline if loaded
        if self._model_loaded and self._pipeline:
            try:
                results = self._pipeline(text)[0]
                # FinBERT outputs labels: positive, negative, neutral
                scores = {item['label'].lower(): item['score'] for item in results}
                pos = scores.get('positive', 0.0)
                neg = scores.get('negative', 0.0)
                neu = scores.get('neutral', 0.0)

                # Net financial score: +1 for 100% positive, -1 for 100% negative
                net_score = pos - neg
                if pos > neg and pos > neu:
                    label = SentimentLabel.BULLISH
                    confidence = pos
                elif neg > pos and neg > neu:
                    label = SentimentLabel.BEARISH
                    confidence = neg
                else:
                    label = SentimentLabel.NEUTRAL
                    confidence = neu

                drivers = self._extract_key_drivers(text)
                return {
                    "label": label,
                    "score": round(net_score, 4),
                    "confidence": round(confidence, 4),
                    "positive_prob": round(pos, 4),
                    "negative_prob": round(neg, 4),
                    "neutral_prob": round(neu, 4),
                    "key_drivers": drivers
                }
            except Exception as e:
                logger.error("FinBERT transformer inference error: %s. Using financial NLP engine.", e)

        # High-precision Financial Rule & Lexicon NLP Engine
        return self._rule_based_financial_sentiment(text)

    def _extract_key_drivers(self, text: str) -> List[str]:
        bullish_lexicon = {
            "surge", "soar", "gain", "profit", "multibagger", "growth", "strong", "outperform",
            "oversubscribed", "premium", "gmp rises", "record high", "robust", "expansion",
            "dividend", "upgrade", "bull", "rally", "listing pop", "anchor demand", "institutional buying"
        }
        bearish_lexicon = {
            "plunge", "slump", "loss", "drop", "fall", "decline", "litigation", "debt", "risk",
            "downgrade", "fraud", "weak", "underperform", "gmp drops", "sell-off", "regulatory probe",
            "sebi notice", "overpriced", "expensive valuation", "bear", "discount listing"
        }

        lowered = text.lower()
        found = []
        for word in bullish_lexicon:
            if re.search(r'\b' + re.escape(word) + r'\b', lowered):
                found.append(f"+ {word.capitalize()}")
        for word in bearish_lexicon:
            if re.search(r'\b' + re.escape(word) + r'\b', lowered):
                found.append(f"- {word.capitalize()}")
        return found[:5]

    def _rule_based_financial_sentiment(self, text: str) -> Dict[str, Any]:
        lowered = text.lower()

        bullish_weights = {
            "oversubscribed": 0.45, "surges": 0.35, "surge": 0.35, "soars": 0.4, "profit jumps": 0.45,
            "strong demand": 0.35, "robust": 0.3, "growth": 0.25, "record high": 0.4,
            "anchor investor": 0.3, "multibagger": 0.5, "gmp jumps": 0.45, "premium": 0.3,
            "revenue up": 0.35, "ebitda margin expands": 0.4, "bullish": 0.45, "upgrade": 0.35,
            "outperform": 0.4, "expansion": 0.25, "fii buying": 0.35
        }

        bearish_weights = {
            "losses": 0.4, "loss": 0.35, "falls": 0.3, "plunges": 0.45, "slumps": 0.4,
            "debt burdens": 0.45, "litigation": 0.4, "sebi warning": 0.5, "sebi notice": 0.45,
            "gmp drops": 0.4, "discount": 0.35, "underperform": 0.4, "weak demand": 0.45,
            "expensive valuation": 0.4, "poor subscription": 0.45, "fraud": 0.6, "bearish": 0.45,
            "downgrade": 0.4, "selloff": 0.4, "caution": 0.3
        }

        pos_score = sum(wt for term, wt in bullish_weights.items() if term in lowered)
        neg_score = sum(wt for term, wt in bearish_weights.items() if term in lowered)

        total_weight = pos_score + neg_score + 0.0001
        
        # Softmax-style probability normalization
        if pos_score > neg_score and (pos_score - neg_score) >= 0.25:
            label = SentimentLabel.BULLISH
            pos_prob = min(0.92, 0.55 + (pos_score / 2.0))
            neg_prob = max(0.04, 0.45 - (pos_score / 2.0))
            neu_prob = 1.0 - (pos_prob + neg_prob)
            score = round(pos_prob - neg_prob, 4)
            confidence = round(pos_prob, 4)
        elif neg_score > pos_score and (neg_score - pos_score) >= 0.25:
            label = SentimentLabel.BEARISH
            neg_prob = min(0.92, 0.55 + (neg_score / 2.0))
            pos_prob = max(0.04, 0.45 - (neg_score / 2.0))
            neu_prob = 1.0 - (pos_prob + neg_prob)
            score = round(pos_prob - neg_prob, 4)
            confidence = round(neg_prob, 4)
        else:
            label = SentimentLabel.NEUTRAL
            neu_prob = 0.70
            pos_prob = 0.15 + (pos_score * 0.1)
            neg_prob = 0.15 + (neg_score * 0.1)
            norm = pos_prob + neg_prob + neu_prob
            pos_prob, neg_prob, neu_prob = pos_prob / norm, neg_prob / norm, neu_prob / norm
            score = round(pos_prob - neg_prob, 4)
            confidence = round(neu_prob, 4)

        drivers = self._extract_key_drivers(text)
        return {
            "label": label,
            "score": score,
            "confidence": confidence,
            "positive_prob": round(pos_prob, 4),
            "negative_prob": round(neg_prob, 4),
            "neutral_prob": round(neu_prob, 4),
            "key_drivers": drivers
        }


finbert_service = FinBERTService()

