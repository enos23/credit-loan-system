import api from './axiosConfig';

export const getAllCreditRequests = () => api.get('/CreditRequests');
export const getCreditRequestById = (id) => api.get(`/CreditRequests/${id}`);
export const getCreditRequestsByClient = (clientId) => api.get(`/CreditRequests/client/${clientId}`);
export const createCreditRequest = (data) => api.post('/CreditRequests', data);
export const updateCreditRequestStatus = (id, status) => api.patch(`/CreditRequests/${id}/status`, { status });