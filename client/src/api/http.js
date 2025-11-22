import axios from 'axios';

// Use relative path in development (proxied), absolute in production
const baseURL = import.meta.env.MODE === 'production'
  ? 'http://localhost:5000/api'
  : '/api';

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
instance.interceptors.request.use(
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
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the calling code handle errors
    return Promise.reject(error);
  }
);

export default instance;
