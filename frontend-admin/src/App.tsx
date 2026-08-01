import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminDashboard from './components/AdminDashboard'
import AddScholarPage from './components/AddScholarPage'
import Footer from './components/Footer'
import Header from './components/Header'
import LoginPage from './components/LoginPage'
import OrderInformation from './components/OrderInformation'
import ScholarReport from './components/ScholarReport'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import ResetPasswordPage from './components/ResetPasswordPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isOrderInformationPage = location.pathname.startsWith('/order/');
  const isResetPasswordPage = location.pathname.startsWith('/reset-password');
  const isScholarReportPage = location.pathname.startsWith('/scholar-report/');

  // Allow access to order information page and reset password page without authentication
  if (isOrderInformationPage || isResetPasswordPage || isScholarReportPage) {
    return (
      <Routes>
        <Route path="/order/:orderId" element={<OrderInformation />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/scholar-report/:scholarId" element={<ScholarReport />} />
      </Routes>
    );
  }

  // Require authentication for other routes
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard/scholars" replace />} />
        <Route path="/admin/dashboard/scholars" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/orders" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/users" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/payments" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/manage-scholars" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/scholar-reviews" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/platform-reviews" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/duas" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/categories" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/events" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/add-scholar" element={<AddScholarPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard/scholars" replace />} />
      </Routes>
      <Footer />
    </>
  );
};

import { AlertDialogProvider } from './contexts/AlertDialogContext';

function App() {
  return (
    <AuthProvider>
      <AlertDialogProvider>
        <Router>
          <AppContent />
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </AlertDialogProvider>
    </AuthProvider>
  );
}

export default App
