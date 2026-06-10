import React from 'react';
import { Navigate } from 'react-router-dom';
import { secureStorage } from '../../utils/secureStorage';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!secureStorage.getToken();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;