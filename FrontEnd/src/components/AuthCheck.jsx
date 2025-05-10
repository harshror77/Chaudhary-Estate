import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Home from '../components/Home.jsx';
import LoginHomePage from '../pages/LoginHomePage.jsx';

const AuthCheck = () => {
  const isAuthenticated = useSelector(state => state.auth.status);
  
  if (isAuthenticated) {
    return <LoginHomePage />;
  } else {
    return <Home />;
  }
};

export default AuthCheck;