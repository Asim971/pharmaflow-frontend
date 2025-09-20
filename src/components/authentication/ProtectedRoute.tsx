import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { verifyToken } from '../../store/auth/authSlice';
import { PharmaceuticalUserRole } from '../../types/authentication';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: PharmaceuticalUserRole[];
  fallbackPath?: string;
  requireDGDACompliance?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  fallbackPath = '/login',
  requireDGDACompliance = false,
}: ProtectedRouteProps) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state: { auth: any }) => state.auth);
  const location = useLocation();

  useEffect(() => {
    // Verify token on route access if we have a token but no user
    const token = localStorage.getItem('pharma_access_token');
    if (token && !user && !isLoading) {
      dispatch(verifyToken());
    }
  }, [dispatch, user, isLoading]);

  // Show loading spinner while verifying authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
        p={3}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          You don't have the required permissions to access this page.
          <br />
          Required roles: {requiredRoles.join(', ')}
          <br />
          Your role: {user.role}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Please contact your system administrator if you believe this is an error.
        </Typography>
      </Box>
    );
  }

  // Check DGDA compliance requirement
  if (requireDGDACompliance && user.companyId) {
    // In a real app, this would check against DGDA compliance status
    // For now, we'll assume all authenticated users are compliant
    const isDGDACompliant = true;
    
    if (!isDGDACompliant) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={2}
          p={3}
        >
          <Typography variant="h5" color="warning.main" gutterBottom>
            DGDA Compliance Required
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            This feature requires DGDA compliance certification.
            <br />
            Please ensure your company has the necessary DGDA approvals.
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Contact your compliance officer for assistance.
          </Typography>
        </Box>
      );
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

interface PublicRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

export const PublicRoute = ({
  children,
  redirectPath = '/dashboard',
}: PublicRouteProps) => {
  const { isAuthenticated } = useAppSelector((state: { auth: any }) => state.auth);

  // Redirect authenticated users away from public routes (like login)
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};