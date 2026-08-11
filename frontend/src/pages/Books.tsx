import { useState } from 'react';
import useSWR from 'swr';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Books() {
  const [search, setSearch] = useState('');
  const { data: books = [], mutate, isLoading } = useSWR(`/books?search=${search}`);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', quantity: 1 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/books/${editingId}`, form);
        toast.success('Book updated');
      } else {
        await axios.post('/books', form);
        toast.success('Book added');
      }
      setShowModal(false);
      setForm({ title: '', author: '', isbn: '', category: '', quantity: 1 });
      setEditingId(null);
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save book');
    }
  };

  const handleEdit = (book: any) => {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      quantity: book.quantity
    });
    setEditingId(book._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`/books/${id}`);
      toast.success('Book deleted');
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete book');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 drop-shadow-sm">Library Books</h1>
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                className="pl-10 pr-4 py-2 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none w-full sm:w-72 shadow-sm hover:bg-white/80 transition-colors text-slate-700 placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => { setEditingId(null); setForm({ title: '', author: '', isbn: '', category: '', quantity: 1 }); setShowModal(true); }}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2 rounded-xl font-medium flex items-center gap-2 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
            >
              <Plus size={20} /> Add Book
            </button>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto md:table-fixed">
              <thead>
                <tr className="bg-white/40 text-slate-600 text-xs uppercase tracking-wider border-b border-white/50 backdrop-blur-md">
                  <th className="px-3 py-3 md:p-4 font-semibold whitespace-nowrap md:w-[10%]">ISBN / ID</th>
                  <th className="px-3 py-3 md:p-4 font-semibold whitespace-nowrap md:w-[35%]">Title</th>
                  <th className="px-3 py-3 md:p-4 font-semibold whitespace-nowrap md:w-[20%]">Author</th>
                  <th className="px-3 py-3 md:p-4 font-semibold whitespace-nowrap md:w-[15%]">Category</th>
                  <th className="px-3 py-3 md:p-4 font-semibold whitespace-nowrap md:w-[10%]">Availability</th>
                  <th className="px-3 py-3 md:p-4 font-semibold whitespace-nowrap md:w-[10%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 text-sm">
                {books.map((book: any) => (
                  <tr key={book._id} className="hover:bg-white/60 transition-colors duration-200">
                    <td className="px-3 py-3 md:p-4 text-slate-500 font-mono text-xs truncate max-w-[80px] md:max-w-none">{book.isbn}</td>
                    <td className="px-3 py-3 md:p-4 text-slate-900 font-medium truncate max-w-[120px] md:max-w-none" title={book.title}>{book.title}</td>
                    <td className="px-3 py-3 md:p-4 text-slate-600 truncate max-w-[100px] md:max-w-none" title={book.author}>{book.author}</td>
                    <td className="px-3 py-3 md:p-4">
                      <span className="inline-block bg-indigo-50/80 text-indigo-700 px-2.5 py-1 rounded-full text-[11px] font-bold border border-indigo-100/50 shadow-sm truncate max-w-[90px] md:max-w-none" title={book.category}>
                        {book.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 md:p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${book.availableCopies > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {Math.max(0, book.availableCopies)} / {book.quantity}
                      </span>
                    </td>
                    <td className="px-3 py-3 md:p-4 flex gap-2 justify-end">
                      <button onClick={() => handleEdit(book)} className="text-indigo-500 hover:text-indigo-700 transition-colors p-1" title="Edit Book">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(book._id)} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete Book">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {isLoading && books.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p>Loading books...</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && books.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No books found.</td>
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
                <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Book' : 'Add New Book'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                <input required placeholder="Title" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <input required placeholder="Author" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                <input required placeholder="ISBN" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} />
                <input required placeholder="Category" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                <input required type="number" min="1" placeholder="Quantity" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} />
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-slate-50 transition-colors font-medium">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    {editingId ? 'Save Changes' : 'Save Book'}
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
