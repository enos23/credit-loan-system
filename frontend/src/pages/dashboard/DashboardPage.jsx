import { useEffect, useState } from 'react';
import { getAllClients } from '../../api/clientsApi';
import { getAllCreditRequests } from '../../api/creditRequestsApi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Plus, FileText, PieChart as PieChartIcon, AlertCircle, TrendingUp, TrendingDown, Clock, MoveRight } from 'lucide-react';

const DashboardPage = () => {
    const [clients, setClients] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, requestsRes] = await Promise.all([
                    getAllClients(),
                    getAllCreditRequests(),
                ]);
                setClients(clientsRes.data);
                setRequests(requestsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    const pending = requests.filter(r => r.status === 'Pending').length;

    // Transform data for charts
    const scoreData = requests.map(r => ({
        name: r.clientFullName?.split(' ')[0] || 'Client',
        scor: r.creditScore,
    }));

    if (loading) return (
        <div className="flex items-center justify-center h-64 w-full">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 font-sans max-w-[1400px] mx-auto pb-12">
            {/* Header section closely resembling the image */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex bg-white/60 p-1.5 rounded-full backdrop-blur-sm border border-white/40 shadow-sm">
                        <button className="px-5 py-1.5 text-xs font-semibold rounded-full bg-transparent text-slate-600 hover:text-slate-800 transition-colors">Day</button>
                        <button className="px-5 py-1.5 text-xs font-bold rounded-full bg-white text-slate-900 shadow-sm transition-colors">Month</button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm hover:shadow-md transition-shadow">
                            <Search size={18} strokeWidth={2.5} />
                        </button>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm border border-slate-100 hidden sm:block pointer-events-none">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { title: "Total Clienți", value: clients.length, trend: "+12%", trendUp: true },
                    { title: "Total Cereri", value: requests.length, trend: "+5%", trendUp: true },
                    { title: "Aprobate", value: approved, trend: "+20%", trendUp: true },
                    { title: "Respinse", value: rejected, trend: "-2%", trendUp: false }
                ].map((metric, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white/80 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
                        <h3 className="text-[13px] font-semibold tracking-wide text-slate-400 mb-4">{metric.title}</h3>
                        <div className="flex items-end justify-between">
                            <span className="text-[28px] font-extrabold text-slate-800 tracking-tight leading-none">{metric.value}</span>
                            <span className={`text-xs font-bold flex items-center gap-1 mb-1 ${metric.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                {metric.trendUp ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                                {metric.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
                <button className="flex items-center gap-2.5 bg-white/90 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 shadow-sm border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <Plus size={16} strokeWidth={2.5} className="text-slate-400" />
                    Client Nou
                </button>
                <button className="flex items-center gap-2.5 bg-white/90 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 shadow-sm border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <FileText size={16} strokeWidth={2.5} className="text-slate-400" />
                    Cerere Nouă
                </button>
                <button className="flex items-center gap-2.5 bg-white/90 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 shadow-sm border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <PieChartIcon size={16} strokeWidth={2.5} className="text-slate-400" />
                    Rapoarte
                </button>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left wide column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Chart Section */}
                    <div className="bg-white/80 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white/80">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-slate-800">Scoruri Credit Interogate</h2>
                            <div className="bg-indigo-50/80 px-4 py-1.5 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors">
                                <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">Ultimele 7 zile v</span>
                            </div>
                        </div>
                        
                        <div className="h-[280px] w-full">
                            {scoreData.length === 0 ? (
                                <div className="h-full flex items-center justify-center"><p className="text-slate-400 font-medium">Nu există cereri procesate</p></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorScor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={15} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} domain={[0, 100]} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                                            itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="scor" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScor)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions / Requests */}
                    <div className="bg-white/80 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white/80">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Cereri Recente</h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            {requests.length === 0 ? (
                                 <p className="text-slate-400 text-sm py-4">Nu există cereri înregistrate</p>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-4 text-xs font-bold text-slate-800 capitalize tracking-wide">Dată</th>
                                            <th className="pb-4 text-xs font-bold text-slate-800 capitalize tracking-wide">Nume Client</th>
                                            <th className="pb-4 text-xs font-bold text-slate-800 capitalize tracking-wide">Adresă</th>
                                            <th className="pb-4 text-xs font-bold text-slate-800 capitalize tracking-wide text-right pr-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.slice(0, 4).map((r, i) => (
                                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-white/50 transition-colors">
                                                <td className="py-4 text-sm font-medium text-slate-500 whitespace-nowrap pr-4">Astăzi</td>
                                                <td className="py-4 text-sm text-slate-800 font-semibold line-clamp-1 pr-4">{r.clientFullName || "Client Nou"}</td>
                                                <td className="py-4 text-sm text-slate-500 font-medium truncate max-w-[150px]">{r.clientAddress || "N/A"}</td>
                                                <td className="py-4 text-right">
                                                    <span className={`inline-block px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-widest ${
                                                        r.status === 'Approved' ? 'bg-indigo-50 text-indigo-600' :
                                                        r.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {r.status === 'Approved' ? 'APROBAT' : r.status === 'Rejected' ? 'RESPINS' : 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column - Side Panels */}
                <div className="space-y-5">
                    <div className="bg-white/80 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white/80 flex flex-col gap-1 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3.5 mb-1.5">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                                <AlertCircle size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-[15px]">{rejected > 0 ? `${rejected} Cereri Respinse` : 'Nicio respingere'}</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium pl-[54px] mb-2">Monitorizează cererile blocate</p>
                        <p className="text-[13px] text-slate-400 pl-[54px] font-medium hover:text-indigo-600 cursor-pointer transition-colors">Vezi detalii</p>
                    </div>

                    <div className="bg-white/80 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white/80 flex flex-col gap-1 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3.5 mb-1.5">
                            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-[15px]">{pending} În așteptare</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium pl-[54px] mb-2">Procesează detaliile manual</p>
                        <p className="text-[13px] text-slate-400 pl-[54px] font-medium hover:text-indigo-600 cursor-pointer transition-colors">Procesează acum</p>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-600/20 text-white flex flex-col justify-between relative overflow-hidden h-[200px] mt-2 group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-110 duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText size={18} className="text-indigo-200" />
                                <h3 className="font-bold text-lg">Raport Complet</h3>
                            </div>
                            <p className="text-indigo-100 text-[13px] leading-relaxed pr-8 font-medium">Exportă balanța de activitate și sumele din ultimele 30 zile.</p>
                        </div>
                        <button className="relative z-10 bg-white border border-white hover:bg-transparent hover:text-white text-indigo-600 self-start px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                            Exportă PDF <MoveRight size={16} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;