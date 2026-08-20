import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || sessionStorage.getItem('role') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || sessionStorage.getItem('username') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [token]);

  const login = (newToken: string, newRole: string, newUsername: string) => {
    // Clear both storages first to prevent conflicts
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');

    // Admin and Coordinator persist across browser restarts
    if (newRole === 'admin' || newRole === 'coordinator') {
      localStorage.setItem('token', newToken);
      localStorage.setItem('role', newRole);
      localStorage.setItem('username', newUsername);
    } else {
      // Student and Leader log out when tab/browser is closed
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('role', newRole);
      sessionStorage.setItem('username', newUsername);
    }
    
    setToken(newToken);
    setRole(newRole);
    setUsername(newUsername);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');
    setToken(null);
    setRole('');
    setUsername('');
  };

  return (
    <AuthContext.Provider value={{ token, role, username, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
