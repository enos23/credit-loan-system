import { useEffect, useState } from 'react';
import { getAllCreditRequests, createCreditRequest } from '../../api/creditRequestsApi';
import { getAllClients, getClientById } from '../../api/clientsApi';
import { getDecisionsByCreditRequest } from '../../api/decisionsApi';
import { extractErrorMessage } from '../../api/errors';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import Pager from '@/components/ui/Pager';

const DEFAULT_PAGE_SIZE = 10;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { 
  Search, Plus, User, AlertCircle, FilePlus, X, Calendar, TrendingUp, 
  FileText, CheckCircle, XCircle, Clock, SlidersHorizontal, ArrowUpDown, 
  Briefcase, Phone, Mail, MapPin, Activity 
} from 'lucide-react';

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

// Amortization Schedule & Financial Helpers
const calculateMonthlyPayment = (principal, annualRate, termMonths) => {
  const r = annualRate / 100 / 12;
  const n = termMonths;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const generateAmortizationSchedule = (principal, annualRate, termMonths) => {
  const r = annualRate / 100 / 12;
  const n = termMonths;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);

  const schedule = [];
  let remainingBalance = principal;
  // Show first 12 months (or less if term is shorter) for UI readability
  for (let month = 1; month <= Math.min(n, 12); month++) {
    const interestPayment = remainingBalance * r;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      remaining: remainingBalance,
    });
  }
  return { 
    schedule, 
    monthlyPayment, 
    totalInterest: (monthlyPayment * n) - principal, 
    totalPayable: monthlyPayment * n 
  };
};

const calculateDTI = (income, expenses, installment) => {
  const inc = parseFloat(income) || 0;
  const exp = parseFloat(expenses) || 0;
  const inst = parseFloat(installment) || 0;
  if (inc <= 0) return 0;
  return Math.round(((exp + inst) / inc) * 100);
};

const calculateAge = (dobString) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const getClientAvatarStyle = (name = '') => {
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

const getInitials = (fullName = '') => {
  if (!fullName) return '?';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ScoreRing = ({ score }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const classification = score >= 80 ? 'Excelent' : score >= 60 ? 'Mediu' : 'Risc Ridicat';
  
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-extrabold text-slate-800 leading-none">{score}</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{classification}</p>
      </div>
    </div>
  );
};

const DTIGauge = ({ dti }) => {
  const statusText = dti < 40 ? 'Adecvat' : dti <= 50 ? 'La limită' : 'Supraîndatorat';
  const statusColorClass = dti < 40 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                           dti <= 50 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                           'bg-red-50 text-red-700 border-red-100';
  const progressBgClass = dti < 40 ? 'bg-emerald-500' :
                          dti <= 50 ? 'bg-amber-500' :
                          'bg-red-500';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grad Îndatorare (DTI)</span>
        <span className={`px-2 py-0.5 text-[9px] font-extrabold border rounded-md uppercase tracking-wider ${statusColorClass}`}>
          {dti}% {statusText}
        </span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full ${progressBgClass} rounded-full transition-all duration-1000`} 
          style={{ width: `${Math.min(dti, 100)}%` }} 
        />
      </div>
      <p className="text-[9px] text-slate-400">
        Limita legală reglementată de BNR pentru gradul de îndatorare este de <span className="font-bold">40%</span> din venituri.
      </p>
    </div>
  );
};

const AmortizationPreview = ({ principal, annualRate, termMonths }) => {
  const { schedule, monthlyPayment, totalInterest, totalPayable } = generateAmortizationSchedule(principal, annualRate, termMonths);

  return (
    <div className="space-y-3 pt-2">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        <Calendar size={12} className="text-slate-400" /> Plan Rambursare (Simulat)
      </h4>
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rată lunară</p>
          <p className="font-bold text-slate-700">{Math.round(monthlyPayment).toLocaleString()} RON</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total dobândă</p>
          <p className="font-bold text-slate-700">{Math.round(totalInterest).toLocaleString()} RON</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total rambursat</p>
          <p className="font-bold text-slate-700">{Math.round(totalPayable).toLocaleString()} RON</p>
        </div>
      </div>
      
      <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
              <th className="p-2 pl-3">Lună</th>
              <th className="p-2">Principal</th>
              <th className="p-2">Dobândă</th>
              <th className="p-2 pr-3 text-right">Sold Rămas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
            {schedule.map(row => (
              <tr key={row.month} className="hover:bg-slate-50/50">
                <td className="p-2 pl-3 font-semibold text-slate-800">Luna {row.month}</td>
                <td className="p-2">{Math.round(row.principal).toLocaleString()} RON</td>
                <td className="p-2">{Math.round(row.interest).toLocaleString()} RON</td>
                <td className="p-2 pr-3 text-right text-slate-500">{Math.round(row.remaining).toLocaleString()} RON</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[9px] text-slate-400 italic">
        *Tabelul arată primele {Math.min(termMonths, 12)} luni ale planului de amortizare în rate egale (anuități).
      </p>
    </div>
  );
};

const DetailModal = ({ req, onClose }) => {
  const [decision, setDecision] = useState(null);
  const [loadingDecision, setLoadingDecision] = useState(true);
  const [clientDetails, setClientDetails] = useState(null);
  const [loadingClient, setLoadingClient] = useState(true);

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

    const fetchClient = async () => {
      try {
        const res = await getClientById(req.clientId);
        setClientDetails(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingClient(false);
      }
    };

    fetchDecision();
    fetchClient();
  }, [req.id, req.clientId]);

  // Calculate Amortization
  const interestRate = (decision && decision.decisionType === 'Approved') 
    ? (decision.interestRate || 9.0) 
    : 9.0;
  const principalAmount = (decision && decision.decisionType === 'Approved')
    ? (decision.approvedAmount || req.amount)
    : req.amount;

  const { monthlyPayment } = generateAmortizationSchedule(
    principalAmount,
    interestRate,
    req.termMonths
  );

  const dti = clientDetails 
    ? calculateDTI(clientDetails.monthlyIncome, clientDetails.monthlyExpenses, monthlyPayment) 
    : 0;

  const clientAge = clientDetails ? calculateAge(clientDetails.dateOfBirth) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-4 border-b border-slate-50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{req.clientFullName}</h2>
              <span className={`px-3 py-1 border rounded-full text-[10px] font-extrabold uppercase tracking-widest ${statusColors[req.status] || statusColors.Pending}`}>
                {statusLabel[req.status] || req.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">Dosar credit: {req.purpose}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Credit details and amortization */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <FileText size={13} /> Informații Credit & Decizie
            </h3>

            {/* Score + Credit info */}
            <div className="flex gap-5 items-center bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <ScoreRing score={req.creditScore} />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sumă solicitată</p>
                  <p className="font-bold text-slate-800 text-base mt-0.5">{req.amount?.toLocaleString()} RON</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Perioadă</p>
                  <p className="font-bold text-slate-800 text-base mt-0.5">{req.termMonths} luni</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Risc Credit</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${riskColors[req.riskLevel]}`}>
                    {riskLabel[req.riskLevel] || req.riskLevel}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dată solicitare</p>
                  <p className="font-semibold text-slate-600 text-xs mt-1 flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-400" />
                    {new Date(req.createdAt).toLocaleDateString('ro-RO')}
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Details if exists */}
            {!loadingDecision && decision && (
              <div className={`rounded-2xl p-5 border ${
                decision.decisionType === 'Approved' ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-800' :
                decision.decisionType === 'Rejected' ? 'bg-red-50/50 border-red-100/50 text-red-800' :
                'bg-amber-50/50 border-amber-100/50 text-amber-800'
              }`}>
                <div className="flex items-start gap-3">
                  {decision.decisionType === 'Approved' ? <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" /> :
                   decision.decisionType === 'Rejected' ? <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" /> :
                   <Clock size={18} className="text-amber-500 mt-0.5 shrink-0" />}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 text-sm">Decizie: {decisionTypeLabel[decision.decisionType]}</p>
                      <p className="text-[10px] text-slate-400">{new Date(decision.createdAt).toLocaleDateString('ro-RO')}</p>
                    </div>
                    {decision.analystFullName && (
                      <p className="text-[11px] text-slate-500">Analist: <span className="font-semibold text-slate-700">{decision.analystFullName}</span></p>
                    )}
                    {decision.approvedAmount && (
                      <div className="flex gap-6 pt-1">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sumă aprobată</p>
                          <p className="font-bold text-slate-800 text-sm">{decision.approvedAmount?.toLocaleString()} RON</p>
                        </div>
                        {decision.interestRate && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dobândă</p>
                            <p className="font-bold text-slate-800 text-sm flex items-center gap-1"><TrendingUp size={12} className="text-emerald-500" />{decision.interestRate}%</p>
                          </div>
                        )}
                      </div>
                    )}
                    {decision.notes && (
                      <div className="bg-white/80 rounded-xl p-3 border border-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Observații decizie</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{decision.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Amortization Table */}
            <AmortizationPreview 
              principal={principalAmount} 
              annualRate={interestRate} 
              termMonths={req.termMonths} 
            />
          </div>

          {/* Column 2: Client Profile and DTI */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <User size={13} /> Profil Client & Indicatori BNR
            </h3>

            {loadingClient ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm gap-2">
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                Se încarcă profilul clientului...
              </div>
            ) : clientDetails ? (
              <div className="space-y-6">
                
                {/* Client Contact Info Card */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getClientAvatarStyle(req.clientFullName)} flex items-center justify-center text-white font-extrabold text-sm shrink-0`}>
                      {getInitials(req.clientFullName)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.clientFullName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CNP: {clientDetails.cnp} {clientAge && `• ${clientAge} ani`}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs space-y-2.5 text-slate-650">
                    <p className="flex items-center gap-2">
                      <Briefcase size={14} className="text-slate-400" />
                      <span className="font-semibold text-slate-700">{employmentLabel[clientDetails.employmentStatus] || clientDetails.employmentStatus}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span>{clientDetails.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span>{clientDetails.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="truncate">{clientDetails.address}</span>
                    </p>
                  </div>
                </div>

                {/* Client Finances */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Situație Financiară Declarată</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Venit Lunar</p>
                      <p className="font-extrabold text-emerald-600 text-base">{clientDetails.monthlyIncome?.toLocaleString()} RON</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cheltuieli Lunare</p>
                      <p className="font-extrabold text-slate-700 text-base">{clientDetails.monthlyExpenses?.toLocaleString()} RON</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <DTIGauge dti={dti} />
                  </div>
                </div>

                {/* Risk Guidelines & Summary */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-2.5">
                  <div className="flex gap-2 items-start text-xs text-slate-500">
                    <AlertCircle size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-700 mb-0.5">Analiză de risc recomandată</p>
                      <p className="leading-relaxed">
                        Scorul de credit de <span className="font-bold text-slate-700">{req.creditScore}</span> indică un risc {riskLabel[req.riskLevel]?.toLowerCase()}. 
                        {dti > 40 ? ' Clientul depășește gradul maxim de îndatorare reglementat BNR (40%). Se recomandă reducerea sumei sau prelungirea perioadei pentru a diminua DTI.' : ' Clientul se încadrează în limitele legale BNR privind gradul de îndatorare.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-red-50 rounded-xl border border-red-100">
                Nu s-au putut încărca datele suplimentare ale clientului.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, sub, iconBg, borderGlow, hoverGradient }) => (
  <div className={`relative overflow-hidden bg-white/80 border border-white/80 rounded-3xl p-5 shadow-sm backdrop-blur-md transition-all duration-300 group hover:scale-[1.02] hover:shadow-md ${borderGlow}`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${hoverGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
    <div className="flex items-center gap-4 relative z-10">
      <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

const CreditRequestsPage = () => {
  const { preferences } = useAuth();
  const pageSize = preferences?.itemsPerPage || DEFAULT_PAGE_SIZE;

  const [requests, setRequests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Filtering & Sorting State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [form, setForm] = useState({ clientId: '', amount: '', termMonths: '', purpose: '' });
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await getAllCreditRequests({
        page,
        pageSize,
        search: debouncedSearch,
      });
      setRequests(res.data.items);
      setTotalCount(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientLookup = async () => {
    try {
      const res = await getAllClients({ pageSize: 1000 });
      setClients(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchClientLookup(); }, []);
  useEffect(() => { setPage(1); }, [debouncedSearch, pageSize]);
  useEffect(() => { fetchRequests(); }, [page, debouncedSearch, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

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
      fetchRequests();
    } catch (err) {
      setError(extractErrorMessage(err, 'Eroare la crearea cererii.'));
    }
  };

  // Filter & Sort requests client-side on the loaded page items
  const filteredAndSortedRequests = [...requests]
    .filter(req => {
      const matchStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchRisk = riskFilter === 'all' || req.riskLevel === riskFilter;
      return matchStatus && matchRisk;
    })
    .sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      
      if (sortKey === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }
      
      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      
      return sortOrder === 'asc' 
        ? (valA > valB ? 1 : -1) 
        : (valA < valB ? 1 : -1);
    });

  // Calculate stats based on visible items
  const stats = {
    total: totalCount,
    approved: filteredAndSortedRequests.filter(r => r.status === 'Approved').length,
    underReview: filteredAndSortedRequests.filter(r => r.status === 'UnderReview' || r.status === 'Pending').length,
    avgScore: filteredAndSortedRequests.length > 0 
      ? Math.round(filteredAndSortedRequests.reduce((acc, r) => acc + r.creditScore, 0) / filteredAndSortedRequests.length) 
      : 0
  };

  // Form selected client info & live payment calculations
  const selectedClientInfo = clients.find(c => c.id === form.clientId);
  const formAmountNum = parseFloat(form.amount) || 0;
  const formTermNum = parseInt(form.termMonths) || 0;
  const simulatedFormInstallment = (formAmountNum > 0 && formTermNum > 0)
    ? calculateMonthlyPayment(formAmountNum, 9.0, formTermNum)
    : 0;
  const simulatedFormDTI = (selectedClientInfo && simulatedFormInstallment > 0)
    ? calculateDTI(selectedClientInfo.monthlyIncome, selectedClientInfo.monthlyExpenses, simulatedFormInstallment)
    : 0;

  const quickTerms = [12, 24, 36, 60];

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto pb-12">
      
      {/* Header section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Cereri de credit</h1>
          <p className="text-slate-500 font-medium mt-1">{totalCount} cereri înregistrate</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-full text-sm font-semibold shadow-md hover:bg-slate-800 transition-all hover:scale-[1.02]">
              <Plus size={18} strokeWidth={2.5} />
              Cerere nouă
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl w-full rounded-3xl p-8 border-slate-100 shadow-2xl overflow-y-auto max-h-[95vh]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold">Cerere nouă de credit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Client Selector */}
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
                
                {/* Visual feedback for selected client */}
                {selectedClientInfo && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 grid grid-cols-2 gap-2 mt-1.5">
                    <p>CNP: <span className="font-semibold text-slate-700">{selectedClientInfo.cnp}</span></p>
                    <p>Statut: <span className="font-semibold text-slate-700">{employmentLabel[selectedClientInfo.employmentStatus] || selectedClientInfo.employmentStatus}</span></p>
                    <p>Venit Lunar: <span className="font-semibold text-slate-700">{selectedClientInfo.monthlyIncome?.toLocaleString()} RON</span></p>
                    <p>Cheltuieli: <span className="font-semibold text-slate-700">{selectedClientInfo.monthlyExpenses?.toLocaleString()} RON</span></p>
                  </div>
                )}
              </div>

              {/* Amount and Term */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sumă (RON)</Label>
                  <Input 
                    type="number" 
                    value={form.amount} 
                    onChange={e => setForm({ ...form, amount: e.target.value })} 
                    placeholder="Suma creditului"
                    required 
                    className="h-12 rounded-xl bg-slate-50 border-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Termen (luni)</Label>
                  <Input 
                    type="number" 
                    value={form.termMonths} 
                    onChange={e => setForm({ ...form, termMonths: e.target.value })} 
                    placeholder="Perioada în luni"
                    required 
                    className="h-12 rounded-xl bg-slate-50 border-slate-200" 
                  />
                  {/* Quick terms selectors */}
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {quickTerms.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, termMonths: t.toString() })}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                          form.termMonths === t.toString()
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {t} luni
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Scopul creditului</Label>
                <Input 
                  value={form.purpose} 
                  onChange={e => setForm({ ...form, purpose: e.target.value })} 
                  placeholder="ex: Renovare locuință, achiziție auto" 
                  required 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200" 
                />
              </div>

              {/* Live installment computation inside form */}
              {simulatedFormInstallment > 0 && (
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Rată lunară estimată</span>
                    <span className="text-sm font-extrabold text-indigo-700">{Math.round(simulatedFormInstallment).toLocaleString()} RON</span>
                  </div>
                  <p className="text-[10px] text-indigo-400">Calcul estimativ bazat pe o dobândă standard de referință de 9.0% p.a.</p>
                  
                  {selectedClientInfo && (
                    <div className="pt-2 border-t border-indigo-100/30 flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Grad Îndatorare (DTI) estimat</span>
                      <span className={`text-xs font-extrabold ${simulatedFormDTI > 40 ? 'text-red-650' : 'text-emerald-600'}`}>
                        {simulatedFormDTI}% {simulatedFormDTI > 40 ? '(Depășește 40% BNR)' : '(Admis legal)'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg text-center">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-650 hover:bg-slate-100 transition-colors text-sm">Anulează</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors text-sm">Trimite cererea</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          icon={FileText} 
          label="Total Cereri" 
          value={stats.total} 
          sub="Înregistrate în total" 
          iconBg="bg-slate-100 text-slate-600" 
          borderGlow="border-slate-100/50"
          hoverGradient="from-slate-500 to-slate-600"
        />
        <StatsCard 
          icon={CheckCircle} 
          label="Aprobate (Pag.)" 
          value={stats.approved} 
          sub="Rată mare de succes" 
          iconBg="bg-emerald-50 text-emerald-600" 
          borderGlow="hover:border-emerald-200/50"
          hoverGradient="from-emerald-500 to-emerald-600"
        />
        <StatsCard 
          icon={Clock} 
          label="În Analiză (Pag.)" 
          value={stats.underReview} 
          sub="Decizii pendinte" 
          iconBg="bg-blue-50 text-blue-600" 
          borderGlow="hover:border-blue-200/50"
          hoverGradient="from-blue-500 to-blue-600"
        />
        <StatsCard 
          icon={Activity} 
          label="Scor Mediu (Pag.)" 
          value={`${stats.avgScore}/100`} 
          sub="Calitatea portofoliului" 
          iconBg="bg-indigo-50 text-indigo-600" 
          borderGlow="hover:border-indigo-200/50"
          hoverGradient="from-indigo-500 to-indigo-600"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
          <input
            placeholder="Caută după client sau scop..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md border border-white rounded-[1.2rem] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-750 font-medium text-sm transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status */}
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 border border-white rounded-xl shadow-sm text-xs font-semibold text-slate-600">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer focus:ring-0"
            >
              <option value="all">Toate</option>
              <option value="Approved">Aprobate</option>
              <option value="Rejected">Respinse</option>
              <option value="Pending">În așteptare</option>
              <option value="UnderReview">În analiză</option>
            </select>
          </div>

          {/* Risc */}
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 border border-white rounded-xl shadow-sm text-xs font-semibold text-slate-600">
            <span className="text-slate-400">Risc:</span>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer focus:ring-0"
            >
              <option value="all">Toate</option>
              <option value="Low">Scăzut</option>
              <option value="Medium">Mediu</option>
              <option value="High">Ridicat</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 border border-white rounded-xl shadow-sm text-xs font-semibold text-slate-600">
            <span className="text-slate-400">Ordonează după:</span>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer focus:ring-0"
            >
              <option value="createdAt">Dată Creare</option>
              <option value="amount">Sumă Solicitată</option>
              <option value="creditScore">Scor Credit</option>
            </select>
          </div>

          {/* Toggle Sort Direction */}
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white/80 border border-white rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
            title={sortOrder === 'asc' ? 'Crescător' : 'Descrescător'}
          >
            <ArrowUpDown size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 w-full">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
        </div>
      ) : filteredAndSortedRequests.length === 0 ? (
        <div className="w-full py-20 bg-white/80 backdrop-blur-md border border-white rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-slate-400">
          <FilePlus size={48} strokeWidth={1} className="mb-4 text-slate-300" />
          <p className="font-medium">{debouncedSearch || statusFilter !== 'all' || riskFilter !== 'all' ? 'Nicio cerere nu se potrivește filtrelor selectate.' : 'Nu există cereri de credit încă.'}</p>
        </div>
      ) : (
        <>
        <div className="space-y-4">
          {filteredAndSortedRequests.map(req => {
            const avatarStyle = getClientAvatarStyle(req.clientFullName);
            return (
              <div
                key={req.id}
                onClick={() => setSelected(req)}
                className="bg-white/80 backdrop-blur-xl p-5 border border-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer"
              >
                {/* Client identity & Avatar */}
                <div className="flex items-center gap-5 flex-1 max-w-xs">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarStyle} flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                    {getInitials(req.clientFullName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{req.clientFullName}</h3>
                    <p className="text-sm font-medium text-slate-500 truncate">{req.purpose}</p>
                  </div>
                </div>

                {/* Amount and Score details */}
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
                      <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${riskColors[req.riskLevel]}`}>
                        {riskLabel[req.riskLevel] || req.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <div className={`px-4 py-1.5 border rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${statusColors[req.status] || statusColors.Pending}`}>
                    {req.status === 'Rejected' && <AlertCircle size={13} strokeWidth={2.5} />}
                    {statusLabel[req.status] || req.status}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Pager
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
        />
        </>
      )}

      {selected && <DetailModal req={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default CreditRequestsPage;
