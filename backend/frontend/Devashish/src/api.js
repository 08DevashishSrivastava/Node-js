import axios from 'axios';

export const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

export default api;
