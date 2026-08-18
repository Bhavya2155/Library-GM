import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { BookmarkPlus, CheckCircle, Trash2, RotateCcw, Download, Search, ChevronDown, ArrowUp, ArrowDown, Calendar, X, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';
import { formatName } from '../utils/nameFormatter';

const SearchableSelect = ({ options, value, onChange, placeholder }: { options: {value: string, label: string}[], value: string, onChange: (val: string) => void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg cursor-pointer flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
      >
        <span className={`truncate ${selected ? 'text-slate-900' : 'text-slate-500'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                className="w-full pl-7 pr-2 py-1.5 outline-none text-sm bg-white border border-slate-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(o => (
              <div 
                key={o.value} 
                onClick={() => { onChange(o.value); setIsOpen(false); setSearch(''); }}
                className="px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer text-sm text-slate-700 transition-colors"
              >
                {o.label}
              </div>
            ))}
            {filtered.length === 0 && <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Circulation() {
  const { role, username } = useAuth();
  
  const { data: initialRecords, isLoading } = useSWR('/circulation');
  const { data: initialBooks } = useSWR('/books');
  const { data: initialStudents } = useSWR('/students');
  const { data: initialGuests } = useSWR('/guests');

  const [records, setRecords] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);

  useEffect(() => {
    if (initialRecords) setRecords(initialRecords);
  }, [initialRecords]);

  useEffect(() => {
    if (initialBooks) setBooks(initialBooks.filter((b: any) => b.availableCopies > 0));
  }, [initialBooks]);

  useEffect(() => {
    if (initialStudents) setStudents(initialStudents);
  }, [initialStudents]);

  useEffect(() => {
    if (initialGuests) setGuests(initialGuests);
  }, [initialGuests]);
  
  const [showModal, setShowModal] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [bookId, setBookId] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({ key: 'issueDate', direction: 'desc' });
  const [bookPrefix, setBookPrefix] = useState('');
  const [bookNumber, setBookNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [guestId, setGuestId] = useState('');
  const [issueType, setIssueType] = useState<'student' | 'guest'>('student');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'students' | 'guests'>('students');
  const [dateFilter, setDateFilter] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    return new URLSearchParams(window.location.search).get('search') || '';
  });

  const fetchData = async () => {
    // SWR handles fetching automatically
  };

  const refreshCirculation = async () => {
    try {
      const recRes = await axios.get('/circulation');
      setRecords(recRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!bookPrefix && !bookNumber) {
      setBookId('');
      return;
    }
    const prefix = bookPrefix.trim().toUpperCase();
    const num = bookNumber.trim();
    const searchCode = `${prefix}-${num}`;
    const searchCodeNoHyphen = `${prefix}${num}`;
    const searchCodeNumOnly = num;
    
    const found = books.find((b: any) => {
      const isbn = b.isbn.toUpperCase();
      return isbn === searchCode || isbn === searchCodeNoHyphen || (prefix === '' && isbn === searchCodeNumOnly);
    });

    if (found) {
      setBookId(found._id);
    } else {
      setBookId('');
    }
  }, [bookPrefix, bookNumber, books]);

  const closeModal = () => {
    setShowModal(false);
    setBookId('');
    setBookPrefix('');
    setBookNumber('');
    setStudentId('');
    setGuestId('');
    setIssueType('student');
    setIsCustomBook(false);
    setCustomBookName('');
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <div className="w-3" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-500" /> : <ArrowDown size={14} className="text-indigo-500" />;
  };

  const [isCustomBook, setIsCustomBook] = useState(false);
  const [customBookName, setCustomBookName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let promise;
    if (isCustomBook) {
      const payload: any = { customBookName };
      if (issueType === 'student') payload.studentId = studentId;
      if (issueType === 'guest') payload.guestId = guestId;
      promise = axios.post('/circulation/issue-custom', payload);
    } else {
      const payload: any = { bookId };
      if (issueType === 'student') payload.studentId = studentId;
      if (issueType === 'guest') payload.guestId = guestId;
      promise = axios.post('/circulation/issue', payload);
    }

    closeModal(); // Close modal instantly

    toast.promise(promise, {
      loading: 'Issuing book...',
      success: () => {
        refreshCirculation(); // ONLY fetch circulation, not everything
        // Optimistically remove a copy from the local state
        if (!isCustomBook) {
          setBooks(prev => prev.map((b: any) => b._id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b).filter((b: any) => b.availableCopies > 0));
        }
        return 'Book issued successfully';
      },
      error: (err) => err.response?.data?.error || 'Failed to issue book'
    });
    setIsSubmitting(false);
  };

  const handleRenew = (id: string) => {
    if(!confirm('Renew this book for another 7 days?')) return;
    
    // Instant Reflect
    setRecords(prev => prev.map(r => {
      if (r._id === id) {
        const newDueDate = new Date(r.dueDate || new Date());
        newDueDate.setDate(newDueDate.getDate() + 7);
        return { ...r, renewals: r.renewals + 1, dueDate: newDueDate.toISOString(), renewDate: new Date().toISOString() };
      }
      return r;
    }));

    axios.post(`/circulation/renew/${id}`)
      .then(() => toast.success('Book renewed successfully'))
      .catch((err) => {
        refreshCirculation();
        toast.error(err.response?.data?.error || 'Failed to renew book');
      });
  };

  const handleUndoRenew = (id: string) => {
    if(!confirm('Undo the renewal?')) return;
    
    // Instant Reflect
    setRecords(prev => prev.map(r => {
      if (r._id === id) {
        const originalDueDate = new Date(r.dueDate || new Date());
        originalDueDate.setDate(originalDueDate.getDate() - 7);
        return { ...r, renewals: Math.max(0, r.renewals - 1), dueDate: originalDueDate.toISOString(), renewDate: null };
      }
      return r;
    }));

    axios.post(`/circulation/undo-renew/${id}`)
      .then(() => toast.success('Renew undone'))
      .catch((err) => {
        refreshCirculation();
        toast.error(err.response?.data?.error || 'Failed to undo renew');
      });
  };

  const handleReturn = (id: string) => {
    if(!confirm('Mark this book as returned?')) return;
    
    // Instant Reflect
    setRecords(prev => prev.map(r => r._id === id ? { ...r, status: 'returned', returnDate: new Date().toISOString() } : r));
    setBooks(prev => prev.map((b: any) => b._id === records.find(r => r._id === id)?.bookId?._id ? { ...b, availableCopies: b.availableCopies + 1 } : b));

    axios.post(`/circulation/return/${id}`)
      .then(() => toast.success('Book returned'))
      .catch((err) => {
        refreshCirculation();
        toast.error(err.response?.data?.error || 'Failed to process return');
      });
  };

  const handleUndoReturn = (id: string) => {
    if(!confirm('Undo the return?')) return;
    
    // Instant Reflect
    setRecords(prev => prev.map(r => r._id === id ? { ...r, status: 'issued', returnDate: null } : r));
    setBooks(prev => prev.map((b: any) => b._id === records.find(r => r._id === id)?.bookId?._id ? { ...b, availableCopies: b.availableCopies - 1 } : b));

    axios.post(`/circulation/undo-return/${id}`)
      .then(() => toast.success('Return undone'))
      .catch((err) => {
        refreshCirculation();
        toast.error(err.response?.data?.error || 'Failed to undo return');
      });
  };

  const handleDelete = (id: string) => {
    if(!confirm('Are you sure you want to permanently delete this circulation record?')) return;
    
    // Instant Reflect
    const record = records.find(r => r._id === id);
    setRecords(prev => prev.filter(r => r._id !== id));
    if (record?.status === 'issued') {
       setBooks(prev => prev.map((b: any) => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies + 1 } : b));
    }

    axios.delete(`/circulation/${id}`)
      .then(() => toast.success('Record deleted'))
      .catch((err) => {
        refreshCirculation();
        toast.error(err.response?.data?.error || 'Failed to delete record');
      });
  };

  const exportToExcel = () => {
    const filteredRecords = records.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (activeTab === 'students' && !r.studentId) return false;
      if (activeTab === 'guests' && !r.guestId) return false;
      if (dateFilter && (!r.issueDate || !r.issueDate.startsWith(dateFilter))) return false;
      
      const term = searchTerm.toLowerCase();
      const gmNo = r.studentId?.studentId || '';
      const title = r.bookId?.title || '';
      const isbn = r.bookId?.isbn || '';
      const name = formatName(r.studentId?.name) || formatName(r.guestId?.name) || '';
      return (
        gmNo.toLowerCase().includes(term) ||
        title.toLowerCase().includes(term) ||
        isbn.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term)
      );
    });

    const data = filteredRecords.map(r => ({
      'GM No / Guest': r.studentId ? r.studentId.studentId : 'Guest',
      'Name': r.studentId ? formatName(r.studentId.name) : formatName(r.guestId?.name),
      'Book Title': r.bookId?.title,
      'Book ISBN': r.bookId?.isbn,
      'Issue Date': formatDate(r.issueDate),
      'Due Date': formatDate(r.dueDate),
      'Renew Date': r.renewDate ? formatDate(r.renewDate) : '',
      'Return Date': r.returnDate ? formatDate(r.returnDate) : '',
      'Status': r.status.toUpperCase(),
      'Renewals': r.renewals
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'students' ? 'Student Records' : 'Guest Records');
    XLSX.writeFile(workbook, `Circulation_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded');
  };

  const prefixVal = bookPrefix.trim().toUpperCase();
  const numVal = bookNumber.trim();
  const searchSuggestions = books.filter((b: any) => {
    if (!prefixVal && !numVal) return false;
    const isbn = b.isbn.toUpperCase();
    if (prefixVal && numVal) {
      return isbn.startsWith(`${prefixVal}-${numVal}`) || isbn.startsWith(`${prefixVal}${numVal}`);
    } else if (prefixVal) {
      return isbn.startsWith(prefixVal);
    } else if (numVal) {
      return isbn.includes(numVal);
    }
    return false;
  }).filter((b: any) => b._id !== bookId).slice(0, 5);

  const handleSelectBook = (book: any) => {
    setBookId(book._id);
    const match = book.isbn.match(/^([A-Za-z]+)-?(\d+)$/);
    if (match) {
      setBookPrefix(match[1]);
      setBookNumber(match[2]);
    } else {
      setBookPrefix('');
      setBookNumber(book.isbn);
    }
    setIsBookDropdownOpen(false);
  };

  return (
    <div className="h-full w-full flex flex-col px-4 pt-4 md:px-8 md:pt-8 pb-0">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col relative z-10 min-h-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0 relative z-50 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 drop-shadow-sm whitespace-nowrap">Circulation Desk</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4 w-full md:w-auto">
            
            {/* Search Box - always visible but adapts width */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none w-full sm:w-48 shadow-sm hover:bg-white/80 transition-colors text-slate-700 placeholder:text-slate-400" />
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {/* Backdrop for closing mobile menu when clicking outside */}
              {isMobileMenuOpen && (
                <div 
                  className="fixed inset-0 z-40 lg:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                ></div>
              )}

              {/* Action Filters (Hidden on Mobile, Dropdown on Mobile) */}
              <div className={`flex-col lg:flex-row items-end lg:items-center gap-4 absolute lg:relative top-full right-0 lg:top-auto lg:right-auto mt-2 lg:mt-0 p-4 lg:p-0 bg-white/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none rounded-2xl lg:rounded-none shadow-2xl lg:shadow-none border border-slate-200 lg:border-none z-50 transition-all ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}>
                <div className="relative min-w-[140px] w-full lg:w-auto">
                  <button 
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsStatusDropdownOpen(false), 200)}
                    className="w-full px-4 py-2 bg-white/60 backdrop-blur-md border border-slate-200 lg:border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-700 font-medium shadow-sm hover:bg-white/80 transition-colors flex justify-between items-center gap-2"
                  >
                    <span>{statusFilter === 'all' ? 'All Status' : statusFilter === 'issued' ? 'Issued' : 'Returned'}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                      <div onMouseDown={() => { setStatusFilter('all'); setIsStatusDropdownOpen(false); }} className="px-4 py-2 hover:bg-indigo-50/80 cursor-pointer transition-colors text-sm font-medium text-slate-700">All Status</div>
                      <div onMouseDown={() => { setStatusFilter('issued'); setIsStatusDropdownOpen(false); }} className="px-4 py-2 hover:bg-indigo-50/80 cursor-pointer transition-colors text-sm font-medium text-slate-700">Issued</div>
                      <div onMouseDown={() => { setStatusFilter('returned'); setIsStatusDropdownOpen(false); }} className="px-4 py-2 hover:bg-indigo-50/80 cursor-pointer transition-colors text-sm font-medium text-slate-700">Returned</div>
                    </div>
                  )}
                </div>
                <div className="relative group flex items-center justify-end w-full lg:w-auto">
                  <div 
                    className={`flex items-center justify-center px-3 py-2 bg-white/60 backdrop-blur-md border border-slate-200 lg:border-white/50 rounded-xl shadow-sm hover:bg-white/80 transition-all text-sm cursor-pointer h-10 w-full lg:w-10 ${dateFilter ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
                    onClick={() => {
                      if (dateInputRef.current) {
                        try {
                          dateInputRef.current.showPicker();
                        } catch (e) {
                          dateInputRef.current.focus();
                        }
                      }
                    }}
                  >
                    <span className="lg:hidden mr-2">Filter by Date</span>
                    <Calendar size={18} className="shrink-0" />
                  </div>
                  <input 
                    ref={dateInputRef}
                    type="date" 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 pointer-events-none" 
                  />
                  {dateFilter && (
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDateFilter(''); }} className="absolute -top-1.5 -right-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full bg-white shadow border border-slate-100 w-4 h-4 flex items-center justify-center transition-colors z-20" title="Clear Date">
                      <X size={10} strokeWidth={3} />
                    </button>
                  )}
                </div>
                <button onClick={() => { exportToExcel(); setIsMobileMenuOpen(false); }} className="w-full lg:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2 rounded-xl font-medium flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5">
                  <Download size={20} /> Export
                </button>
              </div>

              {/* Always Visible Actions */}
              <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-3 sm:px-5 py-2 rounded-xl font-medium flex items-center gap-2 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 shrink-0">
                <BookmarkPlus size={20} /> <span className="hidden sm:inline">Issue Book</span><span className="sm:hidden">Issue</span>
              </button>
              
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl text-slate-600 hover:bg-white/80 shadow-sm transition-colors relative z-50 shrink-0"
              >
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200 shrink-0">
        <button 
          onClick={() => setActiveTab('students')}
          className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Student Circulation
        </button>
        <button 
          onClick={() => setActiveTab('guests')}
          className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'guests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Guest Circulation
        </button>
      </div>


        <div className="bg-white rounded-t-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col min-h-0 mb-0">
          <div className="overflow-x-auto overflow-y-auto flex-1 relative">
            <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
              <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-3 py-3 font-semibold  cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('gmNo')}>
                  <div className="flex items-center gap-1">GM No. {renderSortIcon('gmNo')}</div>
                </th>
                <th className="px-3 py-3 font-semibold  cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Name {renderSortIcon('name')}</div>
                </th>
                <th className="px-3 py-3 font-semibold  cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('bookTitle')}>
                  <div className="flex items-center gap-1">Book Title {renderSortIcon('bookTitle')}</div>
                </th>
                <th className="px-3 py-3 font-semibold  cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('issueDate')}>
                  <div className="flex items-center gap-1">Dates {renderSortIcon('issueDate')}</div>
                </th>
                <th className="px-3 py-3 font-semibold  cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
                </th>
                <th className="px-3 py-3 font-semibold ">Actions</th>
                {role === 'admin' && <th className="px-3 py-3 font-semibold ">Delete</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {records.filter(r => {
                if (statusFilter !== 'all' && r.status !== statusFilter) return false;
                if (activeTab === 'students' && !r.studentId) return false;
                if (activeTab === 'guests' && !r.guestId) return false;
                if (dateFilter && (!r.issueDate || !r.issueDate.startsWith(dateFilter))) return false;
                
                const term = searchTerm.toLowerCase();
                const gmNo = r.studentId?.studentId || '';
                const title = r.bookId?.title || '';
                const isbn = r.bookId?.isbn || '';
                const name = formatName(r.studentId?.name) || formatName(r.guestId?.name) || '';
                return (
                  gmNo.toLowerCase().includes(term) ||
                  title.toLowerCase().includes(term) ||
                  isbn.toLowerCase().includes(term) ||
                  name.toLowerCase().includes(term)
                );
              }).sort((a, b) => {
                let aValue: any = '';
                let bValue: any = '';

                switch (sortConfig.key) {
                  case 'gmNo':
                    aValue = a.studentId ? parseInt(a.studentId.studentId) || 0 : 0;
                    bValue = b.studentId ? parseInt(b.studentId.studentId) || 0 : 0;
                    break;
                  case 'name':
                    aValue = (formatName(a.studentId?.name) || formatName(a.guestId?.name) || '').toLowerCase();
                    bValue = (formatName(b.studentId?.name) || formatName(b.guestId?.name) || '').toLowerCase();
                    break;
                  case 'bookTitle':
                    aValue = (a.bookId?.title || '').toLowerCase();
                    bValue = (b.bookId?.title || '').toLowerCase();
                    break;
                  case 'issueDate':
                    aValue = new Date(a.issueDate).getTime();
                    bValue = new Date(b.issueDate).getTime();
                    break;
                  case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
              }).map(record => (
                <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 text-slate-600">
                    {record.studentId ? record.studentId.studentId : <span className="text-slate-400 italic">N/A (Guest)</span>}
                  </td>
                  <td className="px-3 py-3 text-slate-600 font-medium align-middle">
                    <div className="flex flex-wrap items-center gap-2">
                      {record.studentId ? formatName(record.studentId.name) : formatName(record.guestId?.name)}
                      {record.guestId && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">GUEST</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {record.bookId?.title} <br/>
                    <span className="text-xs text-slate-500 font-normal">{record.bookId?.isbn}</span>
                  </td>
                  <td className="px-3 py-3 text-slate-600 text-xs whitespace-nowrap">
                    {record.issuedBy && (
                      <div className="text-red-600 mb-1">
                        {record.issuedBy.includes(':') ? (
                          <>
                            <span className="font-semibold">{record.issuedBy.split(':')[0] === 'Admin' ? 'Coordinator' : record.issuedBy.split(':')[0]}:</span> {record.issuedBy.split(':')[1].trim()}
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">Sevak:</span> {record.issuedBy}
                          </>
                        )}
                      </div>
                    )}
                    <div><span className="font-semibold">Issued:</span> {formatDate(record.issueDate)}</div>
                    {record.renewDate && <div className="text-blue-600 mt-1"><span className="font-semibold">Renewed:</span> {formatDate(record.renewDate)}</div>}
                    {record.dueDate && <div className="text-amber-600 mt-1"><span className="font-semibold">Due:</span> {formatDate(record.dueDate)}</div>}
                    {record.returnDate && <div className="text-emerald-600 mt-1"><span className="font-semibold">Returned:</span> {formatDate(record.returnDate)}</div>}
                  </td>
                  <td className="px-3 py-3">
                    {(() => {
                      const isIssued = record.status === 'issued';
                      const isOverdue = isIssued && ((new Date().getTime() - new Date(record.issueDate).getTime()) / (1000 * 3600 * 24) > 14);
                      
                      if (isOverdue) return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">Overdue</span>;
                      if (isIssued) return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">Issued</span>;
                      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Returned</span>;
                    })()}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-start gap-2">
                      {record.status === 'issued' ? (
                        <>
                          {(() => {
                            const daysSinceIssue = (new Date().getTime() - new Date(record.issueDate).getTime()) / (1000 * 3600 * 24);
                            if (daysSinceIssue > 14) return null; // Overdue, can only return
                            
                            return record.renewals < 1 ? (
                              <button onClick={() => handleRenew(record._id)} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium flex items-center gap-1 transition-colors bg-emerald-50 px-2 py-1.5 rounded-lg whitespace-nowrap">
                                <CheckCircle size={14} /> Renew
                              </button>
                            ) : role === 'admin' ? (
                              <button onClick={() => handleUndoRenew(record._id)} className="text-amber-600 hover:text-amber-800 text-xs font-medium flex items-center gap-1 transition-colors bg-amber-50 px-2 py-1.5 rounded-lg whitespace-nowrap">
                                <RotateCcw size={14} /> Undo Renew
                              </button>
                            ) : null;
                      })()}
                      <button onClick={() => handleReturn(record._id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 transition-colors bg-indigo-50 px-2 py-1.5 rounded-lg whitespace-nowrap">
                        <CheckCircle size={14} /> Return
                      </button>
                    </>
                  ) : (
                    role === 'admin' && (
                      <button onClick={() => handleUndoReturn(record._id)} className="text-slate-600 hover:text-slate-800 text-xs font-medium flex items-center gap-1 transition-colors bg-slate-100 px-2 py-1.5 rounded-lg whitespace-nowrap">
                        <RotateCcw size={14} /> Undo Return
                      </button>
                    )
                  )}
                </div>
              </td>
              {role === 'admin' && (
                <td className="px-3 py-3">
                  <button onClick={() => handleDelete(record._id)} className="text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center w-8 h-8" title="Delete Record">
                    <Trash2 size={16} />
                  </button>
                </td>
              )}
            </tr>
              ))}
              {isLoading && records.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p>Loading circulation records...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && records.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No circulation records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={closeModal}>
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-white/50 flex justify-between items-center bg-white/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-900">Issue Book</h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-700 transition-colors bg-white/80 hover:bg-white p-1.5 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleIssue} className="p-6 flex flex-col gap-6 relative">
              <div className="flex gap-6 mb-1 items-center bg-slate-50 p-3 rounded-lg border border-slate-100 flex-wrap">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700">Recipient Type:</span>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="target" checked={issueType === 'student'} onChange={() => {setIssueType('student'); setGuestId('');}} className="text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                    <span className={issueType === 'student' ? 'font-semibold text-indigo-700' : 'text-slate-600'}>Student</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="target" checked={issueType === 'guest'} onChange={() => {setIssueType('guest'); setStudentId('');}} className="text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                    <span className={issueType === 'guest' ? 'font-semibold text-indigo-700' : 'text-slate-600'}>Guest</span>
                  </label>
                </div>
                
                <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2"></div>
                
                <label className="flex items-center gap-2 text-sm cursor-pointer sm:ml-auto bg-indigo-100/50 px-3 py-1.5 rounded-md border border-indigo-200/50 hover:bg-indigo-100 transition-colors">
                  <input type="checkbox" checked={isCustomBook} onChange={(e) => { setIsCustomBook(e.target.checked); setBookId(''); setBookPrefix(''); setBookNumber(''); setCustomBookName(''); }} className="text-indigo-600 focus:ring-indigo-500 cursor-pointer rounded" />
                  <span className="font-semibold text-indigo-800">Issue Uncatalogued Book</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  {isCustomBook ? (
                    <>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Book Name (Custom)</label>
                      <input 
                        type="text" 
                        placeholder="Type the exact name of the unnumbered book..." 
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 outline-none bg-white text-slate-900 shadow-inner"
                        value={customBookName}
                        onChange={e => setCustomBookName(e.target.value)}
                        autoFocus
                        required
                      />
                      <p className="text-slate-500 text-xs mt-2 flex items-start gap-1">
                        <span className="text-indigo-500 mt-0.5">ⓘ</span> 
                        This book will be temporarily added to the catalog and issued immediately.
                      </p>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Book Code (Alphabet & Digit)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Alphabet (e.g. M)" 
                          className="w-1/3 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 outline-none uppercase bg-white text-slate-900"
                          value={bookPrefix}
                          onChange={e => setBookPrefix(e.target.value)}
                          onFocus={() => setIsBookDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsBookDropdownOpen(false), 200)}
                        />
                        <input 
                          type="text" 
                          placeholder="Digit (e.g. 4)" 
                          className="w-2/3 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 outline-none bg-white text-slate-900"
                          value={bookNumber}
                          onChange={e => setBookNumber(e.target.value)}
                          onFocus={() => setIsBookDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsBookDropdownOpen(false), 200)}
                        />
                      </div>
                      {bookPrefix || bookNumber ? (
                        bookId ? (
                          <p className="text-emerald-600 text-sm mt-12 font-semibold flex items-center gap-1.5">
                            <CheckCircle size={16} /> Book found: <span className="font-bold ml-1">{books.find((b: any) => b._id === bookId)?.title}</span>
                          </p>
                        ) : (
                          <p className="text-rose-500 text-sm mt-12 font-semibold flex items-center gap-1.5">
                             Book not found
                          </p>
                        )
                      ) : null}

                      {isBookDropdownOpen && searchSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xl z-50">
                          {searchSuggestions.map((b: any) => (
                            <div 
                              key={b._id} 
                              onMouseDown={() => handleSelectBook(b)}
                              className="px-3 py-2 hover:bg-indigo-50 cursor-pointer flex justify-between items-center transition-colors border-b last:border-0 border-slate-100"
                            >
                              <span className="font-semibold text-slate-700 text-sm">{b.isbn}</span>
                              <span className="text-slate-500 truncate ml-2 text-xs">{b.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select {issueType === 'student' ? 'Student' : 'Guest'}
                  </label>
                  {issueType === 'student' ? (
                    <SearchableSelect 
                      value={studentId} 
                      onChange={setStudentId} 
                      placeholder="Choose a student..."
                      options={students.map((s: any) => ({ value: s._id, label: `${formatName(s.name)} (${s.studentId})` }))}
                    />
                  ) : (
                    <SearchableSelect 
                      value={guestId} 
                      onChange={setGuestId} 
                      placeholder="Choose a guest..."
                      options={guests.map((g: any) => ({ value: g._id, label: formatName(g.name) }))}
                    />
                  )}
                </div>
              </div>
              {(isCustomBook && customBookName.trim() && (studentId || guestId)) || (!isCustomBook && bookId && (studentId || guestId)) ? (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col gap-2">
                  <h4 className="font-semibold text-indigo-900 mb-1">Confirmation Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-indigo-800">
                    <div>
                      <span className="text-indigo-600 block text-xs uppercase tracking-wider mb-0.5">Book</span>
                      {isCustomBook ? (
                        <>
                          <strong>[Custom] {customBookName}</strong>
                          <div className="text-indigo-500/80 text-xs mt-0.5">Uncatalogued Item</div>
                        </>
                      ) : (
                        <>
                          <strong>{books.find((b: any) => b._id === bookId)?.title}</strong>
                          <div className="text-indigo-500/80 text-xs mt-0.5">ISBN: {books.find((b: any) => b._id === bookId)?.isbn}</div>
                        </>
                      )}
                    </div>
                    <div>
                      <span className="text-indigo-600 block text-xs uppercase tracking-wider mb-0.5">Recipient</span>
                      {issueType === 'student' ? (
                        <>
                          <strong>{formatName(students.find((s: any) => s._id === studentId)?.name)}</strong>
                          <div className="text-indigo-500/80 text-xs mt-0.5">GM No: {students.find((s: any) => s._id === studentId)?.studentId}</div>
                        </>
                      ) : (
                        <>
                          <strong>{formatName(guests.find((g: any) => g._id === guestId)?.name)}</strong>
                          <div className="text-indigo-500/80 text-xs mt-0.5">Guest Account</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-indigo-800 border-t border-indigo-100 pt-2">
                    <span className="font-medium">Assigned By:</span> {username}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center text-slate-500 text-sm">
                  Please select both a book and a recipient to continue.
                </div>
              )}
              
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors bg-white/50 backdrop-blur-sm">Cancel</button>
                <button 
                  type="submit" 
                  disabled={(isCustomBook ? (!customBookName.trim() || (!studentId && !guestId)) : (!bookId || (!studentId && !guestId))) || isSubmitting}
                  className={`flex-1 py-2.5 rounded-xl font-medium shadow-md transition-all ${
                    ((isCustomBook && customBookName.trim() && (studentId || guestId)) || (!isCustomBook && bookId && (studentId || guestId))) && !isSubmitting
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-200 hover:-translate-y-0.5' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Book'}
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
