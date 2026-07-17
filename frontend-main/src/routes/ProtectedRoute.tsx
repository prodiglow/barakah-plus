import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Example auth check (replace with your actual logic)
const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // or use context, Redux, etc.
};

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  return isAuthenticated() ? <Outlet /> : <Navigate to="/home-baraka" state={{ from: location }} replace />;
};

export default ProtectedRoute;
