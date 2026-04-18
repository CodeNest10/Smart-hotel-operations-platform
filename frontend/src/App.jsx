import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HotelProvider } from './context/HotelContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RoomGrid from './pages/RoomGrid';
import Reservations from './pages/Reservations';
import HousekeepingQueue from './pages/HousekeepingQueue';
import GuestRequests from './pages/GuestRequests';
import './index.css';

function App() {
  return (
    <HotelProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/rooms"        element={<RoomGrid />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/housekeeping" element={<HousekeepingQueue />} />
            <Route path="/requests"     element={<GuestRequests />} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </HotelProvider>
  );
}

export default App;
