import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './components/LoginPage';
import ForgetPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import BookMeeting from './components/BookMeeting';
import ActiveMeeting from './components/ActiveMeeting';
import Minutes from './components/Minutes';
import AdminPanel from './components/AdminPanel';
import Rooms from './components/Rooms';
import Bookings from './components/Bookings';
import Profile from './components/Profile';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import UserList from './components/UserList';
import AddUser from './components/AddUser';

import './App.css';

// Protected Route Component with optional role-based access control
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, hasRole, getRoles } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If a specific role is required, check if user has it
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect based on user's actual role
    const userRoles = getRoles();
    const normalizedRoles = Array.isArray(userRoles) 
      ? userRoles.map(r => String(r).toLowerCase())
      : [String(userRoles).toLowerCase()];
    
    if (normalizedRoles.includes("employee")) {
      return <Navigate to="/dashboard" replace />;
    } else if (normalizedRoles.includes("guest")) {
      return <Navigate to="/rooms" replace />;
    } else {
      // Default redirect for users without specific roles
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated } = useAuth();

return (
  <Router>
    <div className="App">
      {isAuthenticated && <Header />}
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/book-meeting" element={
          <ProtectedRoute>
            <BookMeeting />
          </ProtectedRoute>
        } />

        <Route path="/meeting/:meetingId" element={
          <ProtectedRoute>
            <ActiveMeeting />
          </ProtectedRoute>
        } />
        
        <Route path="/minutes" element={
          <ProtectedRoute>
            <Minutes />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        } />
        
        <Route path="/rooms" element={
          <ProtectedRoute>
            <Rooms />
          </ProtectedRoute>
        } />
        
        <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        } />

      
        <Route path="/users/add" element={
          <ProtectedRoute>
            <AddUser />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isAuthenticated && <Footer />}
    </div>
  </Router>
);

};

// Root App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}


export default App;
