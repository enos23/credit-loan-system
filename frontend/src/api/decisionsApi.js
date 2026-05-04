import api from './axiosConfig';

export const getDecisionById = (id) => api.get(`/Decisions/${id}`);
export const getDecisionsByCreditRequest = (creditRequestId) => api.get(`/Decisions/creditRequest/${creditRequestId}`);
export const createDecision = (data) => api.post('/Decisions', data);