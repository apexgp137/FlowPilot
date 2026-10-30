import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f8fafc',
        color: '#334155',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div className="spinner" style={{ width: '42px', height: '42px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ marginTop: '16px', fontSize: '15px', fontWeight: 500 }}>Verifying FlowPilot security credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '32px',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <ShieldAlert size={38} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          Access Restricted
        </h2>
        <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '480px', marginBottom: '24px', lineHeight: 1.6 }}>
          Your current account role (<strong>{user.role}</strong>) does not have authorization to access this administrative module.
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn-primary"
          style={{ padding: '10px 24px' }}
        >
          Return to Permitted View
        </button>
      </div>
    );
  }

  return children;
};
