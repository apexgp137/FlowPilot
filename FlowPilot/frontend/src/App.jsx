import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { Institutions } from './pages/Institutions';
import { Compliance } from './pages/Compliance';
import { EVCScheduling } from './pages/EVCScheduling';
import { Alerts } from './pages/Alerts';
import { WorkflowHistory } from './pages/WorkflowHistory';
import { DocumentCheck } from './pages/DocumentCheck';
import { AuditTrail } from './pages/AuditTrail';
import { UserManagement } from './pages/UserManagement';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Administrative Routes inside DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/institutions" element={<Institutions />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/evc" element={<EVCScheduling />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/workflow-history" element={<WorkflowHistory />} />
            <Route path="/document-check" element={<DocumentCheck />} />

            {/* Admin and Official Only */}
            <Route
              path="/audit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OFFICIAL']}>
                  <AuditTrail />
                </ProtectedRoute>
              }
            />

            {/* Admin Only */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
