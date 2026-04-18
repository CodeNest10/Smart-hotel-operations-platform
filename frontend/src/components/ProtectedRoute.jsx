import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Route gate. Two responsibilities:
 *   1. Block unauthenticated users → redirect to /login, preserving the
 *      attempted path via `location.state.from`.
 *   2. Enforce role restrictions. Pass `roles={['MANAGER']}` (or an array)
 *      to restrict. Unauthorized users get a friendly 403 card instead of
 *      a redirect loop.
 */
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, hasRole, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(roles)) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 440,
            background: '#fff',
            border: '1px solid #EBEBEB',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
            boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
          }}
        >
          <div
            style={{
              width: 56, height: 56, margin: '0 auto 14px',
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#B45309',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Lock size={26} />
          </div>
          <h2 style={{ marginBottom: 6, color: '#0F172A' }}>Access restricted</h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Your role (<strong>{user?.role}</strong>) doesn't have permission
            to view this page. Ask a manager if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
