import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const status = useSelector((state) => state.auth.status);

  // If the user is not authenticated, redirect to the login page

  if (status === undefined) {
    return <div>Loading...</div>; // Prevents unwanted redirects
  }
  
  if (!status) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;