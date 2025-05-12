import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '@context/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';

/**
 * AuthGuard component to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
const AuthGuard = () => {
  const { user, loading } = useContext(AuthContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default AuthGuard;