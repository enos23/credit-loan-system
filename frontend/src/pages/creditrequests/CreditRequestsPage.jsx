import { useEffect, useState } from 'react';
import { getAllCreditRequests, createCreditRequest } from '../../api/creditRequestsApi';
import { getAllClients } from '../../api/clientsApi';
import { getDecisionsByCreditRequest } from '../../api/decisionsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, Plus, User, AlertCircle, FilePlus, X, Calendar, TrendingUp, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusColors = {
  Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Rejected: 'bg-red-50 text-red-600 border-red-100',
  Pending: 'bg-amber-50 text-amber-600 border-amber-100',
  UnderReview: 'bg-blue-50 text-blue-600 border-blue-100',
};

const statusLabel = {
  Approved: 'APROBAT',
  Rejected: 'RESPINS',
  Pending: 'ÎN AȘTEPTARE',
  UnderReview: 'ÎN ANALIZĂ',
};

const riskColors = {
  Low: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-red-50 text-red-700',
};

const riskLabel = { Low: 'Scăzut', Medium: 'Mediu', High: 'Ridicat' };

const employmentLabel = {
  Employed: 'Angajat',
  Unemployed: 'Neangajat',
  SelfEmployed: 'PFA / Antreprenor',
  Retired: 'Pensionar',
};

const decisionTypeLabel = {
  Approved: 'Aprobat',
  Rejected: 'Respins',
  NeedsMoreInfo: 'Necesită informații suplimentare',
};

const ScoreRing = ({ score }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-extrabold text-slate-800 leading-none">{score}</p>
        <p className="text-[10px] text-slate-400 font-semibold">/100</p>
      </div>
    </div>
  );
};

const DetailModal = ({ req, onClose }) => {
  const [decision, setDecision] = useState(null);
  const [loadingDecision, setLoadingDecision] = useState(true);

  useEffect(() => {
    const fetchDecision = async () => {
      try {
        const res = await getDecisionsByCreditRequest(req.id);
        setDecision(res.data);
      } catch {
        setDecision(null);
      } finally {
        setLoadingDecision(false);
      }
    };
    fetchDecision();
  }, [req.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100">

        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-0">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{req.clientFullName}</h2>
            <p className="text-slate-500 text-sm mt-1">{req.purpose}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 border rounded-full text-[11px] font-extrabold uppercase tracking-widest ${statusColors[req.status] || statusColors.Pending}`}>
              {statusLabel[req.status] || req.status}
            </span>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Score + Credit info */}
          <div className="flex gap-6 items-center bg-slate-50 rounded-2xl p-5">
            <ScoreRing score={req.creditScore} />
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sumă solicitată</p>
                <p className="font-bold text-slate-800 text-lg mt-1">{req.amount?.toLocaleString()} RON</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Termen</p>
                <p className="font-bold text-slate-800 text-lg mt-1">{req.termMonths} luni</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nivel risc</p>
                <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide ${riskColors[req.riskLevel]}`}>
                  {riskLabel[req.riskLevel] || req.riskLevel}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dată creare</p>
                <p className="font-semibold text-slate-700 text-sm mt-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  {new Date(req.createdAt).toLocaleDateString('ro-RO')}
                </p>
              </div>
            </div>
          </div>

          {/* Analyst */}
          {req.assignedAnalystName && (
            <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50 rounded-2xl border border-blue-100">
              <User size={16} className="text-blue-500" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Analist asignat</p>
                <p className="text-sm font-semibold text-blue-800">{req.assignedAnalystName}</p>
              </div>
            </div>
          )}

          {/* Decision */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <FileText size={13} /> Decizie
            </h3>
            {loadingDecision ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                Se încarcă decizia...
              </div>
            ) : decision ? (
              <div className={`rounded-2xl p-5 border ${
                decision.decisionType === 'Approved' ? 'bg-emerald-50 border-emerald-100' :
                decision.decisionType === 'Rejected' ? 'bg-red-50 border-red-100' :
                'bg-amber-50 border-amber-100'
              }`}>
                <div className="flex items-start gap-3">
                  {decision.decisionType === 'Approved' ? <CheckCircle size={20} className="text-emerald-500 mt-0.5 shrink-0" /> :
                   decision.decisionType === 'Rejected' ? <XCircle size={20} className="text-red-500 mt-0.5 shrink-0" /> :
                   <Clock size={20} className="text-amber-500 mt-0.5 shrink-0" />}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800">{decisionTypeLabel[decision.decisionType]}</p>
                      <p className="text-xs text-slate-400">{new Date(decision.createdAt).toLocaleDateString('ro-RO')}</p>
                    </div>
                    {decision.analystFullName && (
                      <p className="text-xs text-slate-500">Analist: <span className="font-semibold text-slate-700">{decision.analystFullName}</span></p>
                    )}
                    {decision.approvedAmount && (
                      <div className="flex gap-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sumă aprobată</p>
                          <p className="font-bold text-slate-800">{decision.approvedAmount?.toLocaleString()} RON</p>
                        </div>
                        {decision.interestRate && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dobândă</p>
                            <p className="font-bold text-slate-800 flex items-center gap-1"><TrendingUp size={13} className="text-emerald-500" />{decision.interestRate}%</p>
                          </div>
                        )}
                      </div>
                    )}
                    {decision.notes && (
                      <div className="bg-white/60 rounded-xl p-3 border border-white/80">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Note</p>
                        <p className="text-sm text-slate-700">{decision.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-sm">
                <Clock size={16} />
                Nicio decizie înregistrată încă.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreditRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ clientId: '', amount: '', termMonths: '', purpose: '' });
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

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
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Cereri de credit</h1>
          <p className="text-slate-500 font-medium mt-1">{requests.length} cereri înregistrate</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-full text-sm font-semibold shadow-md hover:bg-slate-800 transition-all hover:scale-[1.02]">
              <Plus size={18} strokeWidth={2.5} />
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
                <Select onValueChange={v => setForm({ ...form, clientId: v })}>
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
                  <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Termen (luni)</Label>
                  <Input type="number" value={form.termMonths} onChange={e => setForm({ ...form, termMonths: e.target.value })} required className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Scopul creditului</Label>
                <Input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="ex: Renovare apartament" required className="h-12 rounded-xl bg-slate-50 border-slate-200" />
              </div>

              {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg text-center">{error}</p>}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Anulează</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">Trimite cererea</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} strokeWidth={2.5} />
        <input
          placeholder="Caută după client, scop sau status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-md border border-white rounded-[1.2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium transition-all"
        />
      </div>

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
            <div
              key={req.id}
              onClick={() => setSelected(req)}
              className="bg-white/80 backdrop-blur-xl p-5 border border-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer"
            >
              <div className="flex items-center gap-5 flex-1 max-w-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{req.clientFullName}</h3>
                  <p className="text-sm font-medium text-slate-500 truncate">{req.purpose}</p>
                </div>
              </div>

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
                      {riskLabel[req.riskLevel] || req.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                <div className={`px-4 py-1.5 border rounded-full text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${statusColors[req.status] || statusColors.Pending}`}>
                  {req.status === 'Rejected' && <AlertCircle size={14} strokeWidth={2.5} />}
                  {statusLabel[req.status] || req.status}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <DetailModal req={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default CreditRequestsPage;
