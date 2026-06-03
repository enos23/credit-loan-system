import api from './axiosConfig';

export const getPreferences = () => api.get('/preferences');
export const updatePreferences = (data) => api.put('/preferences', data);
