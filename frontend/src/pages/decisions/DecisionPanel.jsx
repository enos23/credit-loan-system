import { useEffect, useState } from 'react';
import { getAllCreditRequests } from '../../api/creditRequestsApi';
import { createDecision, getDecisionsByCreditRequest } from '../../api/decisionsApi';
import { getClientById } from '../../api/clientsApi';
import { extractErrorMessage } from '../../api/errors';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { 
    CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, Scale, 
    Settings2, ChevronDown, ChevronUp, User, Phone, Mail, MapPin, 
    Briefcase, ShieldAlert, Check, X, Search, Info
} from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusColors = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
    Rejected: 'bg-red-50 text-red-600 border-red-100/50',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100/50',
    UnderReview: 'bg-blue-50 text-blue-600 border-blue-100/50',
};

const riskColors = {
    Low: 'text-emerald-600 bg-emerald-50 border border-emerald-100/50',
    Medium: 'text-amber-600 bg-amber-50 border border-amber-100/50',
    High: 'text-red-500 bg-red-50 border border-red-100/50',
};

const calculateSimulatedInstallment = (principal, annualRate, termMonths) => {
    const p = parseFloat(principal) || 0;
    const rate = parseFloat(annualRate) || 0;
    const term = parseInt(termMonths) || 12;
    if (p <= 0 || term <= 0) return 0;
    if (rate === 0) return p / term;
    const r = rate / 100 / 12;
    const factor = Math.pow(1 + r, term);
    return p * r * factor / (factor - 1);
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

const translateEmployment = (status = '') => {
    switch (status.toLowerCase()) {
        case 'employed': return 'Salariat';
        case 'unemployed': return 'Șomer / Fără venit';
        case 'selfemployed': return 'Independent / PFA';
        case 'retired': return 'Pensionar';
        default: return status;
    }
};

const ScoreGauge = ({ score, showLabel = true }) => {
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'Excelent' : score >= 60 ? 'Mediu' : 'Scăzut';
    const percentage = (score / 100) * 100;

    return (
        <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                    <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke={color} strokeWidth="3.5"
                        strokeDasharray={`${percentage} 100`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1.5s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold tracking-tight" style={{ color }}>{score}</span>
                </div>
            </div>
            {showLabel && (
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5" style={{ color }}>
                    Scor {label}
                </span>
            )}
        </div>
    );
};

const DecisionPanel = () => {
    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    
    // Details of client being analyzed
    const [clientDetails, setClientDetails] = useState(null);
    const [loadingClient, setLoadingClient] = useState(false);

    // Form inputs
    const [form, setForm] = useState({
        decisionType: '', interestRate: '', approvedAmount: '', notes: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // History expansion state
    const [expandedHistory, setExpandedHistory] = useState({}); // { requestId: decisionObj }
    const [loadingHistoryId, setLoadingHistoryId] = useState(null);

    // Filter states
    const [pendingSearch, setPendingSearch] = useState('');
    const [historySearch, setHistorySearch] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await getAllCreditRequests({ pageSize: 1000 });
            setRequests(res.data.items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleSelect = async (req) => {
        setSelected(req);
        setForm({
            decisionType: '',
            interestRate: req.creditScore >= 80 ? '5.5' : req.creditScore >= 60 ? '9.0' : '14.0',
            approvedAmount: req.amount.toString(),
            notes: '',
        });
        setError('');
        setSuccess('');
        setOpen(true);
        setLoadingClient(true);
        setClientDetails(null);
        
        try {
            const res = await getClientById(req.clientId);
            setClientDetails(res.data);
        } catch (err) {
            console.error("Eroare la preluarea datelor clientului:", err);
        } finally {
            setLoadingClient(false);
        }
    };

    const handleDecision = async (type) => {
        setError('');
        try {
            await createDecision({
                creditRequestId: selected.id,
                decisionType: type,
                interestRate: type === 'Approved' ? parseFloat(form.interestRate) : null,
                approvedAmount: type === 'Approved' ? parseFloat(form.approvedAmount) : null,
                notes: form.notes,
            });
            setSuccess(`Decizia de tip "${type === 'Approved' ? 'Aprobare' : type === 'Rejected' ? 'Respingere' : 'Cerere Info'}" a fost salvată!`);
            setTimeout(() => {
                setOpen(false);
                fetchRequests();
            }, 1000);
        } catch (err) {
            setError(extractErrorMessage(err, 'Eroare la salvarea deciziei.'));
        }
    };

    const toggleHistory = async (requestId) => {
        if (expandedHistory[requestId]) {
            const updated = { ...expandedHistory };
            delete updated[requestId];
            setExpandedHistory(updated);
        } else {
            setLoadingHistoryId(requestId);
            try {
                const res = await getDecisionsByCreditRequest(requestId);
                setExpandedHistory(prev => ({ ...prev, [requestId]: res.data }));
            } catch (err) {
                console.error("Eroare la preluarea deciziei:", err);
            } finally {
                setLoadingHistoryId(null);
            }
        }
    };

    const pending = requests.filter(r => 
        (r.status === 'Pending' || r.status === 'UnderReview') &&
        (r.clientFullName.toLowerCase().includes(pendingSearch.toLowerCase()) || 
         r.purpose.toLowerCase().includes(pendingSearch.toLowerCase()))
    );

    const decided = requests.filter(r => 
        (r.status === 'Approved' || r.status === 'Rejected') &&
        (r.clientFullName.toLowerCase().includes(historySearch.toLowerCase()) || 
         r.purpose.toLowerCase().includes(historySearch.toLowerCase()))
    );

    // Live DTI and installment calculations
    const simulatedInstallment = selected ? calculateSimulatedInstallment(
        form.approvedAmount || selected.amount,
        form.interestRate,
        selected.termMonths
    ) : 0;

    const dti = (clientDetails && selected) ? calculateDTI(
        clientDetails.monthlyIncome,
        clientDetails.monthlyExpenses,
        simulatedInstallment
    ) : 0;

    return (
        <div className="space-y-8 font-sans max-w-6xl mx-auto pb-12 px-4 sm:px-0">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                    <Scale className="text-indigo-600" size={32} /> Panel Analist
                </h1>
                <p className="text-slate-500 font-medium mt-1">Analizează creditele intrate, verifică DTI-ul și emite decizii</p>
            </div>

            {/* Cereri în așteptare */}
            <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Cereri în așteptare 
                        <span className="bg-amber-100 text-amber-700 text-xs px-3 py-0.5 rounded-full font-extrabold">
                            {requests.filter(r => r.status === 'Pending' || r.status === 'UnderReview').length}
                        </span>
                    </h2>
                    
                    {/* Search Pending */}
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Caută în cereri..."
                            value={pendingSearch}
                            onChange={e => setPendingSearch(e.target.value)}
                            className="pl-9 pr-4 h-10 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full shadow-sm font-medium"
                        />
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-20 w-full">
                        <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                    </div>
                ) : pending.length === 0 ? (
                    <div className="w-full py-20 bg-white/80 backdrop-blur-md border border-white rounded-3xl shadow-sm flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle size={48} strokeWidth={1} className="mb-4 text-emerald-400" />
                        <p className="font-semibold text-slate-500">{pendingSearch ? 'Nicio cerere nu corespunde căutării.' : 'Nu există cereri în așteptare. Totul este la zi!'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                        {pending.map(req => (
                            <div key={req.id} 
                                onClick={() => handleSelect(req)}
                                className="bg-white/80 border border-white rounded-3xl p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-6 cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute inset-y-0 left-0 w-1.5 bg-indigo-600" />
                                <ScoreGauge score={req.creditScore} />
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-slate-800 leading-tight truncate">{req.clientFullName}</h3>
                                    <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-500 mt-1">
                                        {req.purpose}
                                    </span>
                                    
                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Sumă Solicitată</span>
                                            <span className="font-extrabold text-slate-800 text-base">
                                                {fmt(req.amount)} RON
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl ${riskColors[req.riskLevel]}`}>
                                            Risc {req.riskLevel === 'Low' ? 'Scăzut' : req.riskLevel === 'Medium' ? 'Mediu' : 'Ridicat'}
                                        </span>
                                    </div>
                                    
                                    <button className="w-full mt-4 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
                                        Analizează Cererea
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cereri decise (Istoric) */}
            <div className="mt-12 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Istoric Decizii
                    </h2>
                    
                    {/* Search History */}
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Caută în istoric..."
                            value={historySearch}
                            onChange={e => setHistorySearch(e.target.value)}
                            className="pl-9 pr-4 h-10 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full shadow-sm font-medium"
                        />
                    </div>
                </div>
                
                {decided.length === 0 ? (
                    <div className="w-full py-10 bg-slate-50 border border-slate-100 rounded-3xl text-center text-slate-400 font-medium">
                        {historySearch ? 'Nicio decizie nu corespunde căutării.' : 'Nu există decizii salvate în istoric.'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {decided.map(req => {
                            const isExpanded = !!expandedHistory[req.id];
                            const decision = expandedHistory[req.id];
                            const isLoadingHistory = loadingHistoryId === req.id;

                            return (
                                <div 
                                    key={req.id} 
                                    className="bg-white/70 border border-slate-100 rounded-2xl overflow-hidden transition-all shadow-2xs hover:border-slate-200"
                                >
                                    {/* Header Row */}
                                    <div 
                                        onClick={() => toggleHistory(req.id)}
                                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                                {req.status === 'Approved' ? <Check size={18} strokeWidth={2.5} /> : <X size={18} strokeWidth={2.5} />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-800 text-sm truncate">{req.clientFullName}</h3>
                                                <p className="text-xs font-semibold text-slate-400 mt-0.5 truncate">
                                                    {req.purpose} <span className="mx-1.5 font-normal text-slate-300">|</span> {fmt(req.amount)} RON
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="font-extrabold text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                                Scor: {req.creditScore}
                                            </span>
                                            <span className={`px-3 py-1 border rounded-xl text-[10px] font-extrabold uppercase tracking-wide ${statusColors[req.status]}`}>
                                                {req.status === 'Approved' ? 'Aprobat' : 'Respins'}
                                            </span>
                                            {isLoadingHistory ? (
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin" />
                                            ) : isExpanded ? (
                                                <ChevronUp size={16} className="text-slate-400" />
                                            ) : (
                                                <ChevronDown size={16} className="text-slate-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded decision information */}
                                    {isExpanded && decision && (
                                        <div className="px-14 pb-5 pt-2 border-t border-slate-50 bg-slate-50/30 text-xs text-slate-600 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Suma Aprobată</span>
                                                    <span className="font-bold text-slate-700 text-sm">
                                                        {decision.approvedAmount ? `${fmt(decision.approvedAmount)} RON` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rată Dobândă</span>
                                                    <span className="font-bold text-slate-700 text-sm">
                                                        {decision.interestRate ? `${decision.interestRate}% / an` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Decis de</span>
                                                    <span className="font-bold text-slate-700 text-sm">{decision.analystFullName || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Data deciziei</span>
                                                    <span className="font-bold text-slate-750 text-sm">
                                                        {new Date(decision.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {decision.notes && (
                                                <div className="bg-white border border-slate-100 rounded-xl p-3.5 mt-2">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Justificare Analist</span>
                                                    <p className="text-slate-600 font-medium italic">"{decision.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Dialog decizie */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-4xl w-full rounded-3xl p-8 border-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                            <Settings2 className="text-indigo-600" size={24} /> 
                            Finalizare Decizie &amp; Analiză Financiară
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Analizează dosarul clientului și configurează parametrii aprobării creditului.
                        </DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                            
                            {/* Left side: Client Dossier & Financial analysis */}
                            <div className="lg:col-span-7 space-y-5">
                                {loadingClient ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-slate-100 gap-3">
                                        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                        <span className="text-xs font-semibold text-slate-400">Se încarcă dosarul clientului...</span>
                                    </div>
                                ) : clientDetails ? (
                                    <div className="space-y-4">
                                        {/* Personal Card */}
                                        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                                <User size={14} className="text-indigo-500" />
                                                Date Identificare Client
                                            </h4>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold block">Nume complet</span>
                                                    <span className="font-bold text-slate-700">{clientDetails.firstName} {clientDetails.lastName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold block">CNP / Vârstă</span>
                                                    <span className="font-bold text-slate-700">{clientDetails.cnp} ({calculateAge(clientDetails.dateOfBirth)} ani)</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold block">Telefon</span>
                                                    <span className="font-semibold text-slate-600">{clientDetails.phone}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold block">Statut profesional</span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 mt-0.5">
                                                        {translateEmployment(clientDetails.employmentStatus)}
                                                    </span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-[10px] text-slate-400 font-bold block">Adresă</span>
                                                    <span className="font-medium text-slate-600 truncate block">{clientDetails.address}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financial Analysis Card */}
                                        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                                <Scale size={14} className="text-indigo-500" />
                                                Analiză Venituri vs Cheltuieli
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-2xs">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Venit Lunar</span>
                                                    <span className="text-base font-extrabold text-emerald-600 block mt-0.5">{fmt(clientDetails.monthlyIncome)} RON</span>
                                                </div>
                                                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-2xs">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Cheltuieli Lunare</span>
                                                    <span className="text-base font-extrabold text-slate-600 block mt-0.5">{fmt(clientDetails.monthlyExpenses)} RON</span>
                                                </div>
                                            </div>

                                            {/* DTI Gauge */}
                                            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs space-y-3">
                                                <div className="flex justify-between items-center text-xs font-bold">
                                                    <span className="text-slate-500 uppercase tracking-wide">Grad de îndatorare (DTI)</span>
                                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                                        dti < 40 ? 'bg-emerald-50 text-emerald-700' :
                                                        dti <= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                                    }`}>
                                                        {dti}% {dti < 40 ? 'Adecvat' : dti <= 50 ? 'La limită' : 'Supraîndatorat'}
                                                    </span>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden relative">
                                                    <div 
                                                        className={`h-full transition-all duration-300 ${
                                                            dti < 40 ? 'bg-emerald-500' :
                                                            dti <= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${Math.min(dti, 100)}%` }}
                                                    />
                                                    {/* BNR Limit line at 40% */}
                                                    <div className="absolute top-0 bottom-0 left-[40%] border-l border-dashed border-slate-400" />
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                                                    <span>Rată simulată: {fmt(simulatedInstallment)} RON</span>
                                                    <span>Limită recomandată BNR: 40%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-450 font-medium">
                                        Eroare la încărcarea datelor clientului.
                                    </div>
                                )}
                            </div>

                            {/* Right side: Parameters Tuner & Decision */}
                            <div className="lg:col-span-5 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <TrendingUp size={14} className="text-indigo-500" />
                                    Parametri Credit Aprobat
                                </h4>

                                <div className="space-y-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sumă Aprobată (RON)</Label>
                                        <Input
                                            type="number"
                                            value={form.approvedAmount}
                                            onChange={e => setForm({ ...form, approvedAmount: e.target.value })}
                                            className="h-11 rounded-xl bg-white border-slate-200 text-lg font-bold text-slate-700 focus-visible:ring-indigo-500/20"
                                        />
                                        <span className="text-[10px] text-slate-400 ml-1 font-semibold block">Solicitat: {fmt(selected.amount)} RON</span>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Dobândă Sugerată (%) / an</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={form.interestRate}
                                            onChange={e => setForm({ ...form, interestRate: e.target.value })}
                                            className="h-11 rounded-xl bg-white border-slate-200 text-lg font-bold text-slate-700 focus-visible:ring-indigo-500/20"
                                        />
                                        <span className="text-[10px] text-slate-400 ml-1 font-semibold block">
                                            Sugerată de scor: {selected.creditScore >= 80 ? '5.5%' : selected.creditScore >= 60 ? '9.0%' : '14.0%'}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notițe Decizie (Justificare)</Label>
                                        <textarea
                                            className="w-full h-20 rounded-xl bg-white border-slate-200 p-3 text-sm font-medium text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border"
                                            placeholder="Adaugă observații pentru decizie..."
                                            value={form.notes}
                                            onChange={e => setForm({ ...form, notes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-center animate-in fade-in">{error}</p>}
                                {success && <p className="text-emerald-700 text-xs font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center animate-in fade-in">{success}</p>}

                                <div className="flex flex-col gap-3 pt-1">
                                    <button
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                                        onClick={() => handleDecision('Approved')}
                                    >
                                        <Check size={16} /> Aprobă Creditul
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/10 hover:shadow-red-600/20"
                                            onClick={() => handleDecision('Rejected')}
                                        >
                                            <X size={14} /> Respinge
                                        </button>
                                        <button
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/50 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
                                            onClick={() => handleDecision('NeedsMoreInfo')}
                                        >
                                            <Info size={14} /> Cere Informații
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DecisionPanel;