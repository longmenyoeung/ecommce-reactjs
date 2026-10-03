import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route guard component for guest-only pages (e.g. login/register)
 */
export function GuestRoute({ children, isAuthenticated, redirectTo = '/' }) {
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}

export default GuestRoute;
