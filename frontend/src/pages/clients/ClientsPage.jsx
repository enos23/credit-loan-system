import { useEffect, useState } from 'react';
import { getAllClients, createClient, updateClient, deleteClient } from '../../api/clientsApi';
import { getCreditRequestsByClient } from '../../api/creditRequestsApi';
import { extractErrorMessage } from '../../api/errors';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import Pager from '@/components/ui/Pager';

const DEFAULT_PAGE_SIZE = 10;
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Search, User, Phone, Mail, MapPin, Briefcase, Wallet, Scale, FileText, Info, Plus } from 'lucide-react';

const emptyForm = {
  cnp: '', firstName: '', lastName: '', email: '',
  phone: '', address: '', employmentStatus: 'Employed',
  monthlyIncome: '', monthlyExpenses: '', dateOfBirth: '',
};

const employmentLabel = {
  Employed: 'Angajat',
  Unemployed: 'Neangajat',
  SelfEmployed: 'PFA / Antreprenor',
  Retired: 'Pensionar',
};

const employmentColors = {
  Employed: 'bg-indigo-50 text-indigo-700 border-indigo-100/50',
  Unemployed: 'bg-red-50 text-red-700 border-red-100/50',
  SelfEmployed: 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
  Retired: 'bg-amber-50 text-amber-700 border-amber-100/50',
};

const requestStatusColors = {
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
  Rejected: 'bg-red-50 text-red-600 border-red-100/50',
  Pending: 'bg-amber-50 text-amber-600 border-amber-100/50',
  UnderReview: 'bg-blue-50 text-blue-600 border-blue-100/50',
};

const fmt = (n) => Number(n).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getClientAvatarStyle = (firstName = '', lastName = '') => {
  const name = `${firstName} ${lastName}`.trim();
  const gradients = [
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-violet-500 to-purple-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-fuchsia-500 to-purple-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const calculateAge = (dobString) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const ClientForm = ({ form, setForm, onSubmit, onCancel, error, isEdit }) => (
  <form onSubmit={onSubmit} className="space-y-5 pt-2">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">CNP</Label>
        <Input 
          value={form.cnp} 
          onChange={e => setForm({ ...form, cnp: e.target.value })} 
          required 
          maxLength={13} 
          disabled={isEdit}
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data nașterii</Label>
        <Input 
          type="date" 
          value={form.dateOfBirth} 
          onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} 
          required 
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prenume</Label>
        <Input 
          value={form.firstName} 
          onChange={e => setForm({ ...form, firstName: e.target.value })} 
          required 
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nume de familie</Label>
        <Input 
          value={form.lastName} 
          onChange={e => setForm({ ...form, lastName: e.target.value })} 
          required 
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</Label>
        <Input 
          type="email" 
          value={form.email} 
          onChange={e => setForm({ ...form, email: e.target.value })} 
          required 
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Telefon</Label>
        <Input 
          value={form.phone} 
          onChange={e => setForm({ ...form, phone: e.target.value })} 
          required 
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium"
        />
      </div>
      <div className="md:col-span-2 space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Adresă completă</Label>
        <Input 
          value={form.address} 
          onChange={e => setForm({ ...form, address: e.target.value })} 
          required 
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Statut profesional</Label>
        <Select value={form.employmentStatus} onValueChange={v => setForm({ ...form, employmentStatus: v })}>
          <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 font-medium">
            <SelectValue placeholder="Selectează..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="Employed">Angajat</SelectItem>
            <SelectItem value="Unemployed">Șomer / Fără venit</SelectItem>
            <SelectItem value="SelfEmployed">PFA / Antreprenor</SelectItem>
            <SelectItem value="Retired">Pensionar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Venit lunar (RON)</Label>
        <Input 
          type="number" 
          value={form.monthlyIncome} 
          onChange={e => setForm({ ...form, monthlyIncome: e.target.value })} 
          required 
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-semibold"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cheltuieli lunare (RON)</Label>
        <Input 
          type="number" 
          value={form.monthlyExpenses} 
          onChange={e => setForm({ ...form, monthlyExpenses: e.target.value })} 
          required 
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-semibold"
        />
      </div>
    </div>

    {error && <p className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-center animate-in fade-in">{error}</p>}

    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
      <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl cursor-pointer font-bold h-10 px-4">Anulează</Button>
      <Button type="submit" className="rounded-xl cursor-pointer bg-indigo-600 hover:bg-indigo-750 text-white font-bold h-10 px-5">{isEdit ? 'Salvează modificările' : 'Adaugă Client'}</Button>
    </div>
  </form>
);

const ClientsPage = () => {
  const { preferences } = useAuth();
  const pageSize = preferences?.itemsPerPage || DEFAULT_PAGE_SIZE;

  const [clients, setClients] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Dialog opens
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  // Focus objects
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [viewingRequests, setViewingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Forms
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);

  const fetchClients = async (opts = {}) => {
    try {
      const res = await getAllClients({
        page: opts.page ?? page,
        pageSize,
        search: opts.search ?? debouncedSearch,
      });
      setClients(res.data.items);
      setTotalCount(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [debouncedSearch, pageSize]);
  useEffect(() => { fetchClients(); }, [page, debouncedSearch, pageSize]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createClient({
        ...form,
        monthlyIncome: parseFloat(form.monthlyIncome),
        monthlyExpenses: parseFloat(form.monthlyExpenses),
      });
      setAddOpen(false);
      setForm(emptyForm);
      fetchClients();
    } catch (err) {
      setError(extractErrorMessage(err, 'Eroare la crearea clientului.'));
    }
  };

  const openEdit = (client, e) => {
    e.stopPropagation(); // Stop click from opening details dossier modal
    setEditingClient(client);
    setEditForm({
      cnp: client.cnp,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      employmentStatus: client.employmentStatus,
      monthlyIncome: String(client.monthlyIncome),
      monthlyExpenses: String(client.monthlyExpenses),
      dateOfBirth: client.dateOfBirth
        ? new Date(client.dateOfBirth).toISOString().split('T')[0]
        : '',
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      await updateClient(editingClient.id, {
        ...editForm,
        monthlyIncome: parseFloat(editForm.monthlyIncome),
        monthlyExpenses: parseFloat(editForm.monthlyExpenses),
      });
      setEditOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      setEditError(extractErrorMessage(err, 'Eroare la actualizarea clientului.'));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Ești sigur că vrei să ștergi acest client?')) return;
    try {
      await deleteClient(id);
      fetchClients();
    } catch {
      alert('Nu poți șterge un client care are cereri active.');
    }
  };

  const handleViewClient = async (client) => {
    setViewingClient(client);
    setViewingRequests([]);
    setLoadingRequests(true);
    setViewOpen(true);

    try {
      const res = await getCreditRequestsByClient(client.id);
      setViewingRequests(res.data);
    } catch (err) {
      console.error("Failed to load credit history:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Client-side filtering by employment status
  const filteredClients = clients.filter(c => 
    employmentFilter === 'all' || c.employmentStatus === employmentFilter
  );

  return (
    <div className="space-y-7 font-sans max-w-6xl mx-auto pb-12 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Clienți</h1>
          <p className="text-slate-500 font-medium mt-1">{totalCount} clienți înregistrați în total</p>
        </div>

        {/* Add client Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2 px-4 h-11 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer">
              <Plus size={16} /> Client nou
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl w-full rounded-3xl p-8 border-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-xl font-bold text-slate-800">Adaugă client nou</DialogTitle>
            </DialogHeader>
            <ClientForm
              form={form}
              setForm={setForm}
              onSubmit={handleAdd}
              onCancel={() => { setAddOpen(false); setError(''); }}
              error={error}
              isEdit={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit client Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl w-full rounded-3xl p-8 border-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-xl font-bold text-slate-800">Editează client</DialogTitle>
          </DialogHeader>
          <ClientForm
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEdit}
            onCancel={() => { setEditOpen(false); setEditError(''); }}
            error={editError}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* View Client Details Dossier Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-3xl w-full rounded-3xl p-8 border-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
          {viewingClient && (
            <div className="space-y-6">
              <DialogHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getClientAvatarStyle(viewingClient.firstName, viewingClient.lastName)} flex items-center justify-center font-bold text-white text-xl shadow-inner`}>
                    {viewingClient.firstName[0]}{viewingClient.lastName[0]}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-slate-800">{viewingClient.firstName} {viewingClient.lastName}</DialogTitle>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">CNP: {viewingClient.cnp} · Vârstă: {calculateAge(viewingClient.dateOfBirth)} ani</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <User size={14} className="text-indigo-500" />
                    Date Contact
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Mail size={16} className="text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">{viewingClient.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone size={16} className="text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">{viewingClient.phone}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 leading-normal">{viewingClient.address}</span>
                    </div>
                  </div>
                </div>

                {/* Professional & Financial Profile */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Wallet size={14} className="text-indigo-500" />
                    Profil Profesional &amp; Financiar
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Statut profesional</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold mt-1 bg-indigo-50 text-indigo-700">
                        {employmentLabel[viewingClient.employmentStatus] || viewingClient.employmentStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Venit lunar</span>
                      <span className="font-bold text-emerald-600 block mt-1">{fmt(viewingClient.monthlyIncome)} RON</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block">Grad utilizare venit (Cheltuieli vs Venit)</span>
                      
                      {/* Expenses progress bar */}
                      <div className="flex justify-between items-center text-xs font-semibold mt-1">
                        <span className="text-slate-500">Cheltuieli: {fmt(viewingClient.monthlyExpenses)} RON</span>
                        <span className="text-slate-700">{Math.round((viewingClient.monthlyExpenses / viewingClient.monthlyIncome) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full"
                          style={{ width: `${Math.min((viewingClient.monthlyExpenses / viewingClient.monthlyIncome) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Requests History list */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-500" />
                  Istoric solicitări de credit
                </h4>
                
                {loadingRequests ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-slate-50 border border-slate-100 rounded-2xl gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-semibold">Se preiau creditele...</span>
                  </div>
                ) : viewingRequests.length === 0 ? (
                  <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-medium">
                    <Info size={24} className="mx-auto mb-2 text-slate-300" />
                    Acest client nu are nicio solicitare de credit înregistrată în baza de date.
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Scop credit</th>
                          <th className="px-4 py-3 text-right">Sumă</th>
                          <th className="px-4 py-3 text-center">Termen</th>
                          <th className="px-4 py-3 text-center">Scor</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right">Data solicitării</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {viewingRequests.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800">{r.purpose}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">{fmt(r.amount)} RON</td>
                            <td className="px-4 py-3 text-center">{r.termMonths} luni</td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-slate-100 border border-slate-200/50 text-slate-500 px-2 py-0.5 rounded font-bold">{r.creditScore}/100</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${requestStatusColors[r.status] || 'bg-slate-50 text-slate-500'}`}>
                                {r.status === 'Approved' ? 'Aprobat' : r.status === 'Rejected' ? 'Respins' : 'În analiză'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-400 font-normal">
                              {new Date(r.createdAt).toLocaleDateString('ro-RO')}
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
        </DialogContent>
      </Dialog>

      {/* Filter and search toolbar */}
      <div className="p-6 bg-white/80 border border-white/80 rounded-3xl shadow-sm backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-800 shrink-0">Bază de date clienți</h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Caută după nume, CNP sau email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 h-10 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full shadow-inner font-medium"
            />
          </div>

          {/* Employment status filter */}
          <div className="relative w-full sm:w-auto shrink-0">
            <select
              value={employmentFilter}
              onChange={e => setEmploymentFilter(e.target.value)}
              className="px-3 h-10 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full sm:w-44 shadow-sm font-semibold text-slate-650 appearance-none cursor-pointer pr-8"
            >
              <option value="all">Toate categoriile</option>
              <option value="Employed">Angajați</option>
              <option value="Unemployed">Șomeri / Fără venit</option>
              <option value="SelfEmployed">PFA / Antreprenori</option>
              <option value="Retired">Pensionari</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-r-0 border-t-[5px] border-b-0 border-t-slate-400 border-l-transparent border-r-transparent w-0 h-0" />
          </div>
        </div>
      </div>

      {/* Clients list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="bg-white/80 border border-white/80 rounded-3xl backdrop-blur-md">
          <CardContent className="py-16 text-center text-slate-400 font-medium">
            {debouncedSearch || employmentFilter !== 'all' ? 'Niciun client găsit pentru criteriile selectate.' : 'Nu există clienți înregistrați încă.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredClients.map(client => (
            <Card 
              key={client.id}
              onClick={() => handleViewClient(client)}
              className="bg-white/80 border border-white/80 rounded-3xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
            >
              <CardContent className="py-5 px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Hashed dynamic avatar */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getClientAvatarStyle(client.firstName, client.lastName)} flex items-center justify-center font-bold text-white text-base shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200`}>
                      {client.firstName[0]}{client.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors">{client.firstName} {client.lastName}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-1 truncate">
                        {client.email} <span className="mx-1.5 text-slate-200">·</span> CNP: {client.cnp}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 shrink-0 ml-auto md:ml-0">
                    <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold border ${employmentColors[client.employmentStatus] || 'bg-slate-50 text-slate-500'}`}>
                      {employmentLabel[client.employmentStatus] || client.employmentStatus}
                    </span>
                    
                    <div className="text-right whitespace-nowrap">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Venit declarati</span>
                      <span className="text-sm font-extrabold text-slate-700">{client.monthlyIncome?.toLocaleString()} RON</span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => openEdit(client, e)}
                        className="h-9 px-3 rounded-xl hover:bg-indigo-50 border-slate-200 text-slate-700 hover:text-indigo-650 flex items-center gap-1.5 font-bold cursor-pointer"
                      >
                        <Pencil size={13} />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => handleDelete(client.id, e)}
                        className="h-9 px-3 rounded-xl bg-red-50 hover:bg-red-600 border-none text-red-650 hover:text-white font-bold cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 size={13} />
                        Șterge
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pager
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ClientsPage;

