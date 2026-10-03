import React from 'react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Global App Providers Wrapper Component
 */
export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
}

export default AppProviders;
