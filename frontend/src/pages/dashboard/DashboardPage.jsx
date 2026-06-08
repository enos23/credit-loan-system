import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../../api/dashboardApi';
import { getCreditRequestById } from '../../api/creditRequestsApi';
import { getClientById } from '../../api/clientsApi';
import { getDecisionsByCreditRequest } from '../../api/decisionsApi';
import { useAuth } from '../../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
    AreaChart, Area
} from 'recharts';
import {
    Users, FileText, CheckCircle, Clock, TrendingUp, TrendingDown,
    AlertCircle, MoveRight, User, Settings, HelpCircle, LogOut, Shield,
    ChevronDown, Plus, PieChart as PieChartIcon, BadgePercent, Wallet, X,
    Calendar, Briefcase, Phone, Mail, MapPin, Activity
} from 'lucide-react';
import Avatar from '../../components/ui/Avatar';

const STATUS_STYLES = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Rejected: 'bg-red-50 text-red-600 border-red-100',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
};
const STATUS_LABELS = { Approved: 'Aprobat', Rejected: 'Respins', Pending: 'În așteptare' };

const RISK_STYLES = {
    Low: { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'Scăzut' },
    Medium: { bar: 'bg-amber-400', text: 'text-amber-600', label: 'Mediu' },
    High: { bar: 'bg-red-500', text: 'text-red-600', label: 'Ridicat' },
};

const formatAmount = (val) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toFixed(0);
};

const TrendBadge = ({ value }) => {
    if (value == null) return <span className="text-xs text-slate-400 font-medium">—</span>;
    const up = value >= 0;
    return (
        <span className={`text-xs font-bold flex items-center gap-1 ${up ? 'text-emerald-500' : 'text-red-400'}`}>
            {up ? <TrendingUp size={13} strokeWidth={2.5} /> : <TrendingDown size={13} strokeWidth={2.5} />}
            {up ? '+' : ''}{value}%
        </span>
    );
};

const getDynamicWelcome = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Bună dimineața';
    if (hr < 18) return 'Bună ziua';
    return 'Bună seara';
};

// Math helpers for Amortization and DTI
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
        </div>
    );
};

const DetailModal = ({ requestId, onClose }) => {
    const [req, setReq] = useState(null);
    const [loadingReq, setLoadingReq] = useState(true);
    const [decision, setDecision] = useState(null);
    const [loadingDecision, setLoadingDecision] = useState(true);
    const [clientDetails, setClientDetails] = useState(null);
    const [loadingClient, setLoadingClient] = useState(true);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await getCreditRequestById(requestId);
                setReq(res.data);
                
                // Fetch associated details
                fetchClient(res.data.clientId);
                fetchDecision(res.data.id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingReq(false);
            }
        };

        const fetchDecision = async (reqId) => {
            try {
                const res = await getDecisionsByCreditRequest(reqId);
                setDecision(res.data);
            } catch {
                setDecision(null);
            } finally {
                setLoadingDecision(false);
            }
        };

        const fetchClient = async (clientId) => {
            try {
                const res = await getClientById(clientId);
                setClientDetails(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingClient(false);
            }
        };

        fetchRequest();
    }, [requestId]);

    if (loadingReq) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-[2rem] shadow-2xl p-12 flex flex-col items-center justify-center gap-3 min-w-[300px]">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Se încarcă cererea de credit...</p>
            </div>
        </div>
    );

    if (!req) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 text-center max-w-sm border border-slate-100">
                <AlertCircle className="text-red-500 mx-auto mb-3" size={36} />
                <p className="text-sm font-semibold text-slate-800">Eroare la încărcare</p>
                <p className="text-xs text-slate-500 mt-1">Nu s-a putut găsi cererea de credit specificată.</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors">Închide</button>
            </div>
        </div>
    );

    const employmentLabel = {
        Employed: 'Angajat',
        Unemployed: 'Neangajat',
        SelfEmployed: 'PFA / Antreprenor',
        Retired: 'Pensionar',
    };
    const riskLabel = { Low: 'Scăzut', Medium: 'Mediu', High: 'Ridicat' };
    const decisionTypeLabel = {
        Approved: 'Aprobat',
        Rejected: 'Respins',
        NeedsMoreInfo: 'Necesită informații suplimentare',
    };

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
                            <span className={`px-3 py-1 border rounded-full text-[10px] font-extrabold uppercase tracking-widest ${STATUS_STYLES[req.status] || STATUS_STYLES.Pending}`}>
                                {STATUS_LABELS[req.status] || req.status}
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
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${RISK_STYLES[req.riskLevel] ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
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

                                    <div className="pt-3 border-t border-slate-100 text-xs space-y-2.5 text-slate-600">
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
                                                Scorul de credit de <span className="font-bold text-slate-700">{req.creditScore}</span> indică un risc {riskLabel[req.riskLevel]?.toLowerCase() || req.riskLevel}. 
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

const KpiCard = ({ icon: Icon, iconBg, title, value, trend, sub, delay }) => (
    <div
        className="bg-white/80 border border-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm flex flex-col gap-4 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden fade-in-up"
        style={{ animationDelay: delay }}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between relative z-10">
            <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner`}>
                <Icon size={21} />
            </div>
            <TrendBadge value={trend} />
        </div>
        <div className="relative z-10">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1 group-hover:text-indigo-950 transition-colors">{value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
            {sub && <p className="text-[11px] text-slate-400 font-semibold mt-1">{sub}</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 text-sm min-w-[140px]">
            <p className="font-bold text-slate-700 mb-2 capitalize">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">{p.name}</span>
                    <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const avatarBtnRef = useRef(null);
    const dropdownMenuRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Chart toggle and Request details modal states
    const [chartType, setChartType] = useState('bar'); // 'bar' | 'area'
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    useEffect(() => {
        getDashboard()
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (
                dropdownMenuRef.current && !dropdownMenuRef.current.contains(e.target) &&
                avatarBtnRef.current && !avatarBtnRef.current.contains(e.target)
            ) setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleToggleDropdown = () => {
        if (!dropdownOpen && avatarBtnRef.current) {
            const rect = avatarBtnRef.current.getBoundingClientRect();
            setDropdownPos({ top: rect.bottom + window.scrollY + 10, right: window.innerWidth - rect.right });
        }
        setDropdownOpen(o => !o);
    };

    const handleLogout = () => { setDropdownOpen(false); logout(); navigate('/login'); };

    if (loading) return (
        <div className="flex items-center justify-center h-64 w-full">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
    );

    const totalRisk = (data?.riskDistribution || []).reduce((s, r) => s + r.count, 0) || 1;
    const welcomeMessage = getDynamicWelcome();

    return (
        <>
            <style>{`
                @keyframes fadeInUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
                .fade-in-up { opacity:0; animation:fadeInUp 0.45s ease-out forwards; }
                @keyframes dropdownIn { from { opacity:0; transform:translateY(-8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
                .dropdown-in { animation:dropdownIn 0.18s ease-out forwards; }
            `}</style>

            <div className="space-y-7 font-sans max-w-[1400px] mx-auto pb-12">

                {/* Header with Welcome Greeting */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 fade-in-up" style={{ animationDelay: '0ms' }}>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                            {welcomeMessage}, {user?.fullName?.split(' ')[0] || 'Utilizator'}!
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {['Admin', 'Analyst'].includes(user?.role) && data?.pendingCount > 0 ? (
                                <span>Aveți <span className="font-bold text-indigo-600">{data.pendingCount} cereri de credit</span> în așteptare ce necesită decizie astăzi.</span>
                            ) : (
                                <span>Statistici și activitate în timp real pentru CreditWise.</span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/credit-requests')}
                            className="hidden sm:flex items-center gap-2 bg-[#1c1c1c] hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all">
                            <Plus size={16} strokeWidth={2.5} />
                            Cerere nouă
                        </button>

                        <button
                            ref={avatarBtnRef}
                            onClick={handleToggleDropdown}
                            className="flex items-center gap-2.5 bg-white rounded-full pl-1.5 pr-4 py-1.5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all select-none active:scale-95 duration-150 group"
                        >
                            <Avatar name={user?.fullName} gradientId={user?.avatarGradient || 'blue'} size="sm" />
                            <span className="text-xs font-bold text-slate-700 max-w-[80px] truncate hidden md:block group-hover:text-slate-900 transition-colors">
                                {user?.fullName?.split(' ')[0] || 'Cont'}
                            </span>
                            <ChevronDown size={14} strokeWidth={2.5} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && createPortal(
                            <div 
                                ref={dropdownMenuRef} 
                                className="dropdown-in fixed w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-white/80 overflow-hidden z-[9999]" 
                                style={{ top: dropdownPos.top, right: dropdownPos.right }}
                            >
                                <div className="px-5 py-4 bg-gradient-to-br from-indigo-50/50 to-blue-50/35 border-b border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-6 -mt-6" />
                                    <div className="flex items-center gap-3 relative z-10">
                                        <Avatar name={user?.fullName} gradientId={user?.avatarGradient || 'blue'} size="md" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate">{user?.fullName}</p>
                                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-1.5 relative z-10">
                                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100/40 px-2.5 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                                <div className="py-2 px-1.5">
                                    {[
                                        { label: 'Profilul Meu', icon: User, path: '/profile' },
                                        { label: 'Setări Cont', icon: Settings, path: '/settings' },
                                        { label: 'Securitate', icon: Shield, path: '/security' },
                                        { label: 'Ajutor & Suport', icon: HelpCircle, path: '/help' },
                                    ].map(({ label, icon: Icon, path }) => (
                                        <button 
                                            key={path} 
                                            onClick={() => { navigate(path); setDropdownOpen(false); }}
                                            className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all duration-200 group text-left relative"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon size={15} className="text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-200 shrink-0" />
                                                <span>{label}</span>
                                            </div>
                                            <MoveRight size={12} className="text-indigo-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-slate-100 py-1.5 px-1.5">
                                    <button 
                                        onClick={handleLogout} 
                                        className="w-full px-3 py-2 flex items-center gap-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group text-left"
                                    >
                                        <LogOut size={15} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                                        Deconectare
                                    </button>
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <KpiCard icon={Users} iconBg="bg-blue-100 text-blue-600" title="Total Clienți" value={data?.totalClients ?? 0} trend={data?.clientsTrend} sub="înregistrați în sistem" delay="80ms" />
                    <KpiCard icon={FileText} iconBg="bg-indigo-100 text-indigo-600" title="Cereri Credit" value={data?.totalRequests ?? 0} trend={data?.requestsTrend} sub={`${data?.pendingCount ?? 0} în așteptare`} delay="160ms" />
                    <KpiCard icon={BadgePercent} iconBg="bg-emerald-100 text-emerald-600" title="Rată Aprobare" value={`${data?.approvalRate ?? 0}%`} trend={data?.approvalTrend} sub={`${data?.approvedCount ?? 0} aprobate`} delay="240ms" />
                    <KpiCard icon={Wallet} iconBg="bg-violet-100 text-violet-600" title="Valoare Aprobată" value={`${formatAmount(data?.totalApprovedAmount ?? 0)} RON`} trend={data?.amountTrend} sub="credite acordate" delay="320ms" />
                </div>

                {/* Main section grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left side: chart and recent requests */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Monthly Chart Card */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm fade-in-up" style={{ animationDelay: '400ms' }}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Activitate Lunară</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Cereri din ultimele 6 luni</p>
                                </div>
                                <div className="flex items-center bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/40">
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartType === 'bar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Bare
                                    </button>
                                    <button
                                        onClick={() => setChartType('area')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartType === 'area' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Arie
                                    </button>
                                </div>
                            </div>
                            <div className="h-[260px]">
                                {data?.monthlyStats?.every(m => m.total === 0) ? (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">Nu există date suficiente</div>
                                ) : chartType === 'bar' ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.monthlyStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                                            <defs>
                                                <linearGradient id="barTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#e0e7ff" />
                                                    <stop offset="100%" stopColor="#c7d2fe" />
                                                </linearGradient>
                                                <linearGradient id="barApproved" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#818cf8" />
                                                    <stop offset="100%" stopColor="#4f46e5" />
                                                </linearGradient>
                                                <linearGradient id="barRejected" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f87171" />
                                                    <stop offset="100%" stopColor="#ef4444" />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                            <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-500 font-medium">{v}</span>} />
                                            <Bar dataKey="total" name="Total" fill="url(#barTotal)" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="approved" name="Aprobate" fill="url(#barApproved)" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="rejected" name="Respinse" fill="url(#barRejected)" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data?.monthlyStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="areaTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#e0e7ff" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#e0e7ff" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="areaApproved" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="areaRejected" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-500 font-medium">{v}</span>} />
                                            <Area type="monotone" dataKey="total" name="Total" stroke="#c7d2fe" strokeWidth={2.5} fillOpacity={1} fill="url(#areaTotal)" />
                                            <Area type="monotone" dataKey="approved" name="Aprobate" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#areaApproved)" />
                                            <Area type="monotone" dataKey="rejected" name="Respinse" stroke="#f87171" strokeWidth={2.5} fillOpacity={1} fill="url(#areaRejected)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Recent requests list */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm fade-in-up" style={{ animationDelay: '480ms' }}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-slate-800">Cereri Recente</h2>
                                <button onClick={() => navigate('/credit-requests')} className="text-xs font-bold text-indigo-650 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                                    Vezi toate <MoveRight size={14} />
                                </button>
                            </div>
                            {!data?.recentRequests?.length ? (
                                <p className="text-slate-400 text-sm py-6 text-center">Nu există cereri înregistrate</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                {['Client', 'Sumă', 'Scor', 'Status', 'Data'].map(h => (
                                                    <th key={h} className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-4 last:pr-0 last:text-right">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.recentRequests.map((r) => {
                                                const avatarStyle = getClientAvatarStyle(r.clientName);
                                                return (
                                                    <tr 
                                                        key={r.id} 
                                                        onClick={() => setSelectedRequestId(r.id)}
                                                        className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                                                    >
                                                        <td className="py-3.5 pr-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarStyle} flex items-center justify-center text-white font-extrabold text-[10px] shrink-0 shadow-sm`}>
                                                                    {getInitials(r.clientName)}
                                                                </div>
                                                                <span className="group-hover:text-indigo-600 transition-colors">{r.clientName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 pr-4 text-sm text-slate-600 font-bold whitespace-nowrap">{r.amount.toLocaleString('ro-RO')} RON</td>
                                                        <td className="py-3.5 pr-4">
                                                            <span className="text-sm font-bold text-slate-700">{r.creditScore}</span>
                                                            <span className="text-xs text-slate-400">/100</span>
                                                        </td>
                                                        <td className="py-3.5 pr-4">
                                                            <span className={`inline-block px-2.5 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                                                                r.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                r.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                                {STATUS_LABELS[r.status] || r.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 text-xs text-slate-400 font-medium text-right whitespace-nowrap">
                                                            {new Date(r.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column: Risk and actions */}
                    <div className="space-y-5">

                        {/* Risk distribution */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-sm fade-in-up" style={{ animationDelay: '440ms' }}>
                            <h3 className="font-bold text-slate-800 mb-4">Distribuție Risc</h3>
                            {(data?.riskDistribution || []).every(r => r.count === 0) ? (
                                <p className="text-sm text-slate-400 text-center py-4">Nicio cerere procesată</p>
                            ) : (
                                <div className="space-y-4">
                                    {(data?.riskDistribution || []).map((r) => {
                                        const style = RISK_STYLES[r.level] || { bar: 'bg-slate-400', text: 'text-slate-600', label: r.level };
                                        const pct = Math.round(r.count / totalRisk * 100);
                                        return (
                                            <div key={r.level}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className={`text-sm font-semibold ${style.text}`}>{style.label}</span>
                                                    <span className="text-sm font-bold text-slate-700">{r.count} <span className="text-xs text-slate-400 font-normal">({pct}%)</span></span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${style.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Status summary cards */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-sm fade-in-up space-y-4" style={{ animationDelay: '520ms' }}>
                            <h3 className="font-bold text-slate-800">Sumar Cereri</h3>

                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-amber-50 border border-amber-100">
                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <Clock size={18} className="text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{data?.pendingCount ?? 0} în așteptare</p>
                                    <p className="text-xs text-slate-500 font-medium">Necesită decizie rapidă</p>
                                </div>
                                {['Admin', 'Analyst'].includes(user?.role) && (
                                    <button onClick={() => navigate('/decisions')} className="text-xs text-amber-600 font-bold hover:text-amber-800 shrink-0">
                                        Procesează
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-red-50 border border-red-100">
                                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertCircle size={18} className="text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{data?.rejectedCount ?? 0} respinse</p>
                                    <p className="text-xs text-slate-500 font-medium">Cereri respinse final</p>
                                </div>
                                {['Admin', 'Analyst'].includes(user?.role) && (
                                    <button onClick={() => navigate('/decisions')} className="text-xs text-red-600 font-bold hover:text-red-800 shrink-0">
                                        Detalii
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <CheckCircle size={18} className="text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{data?.approvedCount ?? 0} aprobate</p>
                                    <p className="text-xs text-slate-500 font-medium">{data?.approvalRate ?? 0}% rată aprobare</p>
                                </div>
                            </div>
                        </div>

                        {/* Report Export Call To Action Card */}
                        <div
                            className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-7 rounded-3xl shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden fade-in-up group hover:scale-[1.02] transition-transform duration-300"
                            style={{ animationDelay: '600ms' }}
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative z-10">
                                <PieChartIcon size={22} className="text-indigo-200 mb-3" />
                                <h3 className="font-bold text-lg mb-1">Raport Complet</h3>
                                <p className="text-indigo-200 text-[13px] leading-relaxed mb-5">Exportă activitatea și sumele din ultimele 30 de zile.</p>
                                <button onClick={() => navigate('/reports')} className="bg-white text-indigo-600 hover:bg-indigo-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                                    Exportă <MoveRight size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View request details modal */}
            {selectedRequestId && <DetailModal requestId={selectedRequestId} onClose={() => setSelectedRequestId(null)} />}
        </>
    );
};

export default DashboardPage;
