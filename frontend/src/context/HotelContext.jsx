import React, { createContext, useContext, useState, useCallback } from 'react';

const HotelContext = createContext(null);

export function HotelProvider({ children }) {
  const [occupancy, setOccupancy] = useState({
    occupancy_pct: 0,
    occupied: 0,
    available: 0,
    dirty: 0,
    cleaning: 0,
    maintenance: 0,
    alert: false,
  });
  const [roomStatuses, setRoomStatuses] = useState({}); // { roomId: status }

  const updateOccupancy = useCallback((data) => {
    setOccupancy(data);
  }, []);

  const updateRoomStatus = useCallback((roomId, status) => {
    setRoomStatuses((prev) => ({ ...prev, [roomId]: status }));
  }, []);

  return (
    <HotelContext.Provider value={{ occupancy, updateOccupancy, roomStatuses, updateRoomStatus }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used inside HotelProvider');
  return ctx;
}
