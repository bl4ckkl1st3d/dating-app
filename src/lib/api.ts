// src/lib/api.ts
import axios from 'axios';

// Existing API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

// *** NEW: Export the Server Base URL ***
// Derives 'http://localhost:5000' from 'http://localhost:5000/api'
// Handles cases where VITE_API_URL might have a trailing slash or not include '/api'
const url = new URL(API_BASE_URL);
export const SERVER_BASE_URL = `${url.protocol}//${url.host}`;
// *** END NEW ***

console.log('🔗 [API] API Base URL:', API_BASE_URL);
console.log('🔗 [API] Server Base URL:', SERVER_BASE_URL); // Log the derived server URL
console.log('🔗 [API] Env VITE_API_URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors remain the same...
// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Optional: Remove detailed logging in production
  // console.log('📤 [API] Request:', {
  //   method: config.method?.toUpperCase(),
  //   url: config.url,
  //   baseURL: config.baseURL,
  //   headers: config.headers
  // });
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    // Optional: Remove detailed logging in production
    // console.log('📥 [API] Response:', {
    //   status: response.status,
    //   statusText: response.statusText,
    //   url: response.config?.url,
    //   data: response.data
    // });
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
      // Redirect to login page - consider handling this more globally
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default api;