import { useState } from 'react';
import useSWR from 'swr';
import { Book, Users, CheckCircle, Clock, Trophy, TrendingUp, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  
  const [dateRange, setDateRange] = useState('all-time');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const options = [
    { value: 'all-time', label: 'All Time' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];
  
  const { data: stats = { totalBooks: 0, totalStudents: 0, issuedBooks: 0, availableBooks: 0 } } = useSWR('/dashboard/stats');
  const { data: logins = [], isLoading: isLoadingLogins } = useSWR(role === 'admin' ? '/dashboard/logins' : null);

  // Generate query params for analytics
  let query = '';
  if (dateRange === 'this-month') {
    const start = new Date();
    start.setDate(1);
    query = `?startDate=${start.toISOString().split('T')[0]}`;
  } else if (dateRange === 'last-7-days') {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    query = `?startDate=${start.toISOString().split('T')[0]}`;
  } else if (dateRange === 'custom' && customStart) {
    query = `?startDate=${customStart}${customEnd ? `&endDate=${customEnd}` : ''}`;
  }

  const { data: analytics = { topReaders: [], popularBooks: [] }, isLoading: isLoadingAnalytics } = useSWR(`/dashboard/analytics${query}`);

  const cards = [
    { title: 'Total Books', value: stats.totalBooks, icon: Book, color: 'text-indigo-600', bg: 'bg-indigo-100', link: '/books' },
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', link: '/students' },
    { title: 'Books Issued', value: stats.issuedBooks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', link: '/circulation' },
    { title: 'Available Copies', value: stats.availableBooks, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', link: '/books' },
  ];

  // Helper to render horizontal bars
  const renderBarChart = (data: any[], maxVal: number, titleKey: string, valKey: string, color: string) => {
    if (data.length === 0) {
      return <div className="text-slate-400 p-4 text-center">No data available for this period.</div>;
    }
    return (
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {data.map((item, idx) => {
          const percentage = maxVal === 0 ? 0 : (item[valKey] / maxVal) * 100;
          return (
            <div key={idx} className="relative group">
              <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span className="truncate pr-4">{idx + 1}. {item[titleKey]}</span>
                <span className="shrink-0 font-bold">{item[valKey]}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const maxReadersCount = Math.max(...(analytics?.topReaders?.map((r: any) => r.count) || [0]), 1);
  const maxBooksCount = Math.max(...(analytics?.popularBooks?.map((b: any) => b.count) || [0]), 1);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto relative z-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 drop-shadow-sm">Dashboard Overview</h1>
        
        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white">
          <Filter size={18} className="text-slate-400 ml-2" />
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-transparent border-none text-sm font-bold text-slate-700 hover:text-indigo-600 focus:outline-none transition-colors"
            >
              {options.find(o => o.value === dateRange)?.label}
              <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/60 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setDateRange(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors hover:bg-indigo-50/80 ${dateRange === opt.value ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-1">
              <input 
                type="date" 
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="text-xs font-bold text-slate-600 border border-slate-200/60 bg-white/50 backdrop-blur-sm p-1.5 rounded-md focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none"
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input 
                type="date" 
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="text-xs font-bold text-slate-600 border border-slate-200/60 bg-white/50 backdrop-blur-sm p-1.5 rounded-md focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <div 
            key={i} 
            onClick={() => navigate(c.link)}
            className="bg-white/70 backdrop-blur-2xl rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-white/60 flex items-center gap-5 cursor-pointer hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className={`p-4 rounded-xl ${c.bg} ${c.color} bg-opacity-70 group-hover:scale-110 transition-transform duration-300`}>
              <c.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{c.title}</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 drop-shadow-sm">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-200/40 border border-white/60 p-6 flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Trophy size={22} className="text-amber-500" /> 
            Top Readers
          </h2>
          {isLoadingAnalytics ? (
            <div className="flex-1 flex justify-center items-center py-10">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            renderBarChart(analytics?.topReaders || [], maxReadersCount, 'name', 'count', 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]')
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-200/40 border border-white/60 p-6 flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <TrendingUp size={22} className="text-emerald-500" /> 
            Most Popular Books
          </h2>
          {isLoadingAnalytics ? (
            <div className="flex-1 flex justify-center items-center py-10">
              <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            renderBarChart(analytics?.popularBooks || [], maxBooksCount, 'title', 'count', 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]')
          )}
        </div>
      </div>

      {/* Recent Logins */}
      {role === 'admin' && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 drop-shadow-sm flex items-center gap-2">
            <Clock size={24} className="text-indigo-600" /> Recent Logins
          </h2>
          <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-200/40 border border-white/60 overflow-hidden">
            {isLoadingLogins ? (
              <div className="p-8 flex flex-col items-center justify-center space-y-3 text-slate-500">
                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p>Loading login history...</p>
              </div>
            ) : logins.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No login history found.</div>
            ) : (
              <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-white">
                    <th className="px-6 py-4 font-semibold w-1/3">Username</th>
                    <th className="px-6 py-4 font-semibold w-1/3">Role</th>
                    <th className="px-6 py-4 font-semibold w-1/3">Login Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/50 text-sm">
                  {logins.map((login: any) => (
                    <tr key={login.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-900 font-medium">{login.username}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${login.role === 'admin' ? 'bg-amber-100 text-amber-700' : login.role === 'leader' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {login.role === 'admin' ? 'COORDINATOR' : login.role === 'leader' ? 'LEADER' : 'STUDENT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(login.loginTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
