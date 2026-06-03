import api from './axiosConfig';

export const getReports = () => api.get('/Reports');
