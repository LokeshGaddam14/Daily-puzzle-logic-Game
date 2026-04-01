import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ll_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ll_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ============================================
// API METHODS
// ============================================

export const authAPI = {
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const scoresAPI = {
  submit: (data: {
    puzzleType: string;
    score: number;
    timeTaken: number;
    hintsUsed: number;
    date: string;
  }) => api.post('/scores', data),

  getToday: () => api.get('/scores/today'),
};

export const leaderboardAPI = {
  daily: (date?: string) =>
    api.get('/leaderboard/daily', { params: { date } }),
  allTime: () => api.get('/leaderboard/alltime'),
};

export const usersAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: { name?: string; avatar?: string }) =>
    api.patch('/users/me', data),
};
