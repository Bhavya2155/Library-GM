import { useState } from 'react';
import useSWR from 'swr';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { UserCircle, Trash2, Pencil, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Guests() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: guests = [], mutate, isLoading } = useSWR(`/guests?search=${searchTerm}`);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/guests/${editingId}`, form);
        toast.success('Guest updated');
      } else {
        await axios.post('/guests', form);
        toast.success('Guest added');
      }
      setShowModal(false);
      setForm({ name: '' });
      setEditingId(null);
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save guest');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure you want to delete this guest?')) return;
    try {
      await axios.delete(`/guests/${id}`);
      toast.success('Guest deleted');
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete guest');
    }
  };

  const handleEdit = (guest: any) => {
    setForm({ name: guest.name });
    setEditingId(guest._id);
    setShowModal(true);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 drop-shadow-sm">Guest Directory</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none w-full sm:w-full sm:w-64 shadow-sm hover:bg-white/80 transition-colors text-slate-700 placeholder:text-slate-400" />
          </div>
          <button onClick={() => { setEditingId(null); setForm({ name: '' }); setShowModal(true); }} className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2 rounded-xl font-medium flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 whitespace-nowrap">
            <UserCircle size={20} /> Register Guest
          </button>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/40 text-slate-600 text-xs uppercase tracking-wider border-b border-white/50 backdrop-blur-md">
                <th className="p-4 font-semibold">Guest Name</th>
                <th className="p-4 font-semibold ">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 text-sm">
              {guests.filter((g: any) => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map((guest: any) => (
                <tr key={guest._id} className="hover:bg-white/60 transition-colors duration-200">
                  <td className="p-4 font-medium text-slate-900">{guest.name}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(guest)} className="text-indigo-500 hover:text-indigo-700 transition-colors p-1" title="Edit Guest">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(guest._id)} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete Guest">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {isLoading && guests.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p>Loading guests...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && guests.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-slate-500 font-medium">No guests found.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Guest' : 'Register Guest'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <input required placeholder="Guest Name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-100" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                  {editingId ? 'Save Changes' : 'Save Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}
      </div>
    </div>
  );
}
