import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Finances from './pages/finances/Finances';
import Calendar from './pages/calendar/Calendar';
import Workouts from './pages/workouts/Workouts';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';
import RecurringEventProcessor from './components/RecurringEventProcessor';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Componente AppContent que inclui o processador de eventos recorrentes
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      {isAuthenticated && <RecurringEventProcessor />}
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="finances" element={<Finances />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;