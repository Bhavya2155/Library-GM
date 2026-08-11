
import useSWR from 'swr';

import { Book, Users, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { data: stats = { totalBooks: 0, totalStudents: 0, issuedBooks: 0, availableBooks: 0 } } = useSWR('/dashboard/stats');
  const { data: logins = [], isLoading: isLoadingLogins } = useSWR(role === 'admin' ? '/dashboard/logins' : null);

  const cards = [
    { title: 'Total Books', value: stats.totalBooks, icon: Book, color: 'text-indigo-600', bg: 'bg-indigo-100', link: '/books' },
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', link: '/students' },
    { title: 'Books Issued', value: stats.issuedBooks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', link: '/circulation' },
    { title: 'Available Copies', value: stats.availableBooks, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', link: '/books' },
  ];

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto relative z-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 drop-shadow-sm">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {role === 'admin' && (
        <div className="mt-12">
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
              <table className="min-w-max w-full text-left border-collapse min-w-max">
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
