import axios from 'axios';

// Vite replaces import.meta.env.VITE_API_URL at build time from .env.* files.
// The localhost fallback exists so a fresh checkout works without configuration;
// production builds must set VITE_API_URL explicitly.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5286/api',
});

api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    });

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
