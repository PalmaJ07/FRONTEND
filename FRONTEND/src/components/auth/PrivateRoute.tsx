import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { hasPermission, getDefaultRoute } from '../../config/permissions';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { profile, isLoading } = useProfile();
  const location = useLocation();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!profile) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has permission for the current route
  if (!hasPermission(location.pathname, profile.user_type)) {
    // Redirect to default route for user's role
    return <Navigate to={getDefaultRoute(profile.user_type)} replace />;
  }

  return <>{children}</>;
}