import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route guard component for requiring authentication
 */
export function PrivateRoute({ children, isAuthenticated, redirectTo = '/' }) {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}

export default PrivateRoute;
