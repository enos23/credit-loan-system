import api from './axiosConfig';

export const login = (data) => api.post('/Auth/login', data);
export const updateProfile = (data) => api.put('/Auth/profile', data);
export const forgotPassword = (email) => api.post('/Auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/Auth/reset-password', { token, newPassword });
export const changePassword = (currentPassword, newPassword) => api.post('/Auth/change-password', { currentPassword, newPassword });