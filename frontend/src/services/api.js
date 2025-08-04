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
  },
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
  },
};

// Analytics API functions
export const analyticsAPI = {
  getTaskStats: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get('/analytics/tasks', { params });
    return response.data;
  },
};

// XP API functions
export const xpAPI = {
  getUserXP: async () => {
    const response = await api.get('/xp');
    return response.data;
  },
};

export default api;

// Boards API functions
export const boardsAPI = {
  getBoards: () => api.get('/boards'),
  createBoard: (data) => api.post('/boards', data),
  deleteBoard: (id) => api.delete(`/boards/${id}`),
  getBoardTasks: (id) => api.get(`/boards/${id}/tasks`),
  createBoardTask: (id, data) => api.post(`/boards/${id}/tasks`, data),
  updateBoardTask: (boardId, taskId, data) =>
    api.put(`/boards/${boardId}/tasks/${taskId}`, data),
  deleteBoardTask: (boardId, taskId) =>
    api.delete(`/boards/${boardId}/tasks/${taskId}`),
  inviteUser: (boardId, username, message) =>
    api.post(`/boards/${boardId}/invite`, { username, message }),
  getMembers: (boardId) => api.get(`/boards/${boardId}/members`),
  removeMember: (boardId, memberId) =>
    api.delete(`/boards/${boardId}/members/${memberId}`),
};

// Invites API functions
export const invitesAPI = {
  getInvites: () => api.get('/invites'),
  acceptInvite: (inviteId) => api.post(`/invites/${inviteId}/accept`),
  declineInvite: (inviteId) => api.post(`/invites/${inviteId}/decline`),
};
