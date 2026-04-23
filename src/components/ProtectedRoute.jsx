import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| PROTECTED ROUTE ||============================== //
// Bọc các route cần đăng nhập. Chưa login → chuyển về /login

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}
