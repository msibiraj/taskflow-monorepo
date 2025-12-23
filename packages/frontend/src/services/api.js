import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Board APIs
export const boardAPI = {
  getBoards: async () => {
    const { data } = await api.get('/boards');
    return data;
  },

  getBoard: async (id) => {
    const { data } = await api.get(`/boards/${id}`);
    return data;
  },

  createBoard: async (boardData) => {
    const { data } = await api.post('/boards', boardData);
    return data;
  },

  updateBoard: async (id, boardData) => {
    const { data } = await api.put(`/boards/${id}`, boardData);
    return data;
  },

  deleteBoard: async (id) => {
    const { data } = await api.delete(`/boards/${id}`);
    return data;
  },

  addMember: async (boardId, email) => {
    const { data } = await api.post(`/boards/${boardId}/members`, { email });
    return data;
  },

  removeMember: async (boardId, userId) => {
    const { data } = await api.delete(`/boards/${boardId}/members/${userId}`);
    return data;
  },
};

export default api;
