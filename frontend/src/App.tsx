import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';
import { SWRConfig } from 'swr';
import { PWAProvider } from './context/PWAContext';

// Layout
import Sidebar from './components/Sidebar';
const AIChat = lazy(() => import('./components/AIChat'));

// Pages (Lazy loaded for lighting fast initial payload)
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Books = lazy(() => import('./pages/Books'));
const Students = lazy(() => import('./pages/Students'));
const Guests = lazy(() => import('./pages/Guests'));
const Circulation = lazy(() => import('./pages/Circulation'));

// Loading skeleton for smooth page transitions
const PageSkeleton = () => (
  <div className="flex-1 p-6 md:p-8 animate-pulse space-y-6">
    <div className="h-10 bg-slate-200/60 rounded-xl w-48"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-32 bg-slate-200/50 rounded-2xl"></div>
      <div className="h-32 bg-slate-200/50 rounded-2xl"></div>
      <div className="h-32 bg-slate-200/50 rounded-2xl"></div>
    </div>
    <div className="h-80 bg-slate-200/40 rounded-2xl"></div>
  </div>
);

// Use relative path for Vercel unified deployment
axios.defaults.baseURL = '/api';

// Request interceptor: always attach token if present
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: redirect on 401 only if not already on /login and not logging in
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/admin/login');
    const isLoginPage = window.location.pathname === '/login';

    if (error.response?.status === 401 && !isLoginEndpoint && !isLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { token, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative gradient blobs for glassmorphism backdrop with GPU acceleration */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none transform-gpu will-change-transform"></div>
      <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none transform-gpu will-change-transform" style={{ animationDelay: '2000ms' }}></div>
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none transform-gpu will-change-transform" style={{ animationDelay: '4000ms' }}></div>
      
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col pt-16 md:pt-0">
        {children}
      </div>
      <Suspense fallback={null}>
        <AIChat />
      </Suspense>
    </div>
  );
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { role } = useAuth();
  if (role !== 'admin' && role !== 'coordinator') return <Navigate to="/circulation" replace />;
  return <>{children}</>;
};

const AdminOrLeaderRoute = ({ children }: { children: ReactNode }) => {
  const { role } = useAuth();
  if (role !== 'admin' && role !== 'coordinator' && role !== 'leader' && role !== 'senior_leader') return <Navigate to="/circulation" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <PWAProvider>
        <SWRConfig value={{ 
          fetcher: (url: string) => axios.get(url).then(res => res.data),
          revalidateOnFocus: false, // Prevents excessive refetching
          dedupingInterval: 5000 // Deduplicate requests within 5 seconds
        }}>
          <Router>
            <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/books" element={<ProtectedRoute><AdminOrLeaderRoute><Books /></AdminOrLeaderRoute></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><AdminRoute><Students /></AdminRoute></ProtectedRoute>} />
                <Route path="/guests" element={<ProtectedRoute><AdminRoute><Guests /></AdminRoute></ProtectedRoute>} />
                <Route path="/circulation" element={<ProtectedRoute><Circulation /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </Router>
        </SWRConfig>
      </PWAProvider>
    </AuthProvider>
  );
}

export default App;
