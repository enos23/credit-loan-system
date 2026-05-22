import api from './axiosConfig';

export const getUsers = () => api.get('/Users');
export const createUser = (data) => api.post('/Users', data);
export const updateUser = (id, data) => api.put(`/Users/${id}`, data);
export const toggleUserActive = (id) => api.patch(`/Users/${id}/toggle-active`);
