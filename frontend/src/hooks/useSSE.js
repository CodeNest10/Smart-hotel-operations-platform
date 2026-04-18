import { useState, useEffect, useRef } from 'react';

const BASE = process.env.REACT_APP_API_BASE || 'http://localhost';

/**
 * Opens an EventSource connection and parses JSON data.
 * Automatically reconnects on error with exponential backoff.
 *
 * @param {string} path  - e.g. '/api/analytics/stream/occupancy'
 * @returns {{ data: object|null, connected: boolean, error: string|null }}
 */
function useSSE(path) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const esRef = useRef(null);
  const retryRef = useRef(1000);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const es = new EventSource(`${BASE}${path}`);
      esRef.current = es;

      es.onopen = () => {
        setConnected(true);
        setError(null);
        retryRef.current = 1000;
      };

      es.onmessage = (e) => {
        try {
          setData(JSON.parse(e.data));
        } catch {
          setData(e.data);
        }
      };

      es.onerror = () => {
        setConnected(false);
        setError('Connection lost — retrying…');
        es.close();
        const delay = retryRef.current;
        retryRef.current = Math.min(delay * 2, 30000);
        setTimeout(connect, delay);
      };
    }

    connect();
    return () => {
      cancelled = true;
      esRef.current?.close();
    };
  }, [path]);

  return { data, connected, error };
}

export default useSSE;
