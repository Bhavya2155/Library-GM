import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, LayoutDashboard, Library, LogOut, Bell, UserCircle, Settings, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const Sidebar = () => {
  const { logout, token, role } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Settings Dropdown & Modal State
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showManageAccountsModal, setShowManageAccountsModal] = useState(false);
  
  // Settings Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Manage Accounts State
  const [staffAccounts, setStaffAccounts] = useState<any[]>([]);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('student');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  const fetchStaffAccounts = async () => {
    try {
      const res = await axios.get('/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffAccounts(res.data);
    } catch (err) {
      toast.error('Failed to load staff accounts');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[A-Z]/.test(newStaffUsername) || /\s/.test(newStaffUsername)) {
      toast.error('Username must start with a capital letter and contain no spaces.');
      return;
    }
    try {
      if (editingStaffId) {
        await axios.put(`/admin/staff/${editingStaffId}`, { username: newStaffUsername, password: newStaffPassword, role: newStaffRole }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Account updated');
        setEditingStaffId(null);
      } else {
        await axios.post('/admin/staff', { username: newStaffUsername, password: newStaffPassword, role: newStaffRole }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Account created');
      }
      setNewStaffUsername('');
      setNewStaffPassword('');
      setNewStaffRole('student');
      fetchStaffAccounts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save account');
    }
  };

  const startEditStaff = (staff: any) => {
    setEditingStaffId(staff.id);
    setNewStaffUsername(staff.username);
    setNewStaffPassword('');
    setNewStaffRole(staff.role || 'student');
  };
  
  const cancelEditStaff = () => {
    setEditingStaffId(null);
    setNewStaffUsername('');
    setNewStaffPassword('');
    setNewStaffRole('student');
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await axios.delete(`/admin/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Account deleted');
      fetchStaffAccounts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete account');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false);
      }
      // Note: role dropdown doesn't have a ref here for simplicity, we can close it when clicking elsewhere if we want, but since it's a modal, usually clicking an option closes it.
      // We'll close it if the user clicks anywhere outside of it.
      const target = event.target as HTMLElement;
      if (!target.closest('.role-dropdown-container')) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-56 bg-white/70 backdrop-blur-2xl border-r border-white/50 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-10">
      <div className="p-6 border-b border-white/50 flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Gnan Mandir Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
        <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase text-center whitespace-nowrap">
          {role === 'admin' ? 'Coordinator Library Dashboard' : role === 'leader' ? 'Leader Library Dashboard' : 'Student Library Dashboard'}
        </span>
      </div>
      
      <nav className="flex-1 p-4 flex flex-col gap-2">
        <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 font-medium translate-x-1' : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm'}`} end><LayoutDashboard size={20} /> Dashboard</NavLink>
        {(role === 'admin' || role === 'leader') && (
          <NavLink to="/books" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 font-medium translate-x-1' : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm'}`}><BookOpen size={20} /> Books</NavLink>
        )}
        {role === 'admin' && (
          <>
            <NavLink to="/students" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 font-medium translate-x-1' : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm'}`}><Users size={20} /> Students</NavLink>
            <NavLink to="/guests" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 font-medium translate-x-1' : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm'}`}><UserCircle size={20} /> Guests</NavLink>
          </>
        )}
        <NavLink to="/circulation" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 font-medium translate-x-1' : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm'}`}><Library size={20} /> Circulation</NavLink>
      </nav>

      <div className="p-4 border-t border-white/50 flex flex-col gap-2">
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${showDropdown ? 'bg-white/80 text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm'}`}>
            <Bell size={20} /> Notifications
            {notifications.length > 0 && (
              <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute left-0 bottom-full mb-2 w-72 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 overflow-hidden z-50">
              <div className="p-3 border-b border-white/50 bg-white/50 font-semibold text-sm text-slate-700">Due / Overdue Books ({notifications.length})</div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">All caught up!</div>
                ) : (
                  <ul className="divide-y divide-slate-100/50">
                    {notifications.map(n => (
                      <li key={n._id} 
                          onClick={() => {
                            setShowDropdown(false);
                            window.location.href = `/circulation?search=${encodeURIComponent(n.studentGmNo || n.guestName)}`;
                          }}
                          className="p-4 hover:bg-slate-50/50 cursor-pointer transition-colors">
                        <div className="font-semibold text-sm text-slate-800 line-clamp-1">
                          {n.studentName ? `${n.studentName} (GM No: ${n.studentGmNo})` : `${n.guestName} (Guest)`}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">Book: {n.bookTitle}</div>
                        <div className="text-xs text-amber-600 font-medium mt-1">
                          Due: {new Date(n.dueDate).toLocaleString(undefined, {dateStyle: 'short', timeStyle: 'short'})}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={settingsDropdownRef}>
          <button onClick={() => setShowSettingsDropdown(!showSettingsDropdown)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${showSettingsDropdown ? 'bg-white/80 text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm'}`}>
            <Settings size={20} /> Settings
          </button>
          
          {showSettingsDropdown && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 overflow-hidden z-50">
              {role === 'admin' && (
                <>
                  <div 
                    onClick={() => { setShowSettingsDropdown(false); setShowSettingsModal(true); }} 
                    className="px-4 py-3 hover:bg-slate-50/50 cursor-pointer transition-colors text-sm font-medium text-slate-700 flex items-center gap-3"
                  >
                    <Settings size={16} /> Change Password
                  </div>
                  <div 
                    onClick={() => { 
                      setShowSettingsDropdown(false); 
                      setShowManageAccountsModal(true);
                      fetchStaffAccounts();
                    }} 
                    className="px-4 py-3 hover:bg-slate-50/50 cursor-pointer transition-colors text-sm font-medium text-slate-700 flex items-center gap-3"
                  >
                    <Users size={16} /> Manage Accounts
                  </div>
                </>
              )}
              <div 
                onClick={logout} 
                className={`px-4 py-3 hover:bg-rose-50/50 cursor-pointer transition-colors text-sm font-medium text-rose-600 flex items-center gap-3 ${role === 'admin' ? 'border-t border-slate-100' : ''}`}
              >
                <LogOut size={16} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {showSettingsModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-white/50 flex justify-between items-center bg-white/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Settings size={20} className="text-indigo-600" /> Change Password</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newUsername && (!/^[A-Z]/.test(newUsername) || /\s/.test(newUsername))) {
                toast.error('Username must start with a capital letter and contain no spaces.');
                return;
              }
              if (newPassword && newPassword !== confirmPassword) {
                toast.error('New passwords do not match!');
                return;
              }
              try {
                await axios.put('/admin/update', { currentPassword, newUsername, newPassword }, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Credentials updated successfully!');
                setShowSettingsModal(false);
                setCurrentPassword(''); setNewUsername(''); setNewPassword(''); setConfirmPassword('');
                if (newUsername) {
                  localStorage.setItem('username', newUsername);
                  window.location.reload(); // reload to show new username if we display it
                }
              } catch (err: any) {
                toast.error(err.response?.data?.error || 'Failed to update credentials');
              }
            }} className="p-6 flex flex-col gap-4">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password *</label>
                <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" placeholder="Enter current password..." />
              </div>
              
              <hr className="border-slate-100 my-1" />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Username (Optional)</label>
                <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className={`w-full px-4 py-2 bg-white/60 backdrop-blur-md border ${newUsername && (!/^[A-Z]/.test(newUsername) || /\s/.test(newUsername)) ? 'border-red-400 focus:ring-red-500/50' : 'border-slate-200 focus:ring-indigo-500/50'} rounded-xl focus:ring-2 outline-none transition-all`} placeholder="Enter new username..." />
                {newUsername && (!/^[A-Z]/.test(newUsername) || /\s/.test(newUsername)) && (
                  <p className="text-red-500 text-xs mt-1 font-medium">Must start with a capital letter and contain no spaces.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password (Optional)</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" placeholder="Enter new password..." />
              </div>

              {newPassword && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password *</label>
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" placeholder="Confirm new password..." />
                </div>
              )}
              
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setShowSettingsModal(false)} className="flex-1 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors bg-white/50 backdrop-blur-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 font-medium shadow-md shadow-indigo-200 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showManageAccountsModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/50 flex justify-between items-center bg-white/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users size={20} className="text-indigo-600" /> Manage Accounts</h3>
              <button onClick={() => setShowManageAccountsModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                  {editingStaffId ? 'Edit Account' : 'Add New Account'}
                </h4>
                <form onSubmit={handleCreateStaff} className="flex flex-col gap-3">
                  <div className="flex gap-2 items-start">
                    <div className="w-1/4 relative role-dropdown-container">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                      <div 
                        className={`w-full px-3 py-2 bg-white/60 backdrop-blur-md border ${showRoleDropdown ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-slate-200'} rounded-lg cursor-pointer flex justify-between items-center text-sm transition-all`}
                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      >
                        <span className="capitalize">{newStaffRole}</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {showRoleDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden z-[100] py-1 animate-in fade-in zoom-in-95 duration-200">
                          <div 
                            className={`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center ${newStaffRole === 'student' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                            onMouseDown={(e) => { e.preventDefault(); setNewStaffRole('student'); setShowRoleDropdown(false); }}
                          >
                            Student
                          </div>
                          <div 
                            className={`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center ${newStaffRole === 'leader' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                            onMouseDown={(e) => { e.preventDefault(); setNewStaffRole('leader'); setShowRoleDropdown(false); }}
                          >
                            Leader
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                      <input type="text" required value={newStaffUsername} onChange={e => setNewStaffUsername(e.target.value)} className={`w-full px-3 py-2 bg-white/60 backdrop-blur-md border ${newStaffUsername && (!/^[A-Z]/.test(newStaffUsername) || /\s/.test(newStaffUsername)) ? 'border-red-400 focus:ring-red-500/50' : 'border-slate-200 focus:ring-indigo-500/50'} rounded-lg focus:ring-2 outline-none transition-all text-sm`} placeholder="e.g. Naman" />
                      {newStaffUsername && (!/^[A-Z]/.test(newStaffUsername) || /\s/.test(newStaffUsername)) && (
                        <p className="text-red-500 text-[10px] mt-1 font-medium absolute top-full left-0">Must start with a capital, no spaces.</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        {editingStaffId ? 'New Password (Optional)' : 'Password'}
                      </label>
                      <div className="relative">
                        <input type={showStaffPassword ? "text" : "password"} required={!editingStaffId} value={newStaffPassword} onChange={e => setNewStaffPassword(e.target.value)} className="w-full pl-3 pr-10 py-2 bg-white/60 backdrop-blur-md border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm" placeholder="Password" />
                        <button type="button" onClick={() => setShowStaffPassword(!showStaffPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center">
                          {showStaffPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    {editingStaffId && (
                      <button type="button" onClick={cancelEditStaff} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium transition-all text-sm">Cancel</button>
                    )}
                    <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 font-medium shadow-md shadow-indigo-200 transition-all text-sm">
                      {editingStaffId ? 'Save' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Current Accounts</h4>
                {staffAccounts.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No accounts found.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    {staffAccounts.map(staff => (
                      <li key={staff.id} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><UserCircle size={18} /></div>
                          <span className="font-medium text-slate-700 text-sm">{staff.username}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${staff.role === 'leader' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{staff.role || 'student'}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditStaff(staff)} className="text-indigo-500 hover:text-indigo-700 text-sm font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors">Edit</button>
                          <button onClick={() => handleDeleteStaff(staff.id)} className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Sidebar;
