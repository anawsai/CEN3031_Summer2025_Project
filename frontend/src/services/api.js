import axios from 'axios';

// Base URL for your Flask backend
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Pomodoro API functions
export const pomodoroAPI = {
  startSession: async () => {
    const response = await api.post('/pomodoro/start');
    return response.data;
  },
  
  completeSession: async (sessionId) => {
    const response = await api.post(`/pomodoro/${sessionId}/complete`);
    return response.data;
  }
};

// Analytics API functions
export const analyticsAPI = {
  getTaskStats: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/analytics/tasks', { params });
    return response.data;
  }
};

// XP API functions
export const xpAPI = {
  getUserXP: async () => {
    const response = await api.get('/xp');
    return response.data;
  }
};

export default api;
