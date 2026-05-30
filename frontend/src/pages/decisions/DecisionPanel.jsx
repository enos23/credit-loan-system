import { useEffect, useState } from 'react';
import { getAllCreditRequests } from '../../api/creditRequestsApi';
import { createDecision } from '../../api/decisionsApi';
import { extractErrorMessage } from '../../api/errors';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, Scale, Settings2 } from 'lucide-react';

const statusColors = {
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Rejected: 'bg-red-50 text-red-600 border-red-100',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    UnderReview: 'bg-blue-50 text-blue-600 border-blue-100',
};

const riskColors = {
    Low: 'text-emerald-500 bg-emerald-50',
    Medium: 'text-amber-500 bg-amber-50',
    High: 'text-red-500 bg-red-50',
};

const ScoreGauge = ({ score }) => {
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    const percentage = (score / 100) * 100;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke={color} strokeWidth="4"
                        strokeDasharray={`${percentage} 100`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1.5s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold" style={{ color }}>{score}</span>
                </div>
            </div>
        </div>
    );
};

const DecisionPanel = () => {
    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        decisionType: '', interestRate: '', approvedAmount: '', notes: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await getAllCreditRequests();
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleSelect = (req) => {
        setSelected(req);
        setForm({
            decisionType: '',
            interestRate: req.creditScore >= 80 ? '5.5' : req.creditScore >= 60 ? '9.0' : '14.0',
            approvedAmount: req.amount,
            notes: '',
        });
        setError('');
        setSuccess('');
        setOpen(true);
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
            setSuccess(`Decizia "${type}" a fost salvată cu succes!`);
            setOpen(false);
            fetchRequests();
        } catch (err) {
            setError(extractErrorMessage(err, 'Eroare la salvarea deciziei.'));
        }
    };

    const pending = requests.filter(r => r.status === 'Pending' || r.status === 'UnderReview');
    const decided = requests.filter(r => r.status === 'Approved' || r.status === 'Rejected');

    return (
        <div className="space-y-8 font-sans max-w-6xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                    <Scale className="text-indigo-600" size={32} /> Panel Analist
                </h1>
                <p className="text-slate-500 font-medium mt-1">Analizează și ia decizii pentru cererile de credit</p>
            </div>

            {/* Cereri în așteptare */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                     Cereri în așteptare <span className="bg-amber-100 text-amber-600 text-[13px] px-3 py-0.5 rounded-full">{pending.length}</span>
                </h2>
                
                {loading ? (
                    <div className="flex items-center justify-center py-20 w-full">
                        <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                    </div>
                ) : pending.length === 0 ? (
                    <div className="w-full py-20 bg-white/80 backdrop-blur-md border border-white rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle size={48} strokeWidth={1} className="mb-4 text-emerald-300" />
                        <p className="font-medium">Nu există cereri în așteptare. Totul este la zi!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
                        {pending.map(req => (
                            <div key={req.id} 
                                onClick={() => handleSelect(req)}
                                className="bg-white/80 backdrop-blur-xl p-6 border border-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all flex items-center gap-6 cursor-pointer group">
                                <ScoreGauge score={req.creditScore} />
                                
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{req.clientFullName}</h3>
                                    <p className="text-sm font-medium text-slate-500 truncate mb-3 max-w-[200px]">{req.purpose}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-slate-700">
                                            {req.amount?.toLocaleString()} RON
                                        </p>
                                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md ${riskColors[req.riskLevel]}`}>
                                            Risc: {req.riskLevel}
                                        </span>
                                    </div>
                                    <button className="w-full mt-4 bg-indigo-50 text-indigo-600 py-2.5 rounded-xl text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        Analizează Cererea
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cereri decise */}
            {decided.length > 0 && (
                <div className="mt-12">
                     <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                        Istoric Decizii
                    </h2>
                    <div className="space-y-3">
                        {decided.map(req => (
                             <div key={req.id} className="bg-white/40 backdrop-blur-xl p-4 border border-white/50 rounded-2xl flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-4">
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {req.status === 'Approved' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{req.clientFullName}</h3>
                                        <p className="text-xs font-semibold text-slate-500">{req.purpose} <span className="mx-1">•</span> {req.amount?.toLocaleString()} RON</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                     <span className="font-extrabold text-slate-400">{req.creditScore}/100</span>
                                     <span className={`px-4 py-1.5 border rounded-full text-[11px] font-extrabold uppercase tracking-widest ${statusColors[req.status]}`}>
                                         {req.status === 'Approved' ? 'APROBAT' : 'RESPINS'}
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dialog decizie */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-xl rounded-3xl p-8 border-slate-100 shadow-2xl">
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                            <Settings2 className="text-indigo-600" /> Finalizare Decizie
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                           Analizează detaliile și setează parametrii aprobării pentru clientul selectat.
                        </DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-6 mt-4">
                            <div className="flex items-center gap-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                <ScoreGauge score={selected.creditScore} />
                                <div className="flex-1 space-y-2">
                                     <div>
                                        <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Solicitant</p>
                                        <p className="font-bold text-lg text-slate-800">{selected.clientFullName}</p>
                                     </div>
                                     <div className="flex items-center gap-8 pt-2">
                                         <div>
                                            <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Suma</p>
                                            <p className="font-bold text-slate-700">{selected.amount?.toLocaleString()} RON</p>
                                         </div>
                                         <div>
                                            <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Termen</p>
                                            <p className="font-bold text-slate-700">{selected.termMonths} luni</p>
                                         </div>
                                     </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Dobândă Sugerată (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={form.interestRate}
                                        onChange={e => setForm({ ...form, interestRate: e.target.value })}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 text-lg font-bold text-slate-700 focus-visible:ring-indigo-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sumă Aprobată (RON)</Label>
                                    <Input
                                        type="number"
                                        value={form.approvedAmount}
                                        onChange={e => setForm({ ...form, approvedAmount: e.target.value })}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 text-lg font-bold text-slate-700 focus-visible:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notițe Analist</Label>
                                <textarea
                                    className="w-full h-24 rounded-xl bg-slate-50 border-slate-200 p-4 text-sm font-medium text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border"
                                    placeholder="Justificare decizie..."
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                />
                            </div>

                            {error && <p className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-center">{error}</p>}
                            {success && <p className="text-emerald-600 text-sm font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">{success}</p>}

                            <div className="flex gap-3 pt-2">
                                 <button
                                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 py-3 rounded-xl font-bold transition-colors shadow-sm"
                                    onClick={() => handleDecision('Rejected')}
                                 >
                                    Respinge
                                 </button>
                                 <button
                                    className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 py-3 rounded-xl font-bold transition-colors shadow-sm"
                                    onClick={() => handleDecision('NeedsMoreInfo')}
                                 >
                                    Cere Info
                                 </button>
                                 <button
                                    className="flex-[2] bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-colors"
                                    onClick={() => handleDecision('Approved')}
                                 >
                                    Aprobă Creditul
                                 </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DecisionPanel;