import api from './axiosConfig';

// `params` is { page, pageSize, search }. Response shape:
// { items, page, pageSize, totalCount, totalPages }.
export const getAllCreditRequests = (params = {}) => api.get('/CreditRequests', { params });
export const getCreditRequestById = (id) => api.get(`/CreditRequests/${id}`);
export const getCreditRequestsByClient = (clientId) => api.get(`/CreditRequests/client/${clientId}`);
export const createCreditRequest = (data) => api.post('/CreditRequests', data);
export const updateCreditRequestStatus = (id, status) => api.patch(`/CreditRequests/${id}/status`, { status });