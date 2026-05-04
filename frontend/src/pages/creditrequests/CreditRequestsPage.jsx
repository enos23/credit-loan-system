import { useEffect, useState } from 'react';
import { getAllCreditRequests, createCreditRequest } from '../../api/creditRequestsApi';
import { getAllClients } from '../../api/clientsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, Plus, User, AlertCircle, FilePlus, ChevronRight } from 'lucide-react';

const statusColors = {
  Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Rejected: 'bg-red-50 text-red-600 border-red-100',
  Pending: 'bg-amber-50 text-amber-600 border-amber-100',
  UnderReview: 'bg-blue-50 text-blue-600 border-blue-100',
};

const riskColors = {
  Low: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-red-50 text-red-700',
};

const CreditRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    clientId: '', amount: '', termMonths: '', purpose: '',
  });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [reqRes, clientRes] = await Promise.all([
        getAllCreditRequests(),
        getAllClients(),
      ]);
      setRequests(reqRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createCreditRequest({
        clientId: form.clientId,
        amount: parseFloat(form.amount),
        termMonths: parseInt(form.termMonths),
        purpose: form.purpose,
      });
      setOpen(false);
      setForm({ clientId: '', amount: '', termMonths: '', purpose: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data || 'Eroare la crearea cererii.');
    }
  };

  const filtered = requests.filter(r =>
    `${r.clientFullName} ${r.purpose} ${r.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Cereri de credit</h1>
          <p className="text-slate-500 font-medium mt-1">{requests.length} cereri înregistrate</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-full text-sm font-semibold shadow-md hover:bg-slate-800 transition-all hover:scale-[1.02]">
              <Plus size={18} strokeWidth={2.5} className="text-white" />
              Cerere nouă
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-3xl p-8 border-slate-100 shadow-2xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold">Cerere nouă de credit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Client</Label>
                <Select onValueChange={v => setForm({...form, clientId: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Selectează client..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id} className="font-medium cursor-pointer">
                        {c.firstName} {c.lastName} — {c.cnp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sumă (RON)</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    required
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Termen (luni)</Label>
                  <Input
                    type="number"
                    value={form.termMonths}
                    onChange={e => setForm({...form, termMonths: e.target.value})}
                    required
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Scopul creditului</Label>
                <Input
                  value={form.purpose}
                  onChange={e => setForm({...form, purpose: e.target.value})}
                  placeholder="ex: Renovare apartament"
                  required
                  className="h-12 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg text-center">{error}</p>}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  Anulează
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
                  Trimite cererea
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} strokeWidth={2.5} />
        <input 
            placeholder="Caută după client, scop sau status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-md border border-white rounded-[1.2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium transition-all"
        />
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 w-full">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="w-full py-20 bg-white/80 backdrop-blur-md border border-white rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-slate-400">
           <FilePlus size={48} strokeWidth={1} className="mb-4 text-slate-300" />
           <p className="font-medium">{search ? 'Nicio cerere găsită.' : 'Nu există cereri de credit încă.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <div key={req.id} className="bg-white/80 backdrop-blur-xl p-5 border border-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer">
              
              {/* Client Info */}
              <div className="flex items-center gap-5 flex-1 max-w-xs">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                      <User size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{req.clientFullName}</h3>
                      <p className="text-sm font-medium text-slate-500 truncate">{req.purpose}</p>
                  </div>
              </div>

              {/* Stats */}
              <div className="flex-1 flex flex-wrap items-center gap-8 md:justify-center px-4">
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Sumă / Termen</p>
                      <p className="font-bold text-slate-700 flex items-center gap-2">
                          {req.amount?.toLocaleString()} RON
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{req.termMonths} luni</span>
                      </p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Scor / Risc</p>
                      <div className="flex items-center gap-2.5">
                         <span className="font-bold text-slate-800">{req.creditScore}/100</span>
                         <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${riskColors[req.riskLevel]}`}>
                            {req.riskLevel}
                         </span>
                      </div>
                  </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <div className={`px-4 py-1.5 border rounded-full text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${statusColors[req.status] || statusColors.Pending}`}>
                      {req.status === 'Rejected' && <AlertCircle size={14} strokeWidth={2.5} />}
                      {req.status === 'Approved' ? 'APROBAT' : req.status === 'Rejected' ? 'RESPINS' : 'PENDING'}
                  </div>
                  <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreditRequestsPage;
