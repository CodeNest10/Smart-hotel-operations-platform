import { useState, useEffect, useCallback } from 'react';
import { getAllRooms } from '../api/reservationApi';

/**
 * Fetches all rooms and polls every `intervalMs` ms.
 * @param {number} intervalMs - polling interval (default 5000)
 */
function useRooms(intervalMs = 5000) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await getAllRooms();
      setRooms(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    const id = setInterval(fetchRooms, intervalMs);
    return () => clearInterval(id);
  }, [fetchRooms, intervalMs]);

  return { rooms, loading, error, refetch: fetchRooms };
}

export default useRooms;
