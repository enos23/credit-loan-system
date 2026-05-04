import api from './axiosConfig';

export const login = (data) => api.post('/Auth/login', data);
export const register = (data) => api.post('/Auth/register', data);