export type IPOStatus = 'UPCOMING' | 'OPEN' | 'CLOSED' | 'LISTED';
export type IPOSeries = 'MAINBOARD' | 'SME';
export type SentimentLabel = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface IPOSubscription {
  id: number;
  ipo_id: number;
  day_number: number;
  recorded_at: string;
  qib_subscription: number;
  nii_subscription: number;
  b_nii_subscription: number;
  s_nii_subscription: number;
  retail_subscription: number;
  employee_subscription: number;
  total_subscription: number;
}

export interface GMPHistoryPoint {
  id: number;
  ipo_id: number;
  recorded_at: string;
  gmp_in_inr: number;
  estimated_listing_price: number;
  expected_gain_pct: number;
  source: string;
}

export interface IPO {
  id: number;
  company_name: string;
  symbol: string;
  series: IPOSeries;
  status: IPOStatus;
  sector?: string;
  open_date?: string;
  close_date?: string;
  allotment_date?: string;
  listing_date?: string;
  price_band_low: number;
  price_band_high: number;
  issue_price?: number;
  lot_size: number;
  issue_size_cr: number;
  fresh_issue_cr: number;
  ofs_cr: number;
  face_value: number;
  listing_exchanges: string;
  registrar?: string;
  lead_managers?: string;
  drhp_url?: string;
  rhp_url?: string;
  pe_ratio?: number;
  industry_pe?: number;
  market_cap_cr?: number;
  revenue_cr?: number;
  pat_cr?: number;
  eps?: number;
  roe?: number;
  roce?: number;
  debt_to_equity?: number;
  current_gmp: number;
  listing_price?: number;
  listing_gain_pct?: number;
  expected_gain_pct: number;
  latest_total_subscription: number;
  sentiment_score?: number;
  sentiment_label?: SentimentLabel;
}

export interface IPODetail extends IPO {
  subscriptions: IPOSubscription[];
  gmp_history: GMPHistoryPoint[];
  created_at: string;
  updated_at: string;
  // Extended Financial
  ebitda_cr?: number;
  ebitda_margin_pct?: number;
  pat_margin_pct?: number;
  pb_ratio?: number;
  // History (JSON strings)
  revenue_history?: string;
  pat_history?: string;
  ebitda_history?: string;
  // Cash Flow
  operating_cashflow_cr?: number;
  investing_cashflow_cr?: number;
  financing_cashflow_cr?: number;
  // Company Details
  year_of_incorporation?: number;
  headquarters?: string;
  company_description?: string;
  business_model?: string;
  website?: string;
  // Promoter Info
  promoter_holding_pct?: number;
  post_ipo_promoter_pct?: number;
  promoter_names?: string;
  // Competitive
  market_position?: string;
  competitors?: string;
  total_addressable_market_cr?: number;
  market_share_pct?: number;
  // SWOT
  strengths?: string;
  weaknesses?: string;
  risks?: string;
  objects_of_issue?: string;
}

export interface NewsArticle {
  id: number;
  ipo_id?: number;
  symbol?: string;
  title: string;
  summary?: string;
  content?: string;
  source: string;
  url?: string;
  published_at: string;
  sentiment_label: SentimentLabel;
  sentiment_score: number;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  neutral_prob: number;
  created_at: string;
}

export interface MarketSentimentOverview {
  nifty_index: number;
  nifty_change_pct: number;
  sensex_index: number;
  sensex_change_pct: number;
  market_sentiment_label: SentimentLabel;
  sentiment_index: number;
  bullish_percentage: number;
  bearish_percentage: number;
  neutral_percentage: number;
  total_analyzed: number;
  trending_ipo_symbols: string[];
}

export interface TextSentimentAnalysisRequest {
  text: string;
  symbol?: string;
}

export interface TextSentimentAnalysisResponse {
  text: string;
  symbol?: string;
  sentiment_label: SentimentLabel;
  sentiment_score: number;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  neutral_prob: number;
  key_drivers: string[];
}

export interface CitationSource {
  section: string;
  snippet: string;
  relevance_score: number;
}

export interface RAGQueryResponse {
  ipo_id: number;
  query: string;
  answer: string;
  citations: CitationSource[];
  confidence: number;
  latency_ms: number;
}

export interface FeatureImportance {
  feature: string;
  weight: number;
  value: string;
}

export interface ListingGainPredictionRequest {
  ipo_id?: number;
  issue_price: number;
  current_gmp: number;
  qib_subscription: number;
  nii_subscription: number;
  retail_subscription: number;
  market_sentiment_score: number;
  pe_ratio?: number;
  industry_pe?: number;
}

export interface ListingGainPredictionResponse {
  predicted_listing_price: number;
  predicted_gain_pct: number;
  predicted_price_low: number;
  predicted_price_high: number;
  confidence_interval_pct: number;
  success_probability: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  feature_importance: FeatureImportance[];
  recommendation: string;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  change_pct: number;
}

export interface MarketSummaryResponse {
  market_status: 'OPEN' | 'CLOSED';
  timestamp: string;
  indices: MarketIndex[];
}



// ==========================================
// Authentication & User Profile Types
// ==========================================
export type UserRole = 'admin' | 'user' | 'analyst';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  is_active: boolean;
  created_at?: string;
  last_login?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface UserProfileUpdate {
  full_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
}

// ==========================================
// Dashboard & Notification Types
// ==========================================
export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface DashboardStats {
  total_ipos: number;
  upcoming_count: number;
  open_count: number;
  listed_count: number;
  closed_count: number;
  total_issue_pipeline_cr: number;
  top_gainer: {
    company_name: string;
    symbol: string;
    listing_gain_pct: number;
    listing_price?: number;
    current_gmp?: number;
  } | null;
  top_loser: {
    company_name: string;
    symbol: string;
    listing_gain_pct: number;
    listing_price?: number;
    current_gmp?: number;
  } | null;
  market_overview: {
    nifty: { name: string; value: number; change: number; change_pct: number };
    sensex: { name: string; value: number; change: number; change_pct: number };
    bank_nifty: { name: string; value: number; change: number; change_pct: number };
    india_vix: { name: string; value: number; change: number; change_pct: number };
  };
  sentiment_summary: {
    overall_label: string;
    sentiment_index: number;
    bullish_pct: number;
    bearish_pct: number;
    neutral_pct: number;
    total_analyzed: number;
  };
  recent_listed: Array<{
    id: number;
    company_name: string;
    symbol: string;
    listing_price: number;
    listing_gain_pct: number;
    current_gmp: number;
    sector?: string;
  }>;
  upcoming_ipos: Array<{
    id: number;
    company_name: string;
    symbol: string;
    open_date: string;
    close_date: string;
    price_band_high: number;
    current_gmp: number;
    sector: string;
    issue_size_cr?: number;
  }>;
  positive_stocks: Array<{
    id: number;
    company_name: string;
    symbol: string;
    listing_gain_pct: number;
    current_gmp: number;
  }>;
  negative_stocks: Array<{
    id: number;
    company_name: string;
    symbol: string;
    listing_gain_pct: number;
    current_gmp: number;
  }>;
  latest_news: Array<{
    id: number;
    title: string;
    summary?: string;
    source: string;
    published_at: string;
    sentiment_label: SentimentLabel;
    sentiment_score: number;
    confidence: number;
    symbol?: string;
  }>;
  performance_chart_data: Array<{
    month: string;
    listings_count: number;
    avg_gain_pct: number;
  }>;
  notifications: NotificationItem[];
}

// ==========================================
// Extended IPO Analysis Types
// ==========================================

export interface FinancialDataPoint {
  year: string;    // "FY22", "FY23", "FY24"
  value: number;
}

export interface CompetitorInfo {
  name: string;
  market_cap_cr?: number;
  pe_ratio?: number;
  revenue_cr?: number;
  description?: string;
}

export interface ObjectOfIssue {
  purpose: string;
  amount_cr: number;
  percentage?: number;
}

export interface ScoreBreakdownItem {
  factor: string;
  points: number;
  max_points: number;
  detail: string;
}

export interface DimensionScore {
  score: number;
  max: number;
  breakdown: ScoreBreakdownItem[];
}

export interface IPOEvaluationScores {
  financial_health: DimensionScore;
  valuation: DimensionScore;
  growth: DimensionScore;
  risk: DimensionScore;
}

export interface IPOEvaluation {
  ipo_id: number;
  company_name: string;
  composite_score: number;
  grade: string;
  recommendation: string;
  scores: IPOEvaluationScores;
  summary: string;
  key_positives: string[];
  key_concerns: string[];
}

// Extended IPO detail with all new fields (superset of IPODetail)
export interface IPODetailExtended extends IPODetail {
  // (all extended fields already merged into IPODetail above)
}
