import api from './axiosConfig';

// Occupancy & analytics
export const getOccupancy = () => api.get('/api/analytics/occupancy');
export const getHousekeepingAnalytics = () => api.get('/api/analytics/housekeeping');

// Guest requests
export const getPendingRequests = () => api.get('/api/requests/pending');
export const submitRequest = (data) => api.post('/api/requests', data);
export const resolveRequest = (id) => api.put(`/api/requests/${id}/resolve`);
