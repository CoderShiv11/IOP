import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  IPO,
  IPODetail,
  NewsArticle,
  MarketSentimentOverview,
  TextSentimentAnalysisRequest,
  TextSentimentAnalysisResponse,
  RAGQueryResponse,
  ListingGainPredictionRequest,
  ListingGainPredictionResponse,
  MarketSummaryResponse,
  User,
  TokenResponse,
  RegisterRequest,
  LoginRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  UserProfileUpdate,
  DashboardStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to avoid multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Refresh Token Flow & Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 Unauthorized and not already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry if the 401 was from login, register, or refresh itself
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<TokenResponse>(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        processQueue(null, access_token);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication & Users
  register: async (payload: RegisterRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/auth/register', payload);
    return res.data;
  },

  login: async (payload: LoginRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/auth/login', payload);
    return res.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      }
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  refreshToken: async (token: string): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/auth/refresh', { refresh_token: token });
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  updateProfile: async (payload: UserProfileUpdate): Promise<User> => {
    const res = await apiClient.put<User>('/auth/me', payload);
    return res.data;
  },

  changePassword: async (payload: PasswordChangeRequest): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/auth/change-password', payload);
    return res.data;
  },

  requestPasswordReset: async (payload: PasswordResetRequest): Promise<{ message: string; reset_token?: string }> => {
    const res = await apiClient.post<{ message: string; reset_token?: string }>('/auth/password-reset-request', payload);
    return res.data;
  },

  confirmPasswordReset: async (payload: PasswordResetConfirm): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/auth/password-reset-confirm', payload);
    return res.data;
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },

  // Admin Endpoints
  getAdminUsers: async (params?: { skip?: number; limit?: number; search?: string }): Promise<{ users: User[]; total: number }> => {
    const res = await apiClient.get<{ users: User[]; total: number }>('/admin/users', { params });
    return res.data;
  },

  updateAdminUserRole: async (userId: number, role: string): Promise<User> => {
    const res = await apiClient.put<User>(`/admin/users/${userId}/role`, null, { params: { role } });
    return res.data;
  },

  deactivateAdminUser: async (userId: number): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/admin/users/${userId}`);
    return res.data;
  },

  getAdminStats: async (): Promise<Record<string, any>> => {
    const res = await apiClient.get<Record<string, any>>('/admin/stats');
    return res.data;
  },

  // IPOs
  getIPOs: async (status?: string, series?: string): Promise<IPO[]> => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (series) params.series = series;
    const res = await apiClient.get<IPO[]>('/ipos', { params });
    return res.data;
  },

  getIPODetail: async (id: number): Promise<IPODetail> => {
    const res = await apiClient.get<IPODetail>(`/ipos/${id}`);
    return res.data;
  },

  // Sentiment
  getMarketSentimentOverview: async (): Promise<MarketSentimentOverview> => {
    const res = await apiClient.get<MarketSentimentOverview>('/sentiment/overview');
    return res.data;
  },

  getNewsArticles: async (symbol?: string): Promise<NewsArticle[]> => {
    const params: Record<string, string> = {};
    if (symbol) params.symbol = symbol;
    const res = await apiClient.get<NewsArticle[]>('/sentiment/news', { params });
    return res.data;
  },

  analyzeTextSentiment: async (payload: TextSentimentAnalysisRequest): Promise<TextSentimentAnalysisResponse> => {
    const res = await apiClient.post<TextSentimentAnalysisResponse>('/sentiment/analyze', payload);
    return res.data;
  },

  // RAG Prospectus Q&A
  queryProspectus: async (ipo_id: number, query: string): Promise<RAGQueryResponse> => {
    const res = await apiClient.post<RAGQueryResponse>('/rag/query', { ipo_id, query });
    return res.data;
  },

  // Listing Gain ML Predictor
  predictListingGain: async (payload: ListingGainPredictionRequest): Promise<ListingGainPredictionResponse> => {
    const res = await apiClient.post<ListingGainPredictionResponse>('/prediction/listing-gain', payload);
    return res.data;
  },

  // Market Indices
  getMarketSummary: async (): Promise<MarketSummaryResponse> => {
    const res = await apiClient.get<MarketSummaryResponse>('/market/summary');
    return res.data;
  },
};
