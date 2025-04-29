import axios from 'axios';

// Base API URL from environment variable
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 second timeout
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      // Handle timeout
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    
    if (!error.response) {
      // Network error
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    if (error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('userToken');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    
    return Promise.reject(error);
  }
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
  getUserRequests: () => api.get('/requests/my'),
  getRequestById: (id) => api.get(`/requests/${id}`),
  getAllRequests: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.status && params.status !== 'All') queryParams.append('status', params.status);
      if (params.fileFilter && params.fileFilter !== 'All') queryParams.append('fileFilter', params.fileFilter);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.page) queryParams.append('page', params.page);
      
      const url = `/requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await api.get(url);
    } catch (error) {
      console.error('Error in getAllRequests:', error);
      throw error;
    }
  },
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

// User services
export const userService = {
  getAllUsers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.filter && params.filter !== 'all') queryParams.append('filter', params.filter);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page);
    
    const url = `/users/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return api.get(url);
  },
  getUserDetails: (userId) => api.get(`/users/${userId}`),
};

export default api; 