import api from './axiosConfig';

// Rooms
export const getAllRooms = () => api.get('/api/rooms');
export const getAvailableRooms = (type) =>
  api.get('/api/rooms/available', { params: type ? { type } : {} });
export const addRoom = (roomData) => api.post('/api/rooms', roomData);

// Reservations
export const getTodayReservations = () => api.get('/api/reservations/today');
export const createReservation = (data) => api.post('/api/reservations', data);
export const checkIn = (id) => api.put(`/api/reservations/${id}/checkin`);
export const checkOut = (id) => api.put(`/api/reservations/${id}/checkout`);
