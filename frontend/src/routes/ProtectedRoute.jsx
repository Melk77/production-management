import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route with authentication + optional role guard.
 *
 * @param {string[]} [allowedRoles] - If provided, only users whose role is in
 *   this list will be allowed through. Others are redirected to /dashboard.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
