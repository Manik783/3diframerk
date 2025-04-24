import axios from 'axios';

// When in production, use the deployed API URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'http://ec2-18-233-151-230.compute-1.amazonaws.com/api'
  : 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  register: (userData) => api.post('/users', userData),
  login: (email, password) => api.post('/users/login', { email, password }),
  getProfile: () => api.get('/users/profile'),
};

// Request services
export const requestService = {
  createRequest: (requestData) => api.post('/requests', requestData),
  getUserRequests: () => api.get('/requests'),
  getRequestById: (id) => api.get(`/requests/${id}`),
  getAllRequests: () => api.get('/requests/all'),
  updateRequestStatus: (id, status) => api.put(`/requests/${id}/status`, { status }),
};

// Model services
export const modelService = {
  uploadModel: (requestId, formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post(`/models/upload/${requestId}`, formData, config);
  },
  getModelById: (id) => api.get(`/models/${id}`),
  getEmbedCode: (id) => api.get(`/models/${id}/embed-code`),
  getPublicModelData: (id) => api.get(`/models/embed/${id}`),
};

export default api; 