import api from './axiosConfig';

export const getTransactions = () => api.get('/Transactions');
