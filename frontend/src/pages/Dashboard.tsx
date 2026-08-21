import { useState, useRef, useMemo } from 'react';
import useSWR from 'swr';
import { Book, Users, CheckCircle, Clock, Trophy, TrendingUp, Filter, ChevronDown, Download, BarChart2, PieChart as PieChartIcon, Image as ImageIcon, FileSpreadsheet, Activity, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';
import { formatName } from '../utils/nameFormatter';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import * as htmlToImage from 'html-to-image';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#10b981', '#14b8a6', '#06b6d4'];

const renderPieLabel = ({ cx, cy, midAngle, outerRadius, value, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  return (
    <text 
      x={x} 
      y={y} 
      fill="#64748b" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {name?.length > 15 ? name.substring(0, 15) + '...' : name} ({value})
    </text>
  );
};

const renderXAxisTick = ({ x, y, payload }: any) => {
  return (
    <text x={x} y={y} dy={16} textAnchor="end" fill="#64748b" fontSize={11} transform={`rotate(-45 ${x} ${y})`}>
      {payload.value.length > 15 ? payload.value.substring(0, 15) + '...' : payload.value}
    </text>
  );
};

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  
  const [readersDateRange, setReadersDateRange] = useState('all-time');
  const [readersCustomStart, setReadersCustomStart] = useState('');
  const [readersCustomEnd, setReadersCustomEnd] = useState('');
  const [isReadersDropdownOpen, setIsReadersDropdownOpen] = useState(false);

  const [booksDateRange, setBooksDateRange] = useState('all-time');
  const [booksCustomStart, setBooksCustomStart] = useState('');
  const [booksCustomEnd, setBooksCustomEnd] = useState('');
  const [isBooksDropdownOpen, setIsBooksDropdownOpen] = useState(false);
  const [readersViewMode, setReadersViewMode] = useState<'list' | 'pie' | 'vbar' | 'line'>('pie');
  const [booksViewMode, setBooksViewMode] = useState<'list' | 'pie' | 'vbar' | 'line'>('pie');
  
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
  // Generate query params for Readers analytics
  let readersQuery = '';
  if (readersDateRange === 'this-month') {
    const start = new Date();
    start.setDate(1);
    readersQuery = `?startDate=${start.toISOString().split('T')[0]}`;
  } else if (readersDateRange === 'last-7-days') {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    readersQuery = `?startDate=${start.toISOString().split('T')[0]}`;
  } else if (readersDateRange === 'custom' && readersCustomStart) {
    readersQuery = `?startDate=${readersCustomStart}${readersCustomEnd ? `&endDate=${readersCustomEnd}` : ''}`;
  }

  // Generate query params for Books analytics
  let booksQuery = '';
  if (booksDateRange === 'this-month') {
    const start = new Date();
    start.setDate(1);
    booksQuery = `?startDate=${start.toISOString().split('T')[0]}`;
  } else if (booksDateRange === 'last-7-days') {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    booksQuery = `?startDate=${start.toISOString().split('T')[0]}`;
  } else if (booksDateRange === 'custom' && booksCustomStart) {
    booksQuery = `?startDate=${booksCustomStart}${booksCustomEnd ? `&endDate=${booksCustomEnd}` : ''}`;
  }

  const { data: analyticsReaders = { topReaders: [], popularBooks: [] }, isLoading: isLoadingReadersAnalytics } = useSWR(`/dashboard/analytics${readersQuery}`);
  const { data: analyticsBooks = { topReaders: [], popularBooks: [] }, isLoading: isLoadingBooksAnalytics } = useSWR(`/dashboard/analytics${booksQuery}`);

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
      <div className="space-y-4 h-[26rem] overflow-y-auto pr-2 custom-scrollbar">
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
        return (
      <div className="h-[26rem] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey={valKey}
              nameKey={titleKey}
              labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              label={renderPieLabel}
            >
              {data.map((_, index) => (
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
        return (
      <div className="h-[26rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 110 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey={titleKey} 
              tick={renderXAxisTick}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
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
        return (
      <div className="h-[26rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 110 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey={titleKey} 
              tick={renderXAxisTick}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            />
            <Line type="monotone" dataKey={valKey} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const topReadersFormatted = useMemo(() => {
    return (analyticsReaders?.topReaders || []).slice(0, 10).map((r: any) => ({ ...r, name: formatName(r.name) }));
  }, [JSON.stringify(analyticsReaders?.topReaders)]);

  const popularBooksFormatted = useMemo(() => {
    return (analyticsBooks?.popularBooks || []).slice(0, 10);
  }, [JSON.stringify(analyticsBooks?.popularBooks)]);

  const maxReadersCount = Math.max(...(analyticsReaders?.topReaders?.map((r: any) => r.count) || [0]), 1);
  const maxBooksCount = Math.max(...(popularBooksFormatted.map((b: any) => b.count) || [0]), 1);

  const downloadCSV = (data: any[], filename: string, titleKey: string, valKey: string) => {
        const headers = [titleKey.charAt(0).toUpperCase() + titleKey.slice(1), 'Count'];
    const rows = data.map(item => [
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
      const dataUrl = await htmlToImage.toPng(ref.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image", error);
    }
    setExportMenuOpen(null);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto relative z-10">
      
      <div className="mb-8 relative z-50">
        <h1 className="text-3xl font-bold text-slate-900 drop-shadow-sm">Dashboard Overview</h1>
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
        <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-200/40 border border-white/60 p-6 flex flex-col relative">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Trophy size={22} className="text-amber-500" /> 
              Top Readers
            </h2>
            <div className="flex flex-wrap justify-end items-center gap-2">
              <div className="relative z-[60]">
                <button 
                  onClick={() => setIsReadersDropdownOpen(!isReadersDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm rounded-lg transition-colors border border-slate-200"
                >
                  <Filter size={14} className="text-slate-400" />
                  {options.find(o => o.value === readersDateRange)?.label}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isReadersDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isReadersDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setIsReadersDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200 py-2 z-[60]">
                      {options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setReadersDateRange(opt.value); setIsReadersDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-indigo-50/80 ${readersDateRange === opt.value ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                      {readersDateRange === 'custom' && (
                        <div className="px-3 pt-2 pb-1 border-t border-slate-100 mt-2">
                          <input 
                            type="date" 
                            value={readersCustomStart}
                            onChange={(e) => setReadersCustomStart(e.target.value)}
                            className="w-full text-xs font-medium text-slate-600 border border-slate-200 bg-slate-50 p-1.5 rounded mb-2 outline-none focus:border-indigo-500"
                          />
                          <input 
                            type="date" 
                            value={readersCustomEnd}
                            onChange={(e) => setReadersCustomEnd(e.target.value)}
                            className="w-full text-xs font-medium text-slate-600 border border-slate-200 bg-slate-50 p-1.5 rounded outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200/60 hidden sm:flex">
                <button onClick={() => setReadersViewMode('list')} className={`p-1.5 rounded-md transition-colors ${readersViewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}><List size={16} /></button>
                <button onClick={() => setReadersViewMode('vbar')} className={`p-1.5 rounded-md transition-colors ${readersViewMode === 'vbar' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}><BarChart2 size={16} /></button>
                <button onClick={() => setReadersViewMode('pie')} className={`p-1.5 rounded-md transition-colors ${readersViewMode === 'pie' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}><PieChartIcon size={16} /></button>
                <button onClick={() => setReadersViewMode('line')} className={`p-1.5 rounded-md transition-colors ${readersViewMode === 'line' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}><Activity size={16} /></button>
              </div>
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
                    <button onClick={() => downloadCSV(topReadersFormatted, 'top_10_readers', 'name', 'count')} className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-medium">
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
          </div>
          <div ref={readersChartRef} className="w-full pt-2">
            {isLoadingReadersAnalytics ? (
              <div className="h-[26rem] flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : readersViewMode === 'pie' ? (
              renderPieChart(topReadersFormatted, 'name', 'count')
            ) : readersViewMode === 'vbar' ? (
              renderVerticalBarChart(topReadersFormatted, 'name', 'count', '#6366f1')
            ) : readersViewMode === 'line' ? (
              renderLineChart(topReadersFormatted, 'name', 'count', '#6366f1')
            ) : (
              renderBarChart(topReadersFormatted, maxReadersCount, 'name', 'count', 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]')
            )}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-200/40 border border-white/60 p-6 flex flex-col relative">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={22} className="text-emerald-500" /> 
              Most Popular Books
            </h2>
            <div className="flex flex-wrap justify-end items-center gap-2">
              <div className="relative z-[60]">
                <button 
                  onClick={() => setIsBooksDropdownOpen(!isBooksDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm rounded-lg transition-colors border border-slate-200"
                >
                  <Filter size={14} className="text-slate-400" />
                  {options.find(o => o.value === booksDateRange)?.label}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isBooksDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isBooksDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setIsBooksDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200 py-2 z-[60]">
                      {options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setBooksDateRange(opt.value); setIsBooksDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-emerald-50/80 ${booksDateRange === opt.value ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-600'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                      {booksDateRange === 'custom' && (
                        <div className="px-3 pt-2 pb-1 border-t border-slate-100 mt-2">
                          <input 
                            type="date" 
                            value={booksCustomStart}
                            onChange={(e) => setBooksCustomStart(e.target.value)}
                            className="w-full text-xs font-medium text-slate-600 border border-slate-200 bg-slate-50 p-1.5 rounded mb-2 outline-none focus:border-emerald-500"
                          />
                          <input 
                            type="date" 
                            value={booksCustomEnd}
                            onChange={(e) => setBooksCustomEnd(e.target.value)}
                            className="w-full text-xs font-medium text-slate-600 border border-slate-200 bg-slate-50 p-1.5 rounded outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200/60 hidden sm:flex">
                <button onClick={() => setBooksViewMode('list')} className={`p-1.5 rounded-md transition-colors ${booksViewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}><List size={16} /></button>
                <button onClick={() => setBooksViewMode('vbar')} className={`p-1.5 rounded-md transition-colors ${booksViewMode === 'vbar' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}><BarChart2 size={16} /></button>
                <button onClick={() => setBooksViewMode('pie')} className={`p-1.5 rounded-md transition-colors ${booksViewMode === 'pie' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}><PieChartIcon size={16} /></button>
                <button onClick={() => setBooksViewMode('line')} className={`p-1.5 rounded-md transition-colors ${booksViewMode === 'line' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}><Activity size={16} /></button>
              </div>
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
                    <button onClick={() => downloadCSV(popularBooksFormatted, 'top_10_books', 'title', 'count')} className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-medium">
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
          </div>
          <div ref={booksChartRef} className="w-full pt-2">
            {isLoadingBooksAnalytics ? (
              <div className="h-[26rem] flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              </div>
            ) : booksViewMode === 'pie' ? (
              renderPieChart(popularBooksFormatted, 'title', 'count')
            ) : booksViewMode === 'vbar' ? (
              renderVerticalBarChart(popularBooksFormatted, 'title', 'count', '#10b981')
            ) : booksViewMode === 'line' ? (
              renderLineChart(popularBooksFormatted, 'title', 'count', '#10b981')
            ) : (
              renderBarChart(popularBooksFormatted, maxBooksCount, 'title', 'count', 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]')
            )}
          </div>
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
