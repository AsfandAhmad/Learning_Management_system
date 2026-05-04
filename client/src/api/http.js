import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const normalizedApiUrl = rawApiUrl
  ? rawApiUrl.replace(/\/$/, '')
  : null;

// Always prefer explicit backend URL in production via VITE_API_URL.
// `/api` fallback is only safe when a proxy/rewrite is configured.
const baseURL = normalizedApiUrl || '/api';

if (import.meta.env.PROD && !normalizedApiUrl) {
  console.warn('VITE_API_URL is not set in production. API calls will use /api and may fail without a Vercel rewrite.');
}

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
