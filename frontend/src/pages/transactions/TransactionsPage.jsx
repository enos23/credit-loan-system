import { useEffect, useState } from 'react';
import { getTransactions } from '../../api/transactionsApi';
import { CreditCard, ArrowUpRight, Landmark, Percent, TrendingUp, Search } from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PURPOSE_COLORS = {
    'Achiziție imobil': 'bg-blue-100 text-blue-700',
    'Renovare locuință': 'bg-violet-100 text-violet-700',
    'Achiziție auto': 'bg-amber-100 text-amber-700',
    'Nevoi personale': 'bg-slate-100 text-slate-600',
    'Investiție afacere': 'bg-emerald-100 text-emerald-700',
};

const SummaryCard = ({ icon: Icon, iconBg, label, value, sub }) => (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={21} />
        </div>
        <div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const TransactionsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getTransactions()
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = (data?.transactions || []).filter(t =>
        t.clientName.toLowerCase().includes(search.toLowerCase()) ||
        t.purpose.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-7 font-sans max-w-6xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Tranzacții</h1>
                <p className="text-slate-500 font-medium mt-1">Credite disbursate și plan de rambursare</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <SummaryCard icon={CreditCard} iconBg="bg-indigo-100 text-indigo-600" label="Contracte active" value={data?.totalContracts ?? 0} sub="credite aprobate" />
                <SummaryCard icon={ArrowUpRight} iconBg="bg-blue-100 text-blue-600" label="Total disbursate" value={`${fmt(data?.totalDisbursed ?? 0)} RON`} />
                <SummaryCard icon={Landmark} iconBg="bg-emerald-100 text-emerald-600" label="Total de rambursat" value={`${fmt(data?.totalPayable ?? 0)} RON`} sub={`din care dobândă ${fmt(data?.totalInterest ?? 0)} RON`} />
                <SummaryCard icon={Percent} iconBg="bg-violet-100 text-violet-600" label="Dobândă medie" value={`${data?.averageInterestRate ?? 0}%`} sub="pe an" />
            </div>

            {/* Search + Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-800">Istoric disbursări</h2>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Caută client sau scop..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-4 h-10 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400 w-64"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <CreditCard size={36} strokeWidth={1.5} />
                        <p className="text-sm">{search ? 'Niciun rezultat găsit.' : 'Nu există tranzacții înregistrate.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    {['Client', 'Scop', 'Sumă disbursată', 'Rată lunară', 'Termen', 'Dobândă', 'Total ramburs.', 'Data', 'Analist'].map(h => (
                                        <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">{t.clientName}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${PURPOSE_COLORS[t.purpose] || 'bg-slate-100 text-slate-600'}`}>
                                                {t.purpose}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">{fmt(t.disbursedAmount)} RON</td>
                                        <td className="px-5 py-4 text-indigo-700 font-bold whitespace-nowrap">{fmt(t.monthlyInstallment)} RON</td>
                                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{t.termMonths} luni</td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1 text-violet-700 font-semibold">
                                                <Percent size={13} />{t.interestRate}%
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-700 font-medium whitespace-nowrap">
                                            <span>{fmt(t.totalPayable)} RON</span>
                                            <span className="block text-xs text-rose-400 font-normal">+{fmt(t.totalInterest)} dobândă</span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">
                                            {new Date(t.disbursedAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{t.analystName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
