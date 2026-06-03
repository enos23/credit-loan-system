import { useEffect, useState } from 'react';
import { getReports } from '../../api/reportsApi';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import {
    FileDown, Users, FileText, CheckCircle, XCircle, Clock,
    TrendingUp, Star, AlertTriangle, BarChart2,
} from 'lucide-react';

const STATUS_PIE_COLORS = ['#6366f1', '#f87171', '#fbbf24'];
const RISK_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
const RISK_LABELS = { Low: 'Scăzut', Medium: 'Mediu', High: 'Ridicat' };

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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReports()
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
    );

    if (!data) return null;

    // Build pie chart input from the 3 status counts the API already gives us.
    const pieData = [
        { name: 'Aprobate', value: data.approvedCount },
        { name: 'Respinse', value: data.rejectedCount },
        { name: 'În așteptare', value: data.pendingCount },
    ].filter(d => d.value > 0);

    const totalRiskCount = (data.riskDistribution || []).reduce((s, r) => s + r.count, 0) || 1;

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
                        <StatCard label="Total Cereri" value={data.totalRequests} icon={FileText} color="text-indigo-600" bg="bg-indigo-50" />
                        <StatCard label="Aprobate" value={data.approvedCount} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
                        <StatCard label="Respinse" value={data.rejectedCount} icon={XCircle} color="text-red-600" bg="bg-red-50" />
                        <StatCard label="În așteptare" value={data.pendingCount} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
                        <StatCard label="Rată aprobare" value={`${data.approvalRate}%`} icon={TrendingUp} color="text-violet-600" bg="bg-violet-50" />
                        <StatCard label="Scor mediu" value={data.averageCreditScore} icon={Star} color="text-blue-600" bg="bg-blue-50" />
                    </div>

                    {/* Amount summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
                            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-2">Valoare totală cereri</p>
                            <p className="text-2xl font-extrabold">{data.totalAmount.toLocaleString('ro-RO')} RON</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg">
                            <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-2">Valoare aprobată</p>
                            <p className="text-2xl font-extrabold">{data.approvedAmount.toLocaleString('ro-RO')} RON</p>
                        </div>
                        <div className="bg-gradient-to-br from-violet-500 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
                            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-2">Sumă medie cerere</p>
                            <p className="text-2xl font-extrabold">{data.averageAmount.toLocaleString('ro-RO')} RON</p>
                        </div>
                    </div>

                    {/* Charts row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-base mb-5 flex items-center gap-2">
                                <BarChart2 size={18} className="text-indigo-500" /> Activitate lunară
                            </h3>
                            {data.monthlyStats?.every(m => m.total === 0) ? (
                                <p className="text-slate-400 text-sm text-center py-16">Nu există date</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.monthlyStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={3}>
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
                            )}
                        </div>

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

                    {/* Charts row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-base mb-5">Cereri după scop</h3>
                            {(data.byPurpose || []).length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-12">Nu există cereri</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={data.byPurpose} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={120} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                        <Bar dataKey="count" name="Cereri" fill="#6366f1" radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-base mb-5 flex items-center gap-2">
                                <AlertTriangle size={17} className="text-amber-500" /> Distribuție risc
                            </h3>
                            {(data.riskDistribution || []).every(r => r.count === 0) ? (
                                <p className="text-slate-400 text-sm text-center py-12">Nu există date</p>
                            ) : (
                                <div className="space-y-5 mt-2">
                                    {data.riskDistribution.map(r => {
                                        const color = RISK_COLORS[r.level] || '#94a3b8';
                                        const pct = Math.round(r.count / totalRiskCount * 100);
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
                    {(data.analystPerformance || []).length > 0 && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-base mb-5 flex items-center gap-2">
                                <Users size={17} className="text-indigo-500" /> Performanță analiști
                            </h3>
                            <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[560px]">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        {['Analist', 'Total procesate', 'Aprobate', 'Respinse', 'Rată aprobare'].map(h => (
                                            <th key={h} className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.analystPerformance.map(a => {
                                        const rate = a.total > 0 ? Math.round(a.approved / a.total * 100) : 0;
                                        return (
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
                                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${rate}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{rate}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ReportsPage;
