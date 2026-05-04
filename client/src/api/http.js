import axios from 'axios';

function normalizeApiBaseUrl(input) {
  if (!input) return null;

  let value = input.trim();
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  const url = new URL(value);
  const pathname = url.pathname.replace(/\/+$/, '');

  if (!pathname || pathname === '') {
    url.pathname = '/api';
  } else if (!pathname.endsWith('/api')) {
    url.pathname = `${pathname}/api`;
  }

  return url.toString().replace(/\/+$/, '');
}

const baseURL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL) || '/api';

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL is not set in production. API calls will use /api and may fail without a rewrite.');
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
