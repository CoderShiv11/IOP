# IPO Analysis & Stock Sentiment Analyzer (NSE / BSE)

[![CI/CD Pipeline](https://github.com/your-username/ipo-sentiment-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/ipo-sentiment-analyzer/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com)

An enterprise-grade financial analytics and machine-learning platform built specifically for the **Indian Stock Market (NSE / BSE)**. The platform provides real-time tracking of Mainboard & SME Initial Public Offerings (IPOs), day-wise subscription book building (QIB, NII, Retail), Grey Market Premium (GMP) momentum, FinBERT-powered sentiment classification, RAG-driven SEBI Draft Red Herring Prospectus (DRHP) analysis, and Scikit-learn listing day gain prediction.

---

## 🏛️ System Architecture

Refer to [docs/architecture.md](docs/architecture.md) for detailed sequence diagrams, component topologies, and database ER models.

```
                              ┌────────────────────────────────────────┐
                              │  React 18 + Vite + Tailwind + shadcn  │
                              │      Financial UI (Dark & Light)       │
                              └──────────────────┬─────────────────────┘
                                                 │ HTTP / REST
                                                 ▼
                              ┌────────────────────────────────────────┐
                              │          Nginx Reverse Proxy           │
                              └──────────────────┬─────────────────────┘
                                                 │
                                                 ▼
                              ┌────────────────────────────────────────┐
                              │       FastAPI Application Engine       │
                              │   (/api/v1/ipos, sentiment, rag, ml)  │
                              └───────┬──────────┬──────────┬──────────┘
                                      │          │          │
             ┌────────────────────────┘          │          └────────────────────────┐
             ▼                                   ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐         ┌─────────────────────────┐
│     PostgreSQL 16       │         │      Redis 7 Cache      │         │   AI / ML & NLP Engine  │
│  IPOs, Subs, Filings    │         │ 60s TTL Market Caching  │         │ FinBERT, Scikit, RAG    │
└─────────────────────────┘         └─────────────────────────┘         └─────────────────────────┘
```

---

## 🚀 Key Features

1. **Indian IPO Intelligence Hub**:
   - Comprehensive Mainboard and SME IPO database (Open, Upcoming, Listed, Closed).
   - Real-time Grey Market Premium (GMP) and estimated listing gains.
   - Day 1, Day 2, Day 3 subscription tracking categorized by **QIB**, **NII / HNI (bNII & sNII)**, and **Retail (RII)**.
   - Key fundamental ratios: P/E, Sector P/E, Market Cap, Revenue, PAT, RoE, RoCE, and Debt-to-Equity.

2. **FinBERT Market Sentiment Engine**:
   - Hugging Face `ProsusAI/finbert` model coupled with a high-performance financial lexicon engine.
   - Analyzes financial news headlines from *Economic Times*, *LiveMint*, *Moneycontrol*, and broker notes.
   - Fear & Greed / Market Sentiment meter (0–100 scale) with bullish, bearish, and neutral probability distributions.
   - Real-time custom text analyzer to inspect custom headlines.

3. **DRHP / RHP Prospectus RAG Studio**:
   - Retrieval-Augmented Generation for SEBI statutory filings.
   - Semantic query retrieval across critical prospectus sections (*Risk Factors*, *Objects of the Offer*, *Promoter Dilution*, *Litigations*).
   - Citations with section tags, page references, and similarity match percentages.

4. **Listing Gain Predictor (Scikit-Learn ML)**:
   - Gradient Boosting Regressor and Random Forest Classifier ensemble calibrated against 100+ historical Indian IPO debuts.
   - Synthesizes GMP, institutional QIB book, NII demand, sentiment index, and valuation discounts.
   - Outputs projected listing price, confidence intervals (±%), profit probability, and SEBI bidding recommendations.

5. **Fintech Design & Theming**:
   - Dark & Light mode toggle with local storage persistence.
   - Live NSE/BSE ticker displaying NIFTY 50, SENSEX, BANK NIFTY, and INDIA VIX.
   - Indian currency notation: Rupees (₹), Crores (Cr), and Lakhs.

---

## 📁 Scalable Project Directory Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── ipos.py            # IPO CRUD & Subscription tracking
│   │   │   │   ├── sentiment.py       # FinBERT sentiment endpoints
│   │   │   │   ├── rag.py             # DRHP Prospectus Q&A
│   │   │   │   ├── prediction.py      # ML listing gain simulator
│   │   │   │   └── market.py          # Nifty/Sensex benchmark feeds
│   │   │   └── router.py              # API v1 aggregator
│   │   ├── core/
│   │   │   ├── config.py              # Pydantic v2 settings
│   │   │   ├── database.py            # Async SQLAlchemy engine
│   │   │   ├── redis.py               # Redis connection & cache
│   │   │   └── security.py            # Security & JWT hashing
│   │   ├── db/
│   │   │   └── init_db.py             # Database seed & migration script
│   │   ├── models/                    # SQLAlchemy declarative models
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── finbert_service.py     # FinBERT inference engine
│   │   │   ├── predictor_service.py   # Scikit-learn listing gain model
│   │   │   ├── rag_service.py         # DRHP semantic chunk retrieval
│   │   │   └── ipo_service.py         # Business logic
│   │   └── main.py                    # Application entrypoint
│   ├── tests/                         # Pytest test suite
│   ├── Dockerfile                     # Multi-stage Python 3.11 image
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable shadcn/ui components
│   │   │   ├── layout/                # Navbar, MarketTicker, Footer
│   │   │   ├── ipo/                   # IPOCard, IPOTable, SubscriptionProgress
│   │   │   ├── sentiment/             # SentimentGauge, NewsSentimentCard
│   │   │   ├── rag/                   # ProspectusChat
│   │   │   ├── predictor/             # ListingGainCalculator
│   │   │   └── theme/                 # ThemeToggle
│   │   ├── context/                   # Dark/Light ThemeContext
│   │   ├── pages/                     # Dashboard, IPOs, Detail, Sentiment, RAG
│   │   ├── services/                  # Typed Axios client
│   │   ├── types/                     # TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile                     # Nginx Alpine multi-stage build
│   ├── nginx.conf                     # Production reverse proxy config
│   ├── tailwind.config.js
│   └── package.json
├── docs/
│   └── architecture.md                # Complete system architecture
├── .github/workflows/
│   └── ci.yml                         # Automated CI pipeline
├── docker-compose.yml                 # Orchestration (Postgres + Redis + App + UI)
└── README.md
```

---

## 🛠️ Installation & Setup Guide

### Method A: Docker Compose (Recommended)

Requires Docker & Docker Compose installed.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ipo-sentiment-analyzer.git
cd ipo-sentiment-analyzer

# 2. Copy the environment variables
cp .env.example .env

# 3. Start all services (PostgreSQL, Redis, FastAPI Backend, React Frontend)
docker compose up --build -d

# 4. Verify running containers
docker compose ps
```

Once running:
- **Frontend Application**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432` (db: `ipo_sentiment_db`, user: `postgres`)
- **Redis Cache**: `localhost:6379`

---

### Method B: Ubuntu / Debian Local Development

#### Prerequisites
```bash
sudo apt update && sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib redis-server curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 1. Configure PostgreSQL & Redis
```bash
# Start Redis
sudo systemctl enable redis-server --now

# Start and configure PostgreSQL
sudo systemctl enable postgresql --now
sudo -u postgres psql -c "CREATE DATABASE ipo_sentiment_db;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run FastAPI server (automatically initializes DB and seeds sample Indian IPOs)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Copy environment config
cp .env.example .env

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Quality Assurance

Run the automated Pytest test suite:
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

Run frontend build check:
```bash
cd frontend
npm run build
```

---

## 🔌 API Reference Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status check |
| `GET` | `/api/v1/market/summary` | Live NSE NIFTY 50, BSE SENSEX, INDIA VIX |
| `GET` | `/api/v1/ipos` | List all IPOs (with status & series filters) |
| `GET` | `/api/v1/ipos/{id}` | Deep details: subscriptions, GMP history, fundamentals |
| `GET` | `/api/v1/sentiment/overview` | FinBERT market sentiment index & distributions |
| `GET` | `/api/v1/sentiment/news` | Real-time financial headlines with sentiment tags |
| `POST` | `/api/v1/sentiment/analyze` | On-demand FinBERT text & headline inference |
| `POST` | `/api/v1/rag/query` | RAG query against SEBI DRHP prospectus filings |
| `POST` | `/api/v1/prediction/listing-gain` | Scikit-learn ML listing gain projection |

Interactive OpenAPI documentation is accessible at `http://localhost:8000/docs`.

---

## ⚖️ Statutory Disclaimer

*This software is intended strictly for financial technology research, analytics, and educational purposes. Stock market investments and IPO bids are subject to market risks. Please read all offer documents (DRHP / RHP) carefully and consult a SEBI-registered Investment Adviser before bidding.*

---

## 📄 License
MIT License. Open-source for personal and educational use.

