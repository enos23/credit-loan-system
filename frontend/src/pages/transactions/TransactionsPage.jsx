import { useEffect, useState } from 'react';
import { getTransactions } from '../../api/transactionsApi';
import { 
    CreditCard, ArrowUpRight, Landmark, Percent, Search, Download, 
    X, Calendar, User, ArrowUpDown, SlidersHorizontal, Info, FileText 
} from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Dynamic purpose colors based on keywords
const getPurposeStyle = (purpose = '') => {
    const p = purpose.trim().toLowerCase();
    if (p.includes('imobil') || p.includes('locuință') || p.includes('apartament') || p.includes('casă') || p.includes('casa')) {
        if (p.includes('renovare') || p.includes('amenajare')) {
            return 'bg-violet-50 text-violet-700 border border-violet-100/50';
        }
        return 'bg-blue-50 text-blue-700 border border-blue-100/50';
    }
    if (p.includes('renovare') || p.includes('apartament') || p.includes('amenajare') || p.includes('reparatie apartament')) {
        return 'bg-violet-50 text-violet-700 border border-violet-100/50';
    }
    if (p.includes('auto') || p.includes('mașină') || p.includes('masină') || p.includes('masina') || p.includes('vehicul') || p.includes('reparație') || p.includes('reparatie')) {
        return 'bg-amber-50 text-amber-700 border border-amber-100/50';
    }
    if (p.includes('afacere') || p.includes('investiție') || p.includes('business') || p.includes('investitie')) {
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100/50';
    }
    if (p.includes('nevoi') || p.includes('personal')) {
        return 'bg-slate-50 text-slate-600 border border-slate-200/50';
    }
    
    // Hash fallback to keep it colorful
    const colors = [
        'bg-blue-50 text-blue-700 border border-blue-100/50',
        'bg-violet-50 text-violet-700 border border-violet-100/50',
        'bg-amber-50 text-amber-700 border border-amber-100/50',
        'bg-emerald-50 text-emerald-700 border border-emerald-100/50',
        'bg-slate-50 text-slate-650 border border-slate-200/50',
    ];
    let hash = 0;
    for (let i = 0; i < p.length; i++) {
        hash = p.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// Standard banking amortization schedule generator
const generateAmortizationSchedule = (principal, annualRate, termMonths) => {
    const r = annualRate / 100 / 12;
    const n = termMonths;
    let monthlyPayment = 0;
    
    if (r === 0) {
        monthlyPayment = principal / n;
    } else {
        monthlyPayment = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    }

    const schedule = [];
    let remainingBalance = principal;
    
    for (let month = 1; month <= n; month++) {
        const interestPayment = remainingBalance * r;
        const principalPayment = r === 0 ? monthlyPayment : monthlyPayment - interestPayment;
        remainingBalance = Math.max(0, remainingBalance - principalPayment);
        
        schedule.push({
            month,
            payment: Math.round(monthlyPayment * 100) / 100,
            principal: Math.round(principalPayment * 100) / 100,
            interest: Math.round(interestPayment * 100) / 100,
            remaining: Math.round(remainingBalance * 100) / 100
        });
    }
    return schedule;
};

const SummaryCard = ({ icon: Icon, iconBg, label, value, sub, gradient }) => (
    <div className={`bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm flex items-center gap-4 backdrop-blur-md hover:scale-[1.02] hover:shadow-md transition-all duration-300 relative overflow-hidden group`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={21} />
        </div>
        <div className="z-10">
            <p className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none mb-1">{value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
            {sub && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</p>}
        </div>
    </div>
);

const TransactionsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filters & Sorting state
    const [search, setSearch] = useState('');
    const [purposeFilter, setPurposeFilter] = useState('all');
    const [termFilter, setTermFilter] = useState('all');
    const [sortKey, setSortKey] = useState('disbursedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // Side drawer state
    const [selectedTx, setSelectedTx] = useState(null);
    const [drawerTab, setDrawerTab] = useState('summary'); // 'summary' | 'schedule'

    useEffect(() => {
        getTransactions()
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Get unique loan purposes for filter
    const uniquePurposes = Array.from(
        new Set((data?.transactions || []).map(t => t.purpose))
    ).filter(Boolean);

    // Export entire list to CSV
    const exportToCSV = () => {
        if (!filtered.length) return;
        
        const headers = ['Client', 'Scop', 'Suma Disbursata (RON)', 'Rata Lunara (RON)', 'Termen (Luni)', 'Dobanda (%)', 'Total Rambursat (RON)', 'Data Disbursarii', 'Analist'];
        const rows = filtered.map(t => [
            t.clientName,
            t.purpose,
            t.disbursedAmount,
            t.monthlyInstallment,
            t.termMonths,
            t.interestRate,
            t.totalPayable,
            new Date(t.disbursedAt).toLocaleDateString('ro-RO'),
            t.analystName
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `tranzactii_creditwise_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export single amortization schedule to CSV
    const exportScheduleToCSV = (tx) => {
        const schedule = generateAmortizationSchedule(tx.disbursedAmount, tx.interestRate, tx.termMonths);
        const headers = ['Luna', 'Rata Lunara (RON)', 'Principal (RON)', 'Dobanda (RON)', 'Sold Ramas (RON)'];
        const rows = schedule.map(s => [
            s.month,
            s.payment,
            s.principal,
            s.interest,
            s.remaining
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `scadentar_${tx.clientName.replace(/\s+/g, '_')}_${tx.id.slice(0,8)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter logic
    let filtered = (data?.transactions || []).filter(t => {
        const matchesSearch = t.clientName.toLowerCase().includes(search.toLowerCase()) ||
                            t.purpose.toLowerCase().includes(search.toLowerCase()) ||
                            t.analystName.toLowerCase().includes(search.toLowerCase());
        
        const matchesPurpose = purposeFilter === 'all' || t.purpose === purposeFilter;
        
        let matchesTerm = true;
        if (termFilter === 'short') matchesTerm = t.termMonths <= 12;
        else if (termFilter === 'medium') matchesTerm = t.termMonths > 12 && t.termMonths <= 36;
        else if (termFilter === 'long') matchesTerm = t.termMonths > 36;

        return matchesSearch && matchesPurpose && matchesTerm;
    });

    // Sorting logic
    filtered.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'disbursedAt') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc'); // Default to descending
        }
    };

    const resetFilters = () => {
        setSearch('');
        setPurposeFilter('all');
        setTermFilter('all');
        setSortKey('disbursedAt');
        setSortOrder('desc');
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-7 font-sans max-w-6xl mx-auto pb-12 px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight animate-in fade-in slide-in-from-top-3 duration-300">Tranzacții</h1>
                    <p className="text-slate-500 font-medium mt-1">Credite disbursate și plan de rambursare</p>
                </div>
                {filtered.length > 0 && (
                    <button 
                        onClick={exportToCSV}
                        className="inline-flex items-center gap-2 px-4 h-11 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                        <Download size={16} />
                        Exportă CSV
                    </button>
                )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <SummaryCard 
                    icon={CreditCard} 
                    iconBg="bg-indigo-50 text-indigo-600 border border-indigo-100" 
                    label="Contracte active" 
                    value={data?.totalContracts ?? 0} 
                    sub="credite aprobate" 
                    gradient="from-indigo-500 to-blue-500"
                />
                <SummaryCard 
                    icon={ArrowUpRight} 
                    iconBg="bg-blue-50 text-blue-600 border border-blue-100" 
                    label="Total disbursate" 
                    value={`${fmt(data?.totalDisbursed ?? 0)} RON`}
                    gradient="from-blue-500 to-cyan-500"
                />
                <SummaryCard 
                    icon={Landmark} 
                    iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    label="Total de rambursat" 
                    value={`${fmt(data?.totalPayable ?? 0)} RON`} 
                    sub={`dobândă: ${fmt(data?.totalInterest ?? 0)} RON`}
                    gradient="from-emerald-500 to-teal-500"
                />
                <SummaryCard 
                    icon={Percent} 
                    iconBg="bg-violet-50 text-violet-600 border border-violet-100" 
                    label="Dobândă medie" 
                    value={`${data?.averageInterestRate ?? 0}%`} 
                    sub="pe an" 
                    gradient="from-violet-500 to-fuchsia-500"
                />
            </div>

            {/* Search + Table Card */}
            <div className="bg-white/80 border border-white/80 rounded-3xl shadow-sm overflow-hidden backdrop-blur-md">
                
                {/* Advanced Filtering Toolbar */}
                <div className="p-6 border-b border-slate-100 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <h2 className="text-lg font-bold text-slate-800">Istoric disbursări</h2>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="relative w-full sm:w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Caută client, scop sau analist..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 pr-4 h-10 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full shadow-sm font-medium"
                                />
                            </div>

                            {/* Purpose filter */}
                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={purposeFilter}
                                    onChange={e => setPurposeFilter(e.target.value)}
                                    className="px-3 h-10 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full sm:w-44 shadow-sm font-semibold text-slate-650 appearance-none cursor-pointer pr-8"
                                >
                                    <option value="all">Toate scopurile</option>
                                    {uniquePurposes.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-r-0 border-t-[5px] border-b-0 border-t-slate-400 border-l-transparent border-r-transparent w-0 h-0" />
                            </div>

                            {/* Term filter */}
                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={termFilter}
                                    onChange={e => setTermFilter(e.target.value)}
                                    className="px-3 h-10 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full sm:w-44 shadow-sm font-semibold text-slate-650 appearance-none cursor-pointer pr-8"
                                >
                                    <option value="all">Toate termenele</option>
                                    <option value="short">Scurt (≤ 12 luni)</option>
                                    <option value="medium">Mediu (13 - 36 luni)</option>
                                    <option value="long">Lung (&gt; 36 luni)</option>
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-r-0 border-t-[5px] border-b-0 border-t-slate-400 border-l-transparent border-r-transparent w-0 h-0" />
                            </div>

                            {/* Reset filters */}
                            {(search || purposeFilter !== 'all' || termFilter !== 'all') && (
                                <button
                                    onClick={resetFilters}
                                    className="h-10 px-4 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer"
                                >
                                    Resetează filtre
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <CreditCard size={36} strokeWidth={1.5} />
                        <p className="text-sm">{search || purposeFilter !== 'all' || termFilter !== 'all' ? 'Niciun rezultat găsit.' : 'Nu există tranzacții înregistrate.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/40 border-b border-slate-100">
                                    {[
                                        { label: 'Client', key: 'clientName' },
                                        { label: 'Scop', key: 'purpose' },
                                        { label: 'Sumă disbursată', key: 'disbursedAmount' },
                                        { label: 'Rată lunară', key: 'monthlyInstallment' },
                                        { label: 'Termen', key: 'termMonths' },
                                        { label: 'Dobândă', key: 'interestRate' },
                                        { label: 'Total ramburs.', key: 'totalPayable' },
                                        { label: 'Data', key: 'disbursedAt' },
                                        { label: 'Analist', key: 'analystName' }
                                    ].map(h => (
                                        <th 
                                            key={h.key} 
                                            onClick={() => handleSort(h.key)}
                                            className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-1">
                                                {h.label}
                                                <ArrowUpDown size={12} className={sortKey === h.key ? 'text-indigo-650' : 'text-slate-300'} />
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(t => (
                                    <tr 
                                        key={t.id} 
                                        onClick={() => { setSelectedTx(t); setDrawerTab('summary'); }}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">{t.clientName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold ${getPurposeStyle(t.purpose)}`}>
                                                {t.purpose}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{fmt(t.disbursedAmount)} RON</td>
                                        <td className="px-6 py-4 text-indigo-600 font-bold whitespace-nowrap">{fmt(t.monthlyInstallment)} RON</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">{t.termMonths} luni</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100/50">
                                                <Percent size={13} />{t.interestRate}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                                            <span>{fmt(t.totalPayable)} RON</span>
                                            <span className="block text-xs text-rose-500 font-normal mt-0.5">+{fmt(t.totalInterest)} dobândă</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs font-medium">
                                            {new Date(t.disbursedAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-medium">{t.analystName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Slide-over Details Drawer */}
            {selectedTx && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
                        onClick={() => setSelectedTx(null)}
                    />
                    
                    {/* Drawer */}
                    <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 overflow-y-auto border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">Credit ID</span>
                                    <span className="text-xs font-semibold text-slate-500 font-mono">{selectedTx.id.slice(0, 13)}...</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mt-1">{selectedTx.clientName}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedTx(null)}
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-slate-100 px-6">
                            <button
                                onClick={() => setDrawerTab('summary')}
                                className={`py-4 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${drawerTab === 'summary' ? 'border-indigo-600 text-indigo-650' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                Sumar Tranzacție
                            </button>
                            <button
                                onClick={() => setDrawerTab('schedule')}
                                className={`py-4 px-2 text-sm font-bold border-b-2 transition-all ml-6 cursor-pointer ${drawerTab === 'schedule' ? 'border-indigo-600 text-indigo-650' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                Plan de Rambursare (Scadențar)
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1">
                            {drawerTab === 'summary' ? (
                                <div className="space-y-6">
                                    
                                    {/* Cost breakdown Card */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Distribuție Costuri</h4>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-3xl font-extrabold text-slate-900">{fmt(selectedTx.totalPayable)} RON</span>
                                            <span className="text-xs text-slate-500 font-medium">total de plătit</span>
                                        </div>
                                        
                                        {/* Stacked indicator bar */}
                                        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex mt-4">
                                            <div 
                                                className="bg-indigo-600 h-full"
                                                style={{ width: `${(selectedTx.disbursedAmount / selectedTx.totalPayable) * 100}%` }}
                                            />
                                            <div 
                                                className="bg-rose-500 h-full"
                                                style={{ width: `${(selectedTx.totalInterest / selectedTx.totalPayable) * 100}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-xs font-semibold mt-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded bg-indigo-650" />
                                                <span className="text-slate-600">Disbursat (Principal): {fmt(selectedTx.disbursedAmount)} RON</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded bg-rose-500" />
                                                <span className="text-slate-650">Dobândă: {fmt(selectedTx.totalInterest)} RON ({((selectedTx.totalInterest / selectedTx.disbursedAmount) * 100).toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Rată lunară</span>
                                            <span className="text-lg font-extrabold text-indigo-600 block mt-1">{fmt(selectedTx.monthlyInstallment)} RON</span>
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Rată Dobândă</span>
                                            <span className="text-lg font-extrabold text-violet-700 block mt-1">{selectedTx.interestRate}% <span className="text-xs font-medium text-slate-500">/ an</span></span>
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Durată Credit</span>
                                            <span className="text-lg font-extrabold text-slate-700 block mt-1">{selectedTx.termMonths} luni</span>
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Scopul creditului</span>
                                            <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold mt-1.5 ${getPurposeStyle(selectedTx.purpose)}`}>
                                                {selectedTx.purpose}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actor Information */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Informații adiționale</h4>
                                        
                                        {/* Date */}
                                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100/50 rounded-2xl p-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Data Disbursării</span>
                                                <span className="text-sm font-bold text-slate-700">
                                                    {new Date(selectedTx.disbursedAt).toLocaleDateString('ro-RO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Analyst */}
                                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100/50 rounded-2xl p-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Analist Responsabil</span>
                                                <span className="text-sm font-bold text-slate-700">{selectedTx.analystName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-2xl">
                                        <Info size={16} className="text-indigo-500 shrink-0" />
                                        <p>Acest rezumat reflectă valorile din momentul acordării creditului. Pentru detalii lunare despre evoluția soldului și a dobânzii, consultați planul de rambursare.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan de plată pe luni</span>
                                        <button 
                                            onClick={() => exportScheduleToCSV(selectedTx)}
                                            className="inline-flex items-center gap-1.5 px-3 h-8 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-bold text-indigo-700 transition-colors shrink-0 cursor-pointer"
                                        >
                                            <Download size={13} />
                                            Exportă scadențar
                                        </button>
                                    </div>

                                    <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[480px] overflow-y-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-center">Luna</th>
                                                    <th className="px-4 py-3 text-right">Rată</th>
                                                    <th className="px-4 py-3 text-right">Principal</th>
                                                    <th className="px-4 py-3 text-right">Dobândă</th>
                                                    <th className="px-4 py-3 text-right">Sold Rămas</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                                {generateAmortizationSchedule(selectedTx.disbursedAmount, selectedTx.interestRate, selectedTx.termMonths).map(row => (
                                                    <tr key={row.month} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-center font-bold text-slate-500">{row.month}</td>
                                                        <td className="px-4 py-3 text-right text-indigo-650 font-semibold">{fmt(row.payment)}</td>
                                                        <td className="px-4 py-3 text-right text-emerald-600">{fmt(row.principal)}</td>
                                                        <td className="px-4 py-3 text-right text-rose-500">{fmt(row.interest)}</td>
                                                        <td className="px-4 py-3 text-right font-mono text-slate-500">{fmt(row.remaining)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TransactionsPage;

