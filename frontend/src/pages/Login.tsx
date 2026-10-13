import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Download, CheckCircle2 } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { login } = useAuth();
  const { isInstalled, installApp } = usePWA();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('/admin/login', { username, password });
      login(res.data.token, res.data.role || 'admin', res.data.username);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      const err = error as any;
      if (err?.response?.status === 401) {
        toast.error('Invalid username or password');
      } else {
        const backendError = err?.response?.data?.error;
        toast.error(`Backend Error: ${backendError || err?.message || 'Unknown'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className={`bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <img src="/logo.png" alt="Gnan Mandir Logo" className="h-24 w-auto object-contain drop-shadow-sm" />
          </div>
          <h1 className="text-xl font-serif text-black tracking-wide mt-[-4px]">Library Portal</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <input 
              type="text" 
              required 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors"
              value={username} 
              onChange={e => {
                const val = e.target.value;
                setUsername(val ? val.charAt(0).toUpperCase() + val.slice(1) : '');
              }} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors mt-2 flex justify-center items-center gap-2 disabled:opacity-70">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col items-center">
            {isInstalled ? (
              <div 
                onClick={() => toast.success('LibraryGM is installed on this device!')}
                className="w-full py-2.5 px-3 bg-emerald-50/80 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                title="LibraryGM is installed"
              >
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>App is Installed</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={installApp}
                className="w-full py-2.5 px-3 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs group"
                title="Download & install LibraryGM app"
              >
                <Download size={15} className="text-indigo-600 transition-transform group-hover:translate-y-0.5" />
                <span>Download App (PWA)</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
