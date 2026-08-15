import { useState, useRef } from 'react';
import useSWR from 'swr';
import { Book, Users, CheckCircle, Clock, Trophy, TrendingUp, Filter, ChevronDown, Download, BarChart2, PieChart as PieChartIcon, Image as ImageIcon, FileSpreadsheet, Activity, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import html2canvas from 'html2canvas';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#10b981', '#14b8a6', '#06b6d4'];

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  
  const [dateRange, setDateRange] = useState('all-time');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'pie' | 'vbar' | 'line'>('list');
  
  const [exportMenuOpen, setExportMenuOpen] = useState<'readers'|'books'|null>(null);
  
  const readersChartRef = useRef<HTMLDivElement>(null);
  const booksChartRef = useRef<HTMLDivElement>(null);

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
      <div className="space-y-4 h-80 overflow-y-auto pr-2 custom-scrollbar">
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

  const renderPieChart = (data: any[], titleKey: string, valKey: string) => {
    if (data.length === 0) {
      return <div className="text-slate-400 p-4 text-center">No data available for this period.</div>;
    }
    const top10 = data.slice(0, 10);
    return (
      <div className="h-80 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={top10}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              dataKey={valKey}
              nameKey={titleKey}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                if (percent < 0.05) return null;
                return (
                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {top10.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderVerticalBarChart = (data: any[], titleKey: string, valKey: string, color: string) => {
    if (data.length === 0) return <div className="text-slate-400 p-4 text-center">No data available.</div>;
    const top10 = data.slice(0, 10);
    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top10} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey={titleKey} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              angle={-45} 
              textAnchor="end"
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey={valKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderLineChart = (data: any[], titleKey: string, valKey: string, color: string) => {
    if (data.length === 0) return <div className="text-slate-400 p-4 text-center">No data available.</div>;
    const top10 = data.slice(0, 10);
    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={top10} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey={titleKey} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              angle={-45} 
              textAnchor="end"
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            />
            <Line type="monotone" dataKey={valKey} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const maxReadersCount = Math.max(...(analytics?.topReaders?.map((r: any) => r.count) || [0]), 1);
  const maxBooksCount = Math.max(...(analytics?.popularBooks?.map((b: any) => b.count) || [0]), 1);

  const downloadCSV = (data: any[], filename: string, titleKey: string, valKey: string) => {
    const top10 = data.slice(0, 10);
    const headers = [titleKey.charAt(0).toUpperCase() + titleKey.slice(1), 'Count'];
    const rows = top10.map(item => [
      `"${item[titleKey]}"`,
      item[valKey]
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMenuOpen(null);
  };

  const downloadImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    try {
      const canvas = await html2canvas(ref.current, { backgroundColor: '#ffffff', scale: 2 });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Error generating image", error);
    }
    setExportMenuOpen(null);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto relative z-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 drop-shadow-sm">Dashboard Overview</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-white/70 backdrop-blur-md p-1 rounded-xl shadow-sm border border-white">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('vbar')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'vbar' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Bar Chart View"
            >
              <BarChart2 size={18} />
            </button>
            <button
              onClick={() => setViewMode('pie')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'pie' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Pie Chart View"
            >
              <PieChartIcon size={18} />
            </button>
            <button
              onClick={() => setViewMode('line')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'line' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Line Chart View"
            >
              <Activity size={18} />
            </button>
          </div>

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
        <div ref={readersChartRef} className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-200/40 border border-white/60 p-6 flex flex-col relative">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Trophy size={22} className="text-amber-500" /> 
              Top Readers
            </h2>
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(exportMenuOpen === 'readers' ? null : 'readers')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
              >
                <Download size={14} /> Export <ChevronDown size={12} />
              </button>
              {exportMenuOpen === 'readers' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(null)}></div>
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-xl border border-slate-100 z-50 overflow-hidden text-sm">
                    <button onClick={() => downloadCSV(analytics?.topReaders || [], 'top_10_readers', 'name', 'count')} className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-medium">
                      <FileSpreadsheet size={16} className="text-emerald-500" /> CSV Data
                    </button>
                    <button onClick={() => downloadImage(readersChartRef, 'top_readers_chart')} className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-medium border-t border-slate-50">
                      <ImageIcon size={16} className="text-blue-500" /> Image (PNG)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {isLoadingAnalytics ? (
            <div className="h-80 flex justify-center items-center">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : viewMode === 'pie' ? (
            renderPieChart(analytics?.topReaders || [], 'name', 'count')
          ) : viewMode === 'vbar' ? (
            renderVerticalBarChart(analytics?.topReaders || [], 'name', 'count', '#6366f1')
          ) : viewMode === 'line' ? (
            renderLineChart(analytics?.topReaders || [], 'name', 'count', '#6366f1')
          ) : (
            renderBarChart(analytics?.topReaders || [], maxReadersCount, 'name', 'count', 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]')
          )}
        </div>

        <div ref={booksChartRef} className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-200/40 border border-white/60 p-6 flex flex-col relative">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={22} className="text-emerald-500" /> 
              Most Popular Books
            </h2>
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(exportMenuOpen === 'books' ? null : 'books')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
              >
                <Download size={14} /> Export <ChevronDown size={12} />
              </button>
              {exportMenuOpen === 'books' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(null)}></div>
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-xl border border-slate-100 z-50 overflow-hidden text-sm">
                    <button onClick={() => downloadCSV(analytics?.popularBooks || [], 'top_10_books', 'title', 'count')} className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-medium">
                      <FileSpreadsheet size={16} className="text-emerald-500" /> CSV Data
                    </button>
                    <button onClick={() => downloadImage(booksChartRef, 'popular_books_chart')} className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-medium border-t border-slate-50">
                      <ImageIcon size={16} className="text-blue-500" /> Image (PNG)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {isLoadingAnalytics ? (
            <div className="h-80 flex justify-center items-center">
              <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          ) : viewMode === 'pie' ? (
            renderPieChart(analytics?.popularBooks || [], 'title', 'count')
          ) : viewMode === 'vbar' ? (
            renderVerticalBarChart(analytics?.popularBooks || [], 'title', 'count', '#10b981')
          ) : viewMode === 'line' ? (
            renderLineChart(analytics?.popularBooks || [], 'title', 'count', '#10b981')
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
