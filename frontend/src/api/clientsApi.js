import api from './axiosConfig';

export const getAllClients = () => api.get('/Clients');
export const getClientById = (id) => api.get(`/Clients/${id}`);
export const getClientByCNP = (cnp) => api.get(`/Clients/cnp/${cnp}`);
export const createClient = (data) => api.post('/Clients', data);
export const updateClient = (id, data) => api.post(`/Clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/Clients/${id}`);