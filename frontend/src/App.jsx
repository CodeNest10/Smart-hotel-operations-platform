import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HotelProvider } from './context/HotelContext';
import { AuthProvider, ROLES } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoomGrid from './pages/RoomGrid';
import Reservations from './pages/Reservations';
import HousekeepingQueue from './pages/HousekeepingQueue';
import GuestRequests from './pages/GuestRequests';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HotelProvider>
          <ToastProvider>
            <BrowserRouter>
              <Navbar />
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />

                {/* Protected — all roles */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rooms"
                  element={
                    <ProtectedRoute>
                      <RoomGrid />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests"
                  element={
                    <ProtectedRoute>
                      <GuestRequests />
                    </ProtectedRoute>
                  }
                />

                {/* Protected — manager + front desk */}
                <Route
                  path="/reservations"
                  element={
                    <ProtectedRoute roles={[ROLES.MANAGER, ROLES.FRONT_DESK]}>
                      <Reservations />
                    </ProtectedRoute>
                  }
                />

                {/* Protected — manager + housekeeping */}
                <Route
                  path="/housekeeping"
                  element={
                    <ProtectedRoute roles={[ROLES.MANAGER, ROLES.HOUSEKEEPING]}>
                      <HousekeepingQueue />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </HotelProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
