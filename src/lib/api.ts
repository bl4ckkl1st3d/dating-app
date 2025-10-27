import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 [API] API Base URL:', API_BASE_URL);
console.log('🔗 [API] Env VITE_API_URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📤 [API] Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    headers: config.headers
  });
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 [API] Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config?.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('📥 [API] Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;
