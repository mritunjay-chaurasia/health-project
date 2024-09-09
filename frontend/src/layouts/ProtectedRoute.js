import React from 'react';
import { Navigate } from 'react-router-dom';
import {USER_TOKEN} from '../constants/index';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem(USER_TOKEN);

  return token ? children : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
