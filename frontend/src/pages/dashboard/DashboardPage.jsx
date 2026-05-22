import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../../api/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import {
    Users, FileText, CheckCircle, Clock, TrendingUp, TrendingDown, Minus,
    AlertCircle, MoveRight, User, Settings, HelpCircle, LogOut, Shield,
    ChevronDown, Plus, PieChart as PieChartIcon, BadgePercent, Wallet,
} from 'lucide-react';
import Avatar from '../../components/ui/Avatar';

const STATUS_STYLES = {
    Approved: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-red-50 text-red-600',
    Pending: 'bg-amber-50 text-amber-600',
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

const KpiCard = ({ icon: Icon, iconBg, title, value, trend, sub, delay }) => (
    <div
        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-all duration-300 fade-in-up"
        style={{ animationDelay: delay }}
    >
        <div className="flex items-center justify-between">
            <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center`}>
                <Icon size={21} />
            </div>
            <TrendBadge value={trend} />
        </div>
        <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">{value}</p>
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
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

    return (
        <>
            <style>{`
                @keyframes fadeInUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
                .fade-in-up { opacity:0; animation:fadeInUp 0.45s ease-out forwards; }
                @keyframes dropdownIn { from { opacity:0; transform:translateY(-8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
                .dropdown-in { animation:dropdownIn 0.18s ease-out forwards; }
            `}</style>

            <div className="space-y-7 font-sans max-w-[1400px] mx-auto pb-12">

                {/* Header */}
                <div className="flex items-center justify-between fade-in-up" style={{ animationDelay: '0ms' }}>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                        <p className="text-sm text-slate-400 mt-1">Statistici în timp real</p>
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
                            className="flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1 shadow-sm border border-slate-100 hover:shadow-md transition-all"
                        >
                            <Avatar name={user?.fullName} size="sm" />
                            <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate hidden md:block">
                                {user?.fullName?.split(' ')[0] || 'Cont'}
                            </span>
                            <ChevronDown size={14} strokeWidth={2.5} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && createPortal(
                            <div ref={dropdownMenuRef} className="dropdown-in fixed w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[9999]" style={{ top: dropdownPos.top, right: dropdownPos.right }}>
                                <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={user?.fullName} size="md" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate">{user?.fullName}</p>
                                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                    <span className="inline-block mt-2.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full">{user?.role}</span>
                                </div>
                                <div className="py-1.5">
                                    {[
                                        { label: 'Profilul Meu', icon: User, path: '/profile' },
                                        { label: 'Setări Cont', icon: Settings, path: '/settings' },
                                        { label: 'Securitate', icon: Shield, path: '/security' },
                                        { label: 'Ajutor & Suport', icon: HelpCircle, path: '/help' },
                                    ].map(({ label, icon: Icon, path }) => (
                                        <button key={path} onClick={() => { navigate(path); setDropdownOpen(false); }}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                                            <Icon size={16} className="text-slate-400 shrink-0" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-slate-100 py-1.5">
                                    <button onClick={handleLogout} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium text-left">
                                        <LogOut size={16} className="shrink-0" />
                                        Deconectare
                                    </button>
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <KpiCard icon={Users} iconBg="bg-blue-100 text-blue-600" title="Total Clienți" value={data?.totalClients ?? 0} trend={data?.clientsTrend} sub="înregistrați în sistem" delay="80ms" />
                    <KpiCard icon={FileText} iconBg="bg-indigo-100 text-indigo-600" title="Cereri Credit" value={data?.totalRequests ?? 0} trend={data?.requestsTrend} sub={`${data?.pendingCount ?? 0} în așteptare`} delay="160ms" />
                    <KpiCard icon={BadgePercent} iconBg="bg-emerald-100 text-emerald-600" title="Rată Aprobare" value={`${data?.approvalRate ?? 0}%`} trend={data?.approvalTrend} sub={`${data?.approvedCount ?? 0} aprobate`} delay="240ms" />
                    <KpiCard icon={Wallet} iconBg="bg-violet-100 text-violet-600" title="Valoare Aprobată" value={`${formatAmount(data?.totalApprovedAmount ?? 0)} RON`} trend={data?.amountTrend} sub="credite acordate" delay="320ms" />
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left — chart + recent */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Monthly bar chart */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm fade-in-up" style={{ animationDelay: '400ms' }}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Activitate Lunară</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Cereri din ultimele 6 luni</p>
                                </div>
                            </div>
                            <div className="h-[260px]">
                                {data?.monthlyStats?.every(m => m.total === 0) ? (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">Nu există date suficiente</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.monthlyStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                            <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-500 font-medium">{v}</span>} />
                                            <Bar dataKey="total" name="Total" fill="#e0e7ff" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="approved" name="Aprobate" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="rejected" name="Respinse" fill="#f87171" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Recent requests */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm fade-in-up" style={{ animationDelay: '480ms' }}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-slate-800">Cereri Recente</h2>
                                <button onClick={() => navigate('/credit-requests')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
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
                                                    <th key={h} className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-4 last:pr-0 last:text-right">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.recentRequests.map((r) => (
                                                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="py-3.5 pr-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{r.clientName}</td>
                                                    <td className="py-3.5 pr-4 text-sm text-slate-600 font-medium whitespace-nowrap">{r.amount.toLocaleString('ro-RO')} RON</td>
                                                    <td className="py-3.5 pr-4">
                                                        <span className="text-sm font-bold text-slate-700">{r.creditScore}</span>
                                                        <span className="text-xs text-slate-400">/100</span>
                                                    </td>
                                                    <td className="py-3.5 pr-4">
                                                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[r.status] || 'bg-slate-100 text-slate-500'}`}>
                                                            {STATUS_LABELS[r.status] || r.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 text-xs text-slate-400 font-medium text-right whitespace-nowrap">
                                                        {new Date(r.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-5">

                        {/* Risk distribution */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm fade-in-up" style={{ animationDelay: '440ms' }}>
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
                                                    <span className={`text-sm font-semibold ${style.text}`}>{r.label}</span>
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

                        {/* Status summary */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm fade-in-up space-y-4" style={{ animationDelay: '520ms' }}>
                            <h3 className="font-bold text-slate-800">Sumar Cereri</h3>

                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-amber-50 border border-amber-100">
                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <Clock size={18} className="text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{data?.pendingCount ?? 0} în așteptare</p>
                                    <p className="text-xs text-slate-500">Necesită procesare</p>
                                </div>
                                <button onClick={() => navigate('/decisions')} className="text-xs text-amber-600 font-semibold hover:text-amber-800 shrink-0">
                                    Procesează
                                </button>
                            </div>

                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-red-50 border border-red-100">
                                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertCircle size={18} className="text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{data?.rejectedCount ?? 0} respinse</p>
                                    <p className="text-xs text-slate-500">Cereri blocate</p>
                                </div>
                                <button onClick={() => navigate('/decisions')} className="text-xs text-red-500 font-semibold hover:text-red-700 shrink-0">
                                    Detalii
                                </button>
                            </div>

                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <CheckCircle size={18} className="text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{data?.approvedCount ?? 0} aprobate</p>
                                    <p className="text-xs text-slate-500">{data?.approvalRate ?? 0}% rată aprobare</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div
                            className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-7 rounded-3xl shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden fade-in-up"
                            style={{ animationDelay: '600ms' }}
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16" />
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
        </>
    );
};

export default DashboardPage;
