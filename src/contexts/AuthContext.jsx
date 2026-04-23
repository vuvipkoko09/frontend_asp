import { createContext, useContext, useState, useCallback } from 'react';

// ==============================|| AUTH CONTEXT ||============================== //
// Quản lý trạng thái đăng nhập toàn cục

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  // Tiện ích kiểm tra role
  const isAdmin = user?.role === 'Admin';
  const isStaff = user?.role === 'Staff';
  const isLoggedIn = !!user?.token;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isStaff, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook dùng trong các component con
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return context;
}

export default AuthContext;
