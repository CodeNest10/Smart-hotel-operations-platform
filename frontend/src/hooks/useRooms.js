import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllRooms } from '../api/reservationApi';

const BASE = process.env.REACT_APP_API_BASE || 'http://localhost';

/**
 * Rooms hook — hybrid real-time strategy.
 *
 *   1. Initial REST fetch of all rooms.
 *   2. Subscribe to SSE `/api/analytics/stream/rooms` for per-room deltas.
 *      Each event is expected to be `{ id, status, ... }` — the updated room
 *      is patched in-place so only that card re-renders.
 *   3. If the SSE stream drops, fall back to REST polling at `pollMs`
 *      (default 15 s). Polling stops again as soon as SSE reconnects.
 *
 * @param {number} pollMs - fallback poll interval when SSE is offline
 */
function useRooms(pollMs = 15000) {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [lastUpdatedId, setLastUpdatedId] = useState(null);

  const esRef     = useRef(null);
  const retryRef  = useRef(1000);
  const pollIdRef = useRef(null);
  const cancelledRef = useRef(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await getAllRooms();
      if (cancelledRef.current) return;
      setRooms(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      if (!cancelledRef.current) setError('Failed to load rooms');
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, []);

  // Merge a single room update into the list.
  const patchRoom = useCallback((patch) => {
    if (!patch || !patch.id) return;
    setRooms((prev) => {
      const idx = prev.findIndex((r) => r.id === patch.id);
      if (idx === -1) return [...prev, patch];
      const next = prev.slice();
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
    setLastUpdatedId(patch.id);
  }, []);

  // Start / stop the REST poll fallback.
  const startPolling = useCallback(() => {
    if (pollIdRef.current) return;
    pollIdRef.current = setInterval(fetchRooms, pollMs);
  }, [fetchRooms, pollMs]);

  const stopPolling = useCallback(() => {
    if (pollIdRef.current) {
      clearInterval(pollIdRef.current);
      pollIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    // 1. initial snapshot
    fetchRooms();

    // 2. SSE stream with exponential backoff + poll fallback
    const connect = () => {
      if (cancelledRef.current) return;
      let es;
      try {
        es = new EventSource(`${BASE}/api/analytics/stream/rooms`);
      } catch {
        startPolling();
        return;
      }
      esRef.current = es;

      es.onopen = () => {
        setStreaming(true);
        retryRef.current = 1000;
        stopPolling();
      };

      es.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          // Accept either a full snapshot (array) or a single-room patch.
          if (Array.isArray(payload)) {
            setRooms(payload);
          } else if (payload && payload.id) {
            patchRoom(payload);
          } else if (payload && Array.isArray(payload.rooms)) {
            setRooms(payload.rooms);
          }
        } catch {
          /* ignore malformed frames */
        }
      };

      es.onerror = () => {
        setStreaming(false);
        es.close();
        startPolling(); // keep data fresh while SSE is down
        const delay = retryRef.current;
        retryRef.current = Math.min(delay * 2, 30000);
        setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelledRef.current = true;
      esRef.current?.close();
      stopPolling();
    };
  }, [fetchRooms, patchRoom, startPolling, stopPolling]);

  return {
    rooms,
    loading,
    error,
    streaming,
    lastUpdatedId,
    refetch: fetchRooms,
  };
}

export default useRooms;
