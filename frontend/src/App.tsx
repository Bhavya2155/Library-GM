import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';

// Layout
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Students from './pages/Students';
import Guests from './pages/Guests';
import Circulation from './pages/Circulation';

// Use VITE_API_URL from Vercel, or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Strip trailing slash if present, then add /api
axios.defaults.baseURL = `${API_URL.replace(/\/$/, '')}/api`;

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative gradient blobs for glassmorphism backdrop */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" style={{ animationDelay: '2000ms' }}></div>
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" style={{ animationDelay: '4000ms' }}></div>
      
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { role } = useAuth();
  if (role !== 'admin') return <Navigate to="/circulation" replace />;
  return <>{children}</>;
};

const AdminOrLeaderRoute = ({ children }: { children: ReactNode }) => {
  const { role } = useAuth();
  if (role !== 'admin' && role !== 'leader') return <Navigate to="/circulation" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><AdminOrLeaderRoute><Books /></AdminOrLeaderRoute></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><AdminRoute><Students /></AdminRoute></ProtectedRoute>} />
          <Route path="/guests" element={<ProtectedRoute><AdminRoute><Guests /></AdminRoute></ProtectedRoute>} />
          <Route path="/circulation" element={<ProtectedRoute><Circulation /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
