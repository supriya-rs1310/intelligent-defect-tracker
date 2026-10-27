import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';

// ✅ Protected Route with Role Check
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // ✅ Check if user has allowed role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 8000,  // ✅ 8 seconds
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid #2d2d44',
              padding: '16px',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard - All logged-in users */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Tickets - All logged-in users */}
          <Route 
            path="/tickets" 
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } 
          />
          
          {/* My Assigned - Only DEVELOPER */}
          <Route 
            path="/my-assigned" 
            element={
              <ProtectedRoute allowedRoles={['DEVELOPER']}>
                <Dashboard initialTab="assigned" />
              </ProtectedRoute>
            } 
          />
          
          {/* Reports - Only DEVELOPER */}
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['DEVELOPER']}>
                <Dashboard initialTab="reports" />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;