# System Architecture: IPO Analysis & Stock Sentiment Analyzer (NSE/BSE)

## 1. Executive Summary

The **IPO Analysis & Stock Sentiment Analyzer** is an enterprise-grade financial intelligence platform tailored specifically to the Indian capital markets (NSE & BSE). It provides retail and institutional investors with real-time grey market premium (GMP) tracking, subscription momentum analytics across investor buckets (QIB, NII, Retail), FinBERT-powered sentiment classification, RAG-driven SEBI Draft Red Herring Prospectus (DRHP) exploration, and machine learning listing-day gain forecasting.

---

## 2. High-Level Component Architecture

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (React 18 + Vite + TypeScript)"]
        UI["Financial UI / Dashboard"]
        Theme["Theme Engine (Dark / Light)"]
        Ticker["Live NSE/BSE Market Ticker"]
        PredictorUI["ML Gain Calculator"]
        RAGUI["DRHP Prospectus AI Chat"]
    end

    subgraph GatewayLayer ["Reverse Proxy & Web Gateway"]
        Nginx["Nginx Reverse Proxy (Port 80/443)"]
    end

    subgraph BackendLayer ["Application Layer (FastAPI Asynchronous Engine)"]
        API["FastAPI REST API (/api/v1)"]
        IPORouter["IPO Router (CRUD & Subscriptions)"]
        SentimentRouter["FinBERT Sentiment Router"]
        RAGRouter["RAG Query Router"]
        PredictorRouter["ML Listing Gain Router"]
        MarketRouter["Live Benchmarks Router"]
    end

    subgraph ServiceLayer ["Core Intelligence Services"]
        FinBERT["FinBERT Transformer & Financial NLP Engine"]
        Predictor["Scikit-learn Gradient Boosting Ensemble"]
        RAGService["DRHP Vector Retrieval & Synthesis"]
        CacheMgr["Redis Multi-Tier Cache Manager"]
    end

    subgraph DataLayer ["Data & Persistence Layer"]
        Postgres[("PostgreSQL 16 (Relational Store)")]
        RedisStore[("Redis 7 (In-Memory Cache & Pub/Sub)")]
        VectorStore[("Semantic Vector Index")]
    end

    UI --> Nginx
    Nginx --> API
    API --> IPORouter
    API --> SentimentRouter
    API --> RAGRouter
    API --> PredictorRouter
    API --> MarketRouter

    IPORouter --> CacheMgr
    IPORouter --> Postgres
    SentimentRouter --> FinBERT
    PredictorRouter --> Predictor
    RAGRouter --> RAGService
    RAGService --> VectorStore

    CacheMgr --> RedisStore
    FinBERT --> Postgres
```

---

## 3. Data Flow & Communication Lifecycle

### 3.1. IPO Ingestion & Live GMP Ingestion
1. **Source Feeds**: SEBI filings, NSE/BSE corporate announcements, and merchant banker updates.
2. **Persistence**: Relational schema records price band, issue sizes (Fresh vs. OFS), registrar, and timelines.
3. **Caching**: Live GMP and subscription ratios are cached in Redis with a 60-second TTL to handle high-traffic listing day traffic surges.

### 3.2. FinBERT Sentiment Pipeline
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React Client
    participant FastAPI as Backend (FastAPI)
    participant Redis as Redis Cache
    participant FinBERT as FinBERT NLP Service
    participant DB as PostgreSQL

    User->>Frontend: Request Sentiment Overview / Analyze Headline
    Frontend->>FastAPI: GET /api/v1/sentiment/overview
    FastAPI->>Redis: Check cached sentiment metrics
    alt Cache Hit
        Redis-->>FastAPI: Return JSON cached metrics
    else Cache Miss
        FastAPI->>DB: Query latest 50 news articles
        FastAPI->>FinBERT: Compute Net Sentiment & Key Drivers
        FastAPI->>Redis: Set cache with TTL 60s
    end
    FastAPI-->>Frontend: Return Sentiment Index & Probabilities
    Frontend-->>User: Render Fear/Greed Meter & Driver Badges
```

### 3.3. DRHP RAG (Retrieval-Augmented Generation) Pipeline
1. **Document Ingestion**: SEBI DRHP / RHP PDF documents are pre-processed and segmented into distinct semantic sections (*Risk Factors*, *Objects of the Issue*, *Financial Indebtedness*, *Promoter Track Record*).
2. **Query Processing**: User submits natural-language questions (e.g. *"What are the litigation risks against promoters?"*).
3. **Vector Retrieval**: Semantic similarity matching isolates the top-k highest-scoring prospectus chunks.
4. **Context Synthesis**: Generates accurate, cited summaries with explicit page and statutory section tags.

---

## 4. Database Schema Entity-Relationship (ER) Model

```mermaid
erDiagram
    IPO ||--o{ IPOSubscription : "has day-wise bids"
    IPO ||--o{ GMPHistory : "tracks price trend"
    IPO ||--o{ ProspectusChunk : "contains indexed sections"
    IPO ||--o{ NewsArticle : "tagged in"
    USER ||--o{ WatchlistItem : "monitors"
    IPO ||--o{ WatchlistItem : "bookmarked by"

    IPO {
        int id PK
        string company_name
        string symbol UK
        string series "MAINBOARD | SME"
        string status "UPCOMING | OPEN | CLOSED | LISTED"
        float price_band_low
        float price_band_high
        int lot_size
        float issue_size_cr
        float fresh_issue_cr
        float ofs_cr
        float current_gmp
        float listing_price
        float listing_gain_pct
    }

    IPOSubscription {
        int id PK
        int ipo_id FK
        int day_number
        float qib_subscription
        float nii_subscription
        float retail_subscription
        float total_subscription
    }

    GMPHistory {
        int id PK
        int ipo_id FK
        datetime recorded_at
        float gmp_in_inr
        float estimated_listing_price
        float expected_gain_pct
    }

    NewsArticle {
        int id PK
        int ipo_id FK
        string symbol
        string title
        string source
        string sentiment_label
        float sentiment_score
        float confidence
    }

    ProspectusChunk {
        int id PK
        int ipo_id FK
        string section_name
        text content
        int chunk_index
    }
```

---

## 5. Security & High Availability Standards

- **Cross-Origin Resource Sharing (CORS)**: Strict origin validation allowing only authorized frontend domains.
- **Database Connection Pooling**: SQLAlchemy async engine utilizes connection health pinging (`pool_pre_ping=True`) with a 10-pool / 20-overflow ceiling.
- **Graceful Fallbacks**: In-memory LRU fallback ensures unbroken uptime if Redis or remote HuggingFace weights are momentarily unreachable.
- **Statutory Disclaimers**: SEBI-compliant analytical disclaimers rendered across all user interfaces.

