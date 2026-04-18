import api from './axiosConfig';

export const getHousekeepingQueue = () => api.get('/api/housekeeping/queue');
export const updateRoomStatus = (roomId, status, staffId = null, notes = '') =>
  api.post('/api/housekeeping/update', { room_id: roomId, status, staff_id: staffId, notes });
