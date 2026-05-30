import api from './axiosConfig';

// `params` is { page, pageSize, search }. Axios serializes it as a query string.
// Response shape: { items, page, pageSize, totalCount, totalPages }.
export const getAllClients = (params = {}) => api.get('/Clients', { params });
export const getClientById = (id) => api.get(`/Clients/${id}`);
export const getClientByCNP = (cnp) => api.get(`/Clients/cnp/${cnp}`);
export const createClient = (data) => api.post('/Clients', data);
export const updateClient = (id, data) => api.post(`/Clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/Clients/${id}`);