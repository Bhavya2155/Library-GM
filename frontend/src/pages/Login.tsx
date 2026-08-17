import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { login } = useAuth();
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
        </form>
      </div>
    </div>
  );
}
