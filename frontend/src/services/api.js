import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'https://threediframerk.onrender.com/api';

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
    console.log(`Uploading model for request ID: ${requestId}`);
    if (!requestId) {
      return Promise.reject(new Error('Request ID is required'));
    }
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post(`/models/upload/${requestId}`, formData, config)
      .catch(error => {
        console.error('Model upload error:', error.response?.data || error.message);
        throw error;
      });
  },
  getModelById: (id) => {
    // Convert object ID to string if needed
    const modelId = typeof id === 'object' ? id._id : id;
    
    if (!modelId) {
      return Promise.reject(new Error('Model ID is required'));
    }
    console.log(`Getting model with ID: ${modelId} (original type: ${typeof id})`);
    
    return api.get(`/models/${modelId}`)
      .catch(error => {
        console.error(`Error fetching model ${modelId}:`, error.response?.data || error.message);
        throw error;
      });
  },
  getEmbedCode: (id) => {
    // Convert object ID to string if needed
    const modelId = typeof id === 'object' ? id._id : id;
    
    if (!modelId) {
      return Promise.reject(new Error('Model ID is required'));
    }
    console.log(`Getting embed code for model ID: ${modelId} (original type: ${typeof id})`);
    
    return api.get(`/models/${modelId}/embed-code`)
      .catch(error => {
        console.error(`Error fetching embed code for model ${modelId}:`, error.response?.data || error.message);
        throw error;
      });
  },
  getPublicModelData: (id) => {
    // Convert object ID to string if needed
    const modelId = typeof id === 'object' ? id._id : id;
    
    if (!modelId) {
      return Promise.reject(new Error('Model ID is required'));
    }
    console.log(`Getting public model data for ID: ${modelId} (original type: ${typeof id})`);
    
    return api.get(`/models/embed/${modelId}`)
      .catch(error => {
        console.error(`Error fetching public model data ${modelId}:`, error.response?.data || error.message);
        throw error;
      });
  },
};

export default api; 