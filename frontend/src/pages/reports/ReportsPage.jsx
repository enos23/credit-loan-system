import { useEffect, useState, useRef } from 'react';
import { getAllCreditRequests } from '../../api/creditRequestsApi';
import { getDashboard } from '../../api/dashboardApi';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import {
    FileDown, Users, FileText, CheckCircle, XCircle, Clock,
    TrendingUp, Star, AlertTriangle, BarChart2,
} from 'lucide-react';

const STATUS_PIE_COLORS = ['#6366f1', '#f87171', '#fbbf24', '#94a3b8'];
const RISK_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
const RISK_LABELS = { Low: 'Scăzut', Medium: 'Mediu', High: 'Ridicat' };

const STATUS_LABELS = {
    Approved: 'Aprobat', Rejected: 'Respins',
    Pending: 'În așteptare', UnderReview: 'În analiză',
};
const STATUS_STYLES = {
    Approved: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-red-50 text-red-600',
    Pending: 'bg-amber-50 text-amber-600',
    UnderReview: 'bg-blue-50 text-blue-600',
};

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
            <Icon size={20} className={color} />
        </div>
        <div>
            <p className="text-xl font-extrabold text-slate-800">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-3 text-sm min-w-[130px]">
            <p className="font-bold text-slate-700 mb-1.5">{label}</p>
            {payload.map(p => (
                <div key={p.dataKey} className="flex justify-between gap-3">
                    <span className="text-slate-500">{p.name}</span>
                    <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

const ReportsPage = () => {
    const [requests, setRequests] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO #34-phase2: ReportsPage computes aggregates client-side from the full list.
        // The right fix is an IReportsQueries layer analog to IDashboardQueries.
        // Until then we pull up to 1000 requests.
        Promise.all([getAllCreditRequests({ pageSize: 1000 }), getDashboard()])
            .then(([rr, dr]) => { setRequests(rr.data.items); setDashboard(dr.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    const pending = requests.filter(r => r.status === 'Pending' || r.status === 'UnderReview').length;
    const totalAmount = requests.reduce((s, r) => s + (r.amount || 0), 0);
    const approvedAmount = requests.filter(r => r.status === 'Approved').reduce((s, r) => s + (r.amount || 0), 0);
    const avgScore = requests.length > 0 ? Math.round(requests.reduce((s, r) => s + (r.creditScore || 0), 0) / requests.length) : 0;
    const avgAmount = requests.length > 0 ? Math.round(requests.reduce((s, r) => s + (r.amount || 0), 0) / requests.length) : 0;
    const approvalRate = requests.length > 0 ? Math.round(approved / requests.length * 100) : 0;

    // Pie chart data
    const pieData = [
        { name: 'Aprobate', value: approved },
        { name: 'Respinse', value: rejected },
        { name: 'În așteptare', value: pending },
    ].filter(d => d.value > 0);

    // Bar chart by purpose
    const purposeMap = {};
    requests.forEach(r => { const k = r.purpose || 'Altele'; purposeMap[k] = (purposeMap[k] || 0) + 1; });
    const barData = Object.entries(purposeMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

    // Analyst performance
    const analystMap = {};
    requests.forEach(r => {
        if (!r.assignedAnalystName) return;
        const k = r.assignedAnalystName;
        if (!analystMap[k]) analystMap[k] = { name: k, total: 0, approved: 0, rejected: 0 };
        analystMap[k].total++;
        if (r.status === 'Approved') analystMap[k].approved++;
        if (r.status === 'Rejected') analystMap[k].rejected++;
    });
    const analysts = Object.values(analystMap).sort((a, b) => b.total - a.total);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
    );

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #raport-print, #raport-print * { visibility: visible; }
                    #raport-print { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="space-y-7 font-sans max-w-6xl mx-auto pb-12">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Rapoarte</h1>
                        <p className="text-slate-500 font-medium mt-1">Statistici și analiză activitate</p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="no-print flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:bg-slate-800 transition-all"
                    >
                        <FileDown size={17} />
                        Exportă PDF
                    </button>
                </div>

                <div id="raport-print" className="space-y-7">
                    <div className="text-center hidden print:block mb-6">
                        <h2 className="text-2xl font-bold">CreditWise — Raport Activitate</h2>
                        <p className="text-slate-500 text-sm mt-1">Generat la {new Date().toLocaleDateString('ro-RO')}</p>
                    </div>

                    {/* KPI grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard label="Total Cereri" value={requests.length} icon={FileText} color="text-indigo-600" bg="bg-indigo-50" />
                        <StatCard label="Aprobate" value={approved} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
                        <StatCard label="Respinse" value={rejected} icon={XCircle} color="text-red-600" bg="bg-red-50" />
                        <StatCard label="În așteptare" value={pending} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
                        <StatCard label="Rată aprobare" value={`${approvalRate}%`} icon={TrendingUp} color="text-violet-600" bg="bg-violet-50" />
                        <StatCard label="Scor mediu" value={avgScore} icon={Star} color="text-blue-600" bg="bg-blue-50" />
                    </div>

                    {/* Amount summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
                            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-2">Valoare totală cereri</p>
                            <p className="text-2xl font-extrabold">{totalAmount.toLocaleString('ro-RO')} RON</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg">
                            <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-2">Valoare aprobată</p>
                            <p className="text-2xl font-extrabold">{approvedAmount.toLocaleString('ro-RO')} RON</p>
                        </div>
                        <div className="bg-gradient-to-br from-violet-500 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
                            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-2">Sumă medie cerere</p>
                            <p className="text-2xl font-extrabold">{avgAmount.toLocaleString('ro-RO')} RON</p>
                        </div>
                    </div>

                    {/* Charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Monthly bar chart */}
                        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-base mb-5 flex items-center gap-2">
                                <BarChart2 size={18} className="text-indigo-500" /> Activitate lunară
                            </h3>
                            {dashboard?.monthlyStats ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={dashboard.monthlyStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={3}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={6} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                        <Legend iconType="circle" iconSize={7} formatter={v => <span className="text-xs text-slate-500">{v}</span>} />
                                        <Bar dataKey="total" name="Total" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="approved" name="Aprobate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="rejected" name="Respinse" fill="#f87171" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-slate-400 text-sm text-center py-16">Nu există date</p>}
                        </div>

                        {/* Pie chart */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-base mb-5">Distribuție status</h3>
                            {pieData.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-16">Nu există cereri</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                            {pieData.map((_, i) => <Cell key={i} fill={STATUS_PIE_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip formatter={v => [`${v} cereri`]} />
                                        <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-slate-600">{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Second charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar by purpose */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-base mb-5">Cereri după scop</h3>
                            {barData.length === 0 ? <p className="text-slate-400 text-sm text-center py-12">Nu există cereri</p> : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={120} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                        <Bar dataKey="count" name="Cereri" fill="#6366f1" radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Risk distribution */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-base mb-5 flex items-center gap-2">
                                <AlertTriangle size={17} className="text-amber-500" /> Distribuție risc
                            </h3>
                            {(dashboard?.riskDistribution || []).every(r => r.count === 0) ? (
                                <p className="text-slate-400 text-sm text-center py-12">Nu există date</p>
                            ) : (
                                <div className="space-y-5 mt-2">
                                    {(dashboard?.riskDistribution || []).map(r => {
                                        const color = RISK_COLORS[r.level] || '#94a3b8';
                                        const total = (dashboard?.riskDistribution || []).reduce((s, x) => s + x.count, 0) || 1;
                                        const pct = Math.round(r.count / total * 100);
                                        return (
                                            <div key={r.level}>
                                                <div className="flex justify-between mb-1.5 text-sm">
                                                    <span className="font-semibold text-slate-700">{RISK_LABELS[r.level] || r.level}</span>
                                                    <span className="font-bold text-slate-700">{r.count} <span className="text-xs text-slate-400 font-normal">({pct}%)</span></span>
                                                </div>
                                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analyst performance */}
                    {analysts.length > 0 && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-base mb-5 flex items-center gap-2">
                                <Users size={17} className="text-indigo-500" /> Performanță analiști
                            </h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        {['Analist', 'Total procesate', 'Aprobate', 'Respinse', 'Rată aprobare'].map(h => (
                                            <th key={h} className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {analysts.map(a => (
                                        <tr key={a.name} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 font-semibold text-slate-800">{a.name}</td>
                                            <td className="py-3.5 text-slate-600">{a.total}</td>
                                            <td className="py-3.5">
                                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                                    <CheckCircle size={13} /> {a.approved}
                                                </span>
                                            </td>
                                            <td className="py-3.5">
                                                <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                                                    <XCircle size={13} /> {a.rejected}
                                                </span>
                                            </td>
                                            <td className="py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${a.total > 0 ? Math.round(a.approved / a.total * 100) : 0}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {a.total > 0 ? Math.round(a.approved / a.total * 100) : 0}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Full request table */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
                        <h3 className="font-bold text-slate-800 text-base mb-5">Toate cererile</h3>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {['Client', 'Scop', 'Sumă (RON)', 'Termen', 'Scor', 'Status'].map(h => (
                                        <th key={h} className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-4">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {requests.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 font-semibold text-slate-700 pr-4">{r.clientFullName}</td>
                                        <td className="py-3 text-slate-500 pr-4">{r.purpose}</td>
                                        <td className="py-3 font-medium text-slate-700 pr-4">{r.amount?.toLocaleString('ro-RO')}</td>
                                        <td className="py-3 text-slate-500 pr-4">{r.termMonths} luni</td>
                                        <td className="py-3 font-bold text-slate-700 pr-4">{r.creditScore}</td>
                                        <td className="py-3">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[r.status] || 'bg-slate-100 text-slate-500'}`}>
                                                {STATUS_LABELS[r.status] || r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportsPage;
