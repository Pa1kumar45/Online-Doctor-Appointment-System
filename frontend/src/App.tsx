import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LoginInfoBanner from './components/LoginInfoBanner';
import DoctorList from './pages/DoctorList';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import SessionManagement from './pages/SessionManagement';
import PatientAppointments from './pages/PatientAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import PatientProfile from './pages/PatientProfile';
import DoctorPage from './pages/DoctorPage';
import AdminDashboard from './pages/AdminDashboard';
import { isAdmin } from './utils/auth';

interface GetCurrentUserResponse {
  data: {
    data: any; // Replace with proper user type if available
    success: boolean;
    message: string;
  }
}

/**
 * Protected Admin Route Component
 * Ensures only admin users can access admin pages
 */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { currentUser, setCurrentUser, getCurrentUser, loginInfo, hideLoginInfoToast } = useApp();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await getCurrentUser() as GetCurrentUserResponse;
        if (response?.data?.data) {
          setCurrentUser(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        {/* Login Info Banner - shows at top when available */}
        {loginInfo && (
          <LoginInfoBanner 
            loginInfo={loginInfo} 
            onClose={hideLoginInfoToast}
          />
        )}
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<DoctorList />} />
          <Route path="/signup" element={!currentUser ? <SignUp /> : <Navigate to="/" />} />
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/admin/login" element={!currentUser ? <AdminLogin /> : <Navigate to="/admin" />} />
          <Route path="/forgot-password" element={!currentUser ? <ForgotPassword /> : <Navigate to="/" />} />
          <Route path="/doctor/:id" element={<DoctorPage />} />

          {/* Protected user routes */}
          {currentUser ? (
            <>
              <Route
                path="/appointments"
                element={
                  currentUser?.role === 'patient' ? <PatientAppointments /> : <DoctorDashboard />
                }
              />
              <Route
                path="/profile"
                element={
                  currentUser?.role === 'doctor' ? <DoctorProfile /> : <PatientProfile />
                }
              />
              <Route path="/sessions" element={<SessionManagement />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" />} />
          )}

          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;