import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Phải có quyền hotel_owner hoặc admin
  if (user && user.role !== 'hotel_owner' && user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
