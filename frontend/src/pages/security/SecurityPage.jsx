import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, Monitor, Smartphone, CheckCircle, AlertTriangle, LogOut, Calendar } from 'lucide-react';
import { changePassword } from '../../api/authApi';
import { extractErrorMessage } from '../../api/errors';

const SESSIONS = [
    { device: 'Chrome / Windows 11', location: 'București, România', time: 'Acum — sesiune curentă', current: true, Icon: Monitor },
    { device: 'Safari / iPhone 15', location: 'Cluj-Napoca, România', time: 'Acum 2 zile', current: false, Icon: Smartphone },
];

const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            checked 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm' 
                : 'bg-slate-200 hover:bg-slate-300'
        }`}
    >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const PasswordField = ({ label, name, placeholder, value, show, onChange, onToggleShow }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
        <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type={show ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
            <button type="button" onClick={onToggleShow} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    </div>
);

const SecurityScoreGauge = ({ score }) => {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const fill = (score / 100) * circ;
    const color = score === 100 ? '#10b981' : score >= 70 ? '#6366f1' : '#f59e0b';
    const label = score === 100 ? 'Protecție Maximă' : score >= 70 ? 'Protecție Bună' : 'Protecție Scăzută';
    const feedback = score === 100 
      ? 'Contul tău este complet protejat! Toate sistemele de securitate sunt active.'
      : score >= 70 
      ? 'Securitate sporită. Activează autentificarea în doi pași (2FA) pentru a atinge 100% protecție.'
      : 'Nivelul de protecție este de bază. Recomandăm activarea alertelor și a 2FA.';
  
    return (
      <div className="bg-white/80 border border-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
            <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
            <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
              strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div className="absolute text-center">
            <p className="text-xl font-extrabold text-slate-800 leading-none">{score}%</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Scor</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            Stare Cont: <span style={{ color }}>{label}</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1.5">{feedback}</p>
        </div>
      </div>
    );
};

const SecurityPage = () => {
    const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
    const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
    const [twoFactor, setTwoFactor] = useState(false);
    const [loginAlerts, setLoginAlerts] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const toggleShow = (field) => setShow(s => ({ ...s, [field]: !s[field] }));
    const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.current) { setError('Introdu parola curentă.'); return; }
        if (form.newPass.length < 8) { setError('Parola nouă trebuie să aibă cel puțin 8 caractere.'); return; }
        if (!/[A-Za-z]/.test(form.newPass) || !/\d/.test(form.newPass)) { setError('Parola trebuie să conțină cel puțin o literă și o cifră.'); return; }
        if (form.newPass !== form.confirm) { setError('Parolele nu coincid.'); return; }
        setError('');
        try {
            await changePassword(form.current, form.newPass);
            setSaved(true);
            setForm({ current: '', newPass: '', confirm: '' });
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(extractErrorMessage(err, 'Parola curentă este incorectă.'));
        }
    };

    const securityScore = 30 + (twoFactor ? 40 : 0) + (loginAlerts ? 30 : 0);

    return (
        <div className="max-w-6xl mx-auto space-y-7 pb-12 font-sans">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-in { animation: fadeInUp 0.4s ease-out forwards; }
            `}</style>

            {/* Welcome header */}
            <div className="fade-in">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Securitate</h1>
                <p className="text-sm text-slate-500 mt-1">Gestionează parola și securitatea contului tău de analist</p>
            </div>

            {/* Split Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left side: Security options and Active sessions */}
                <div className="space-y-6 fade-in" style={{ animationDelay: '80ms' }}>
                    
                    {/* Security options */}
                    <div className="bg-white/80 border border-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
                        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                            <Shield size={16} className="text-indigo-500" /> Opțiuni Securitate
                        </h2>

                        <div className="divide-y divide-slate-100/50">
                            <div className="flex items-center justify-between py-3.5">
                                <div className="pr-4">
                                    <p className="text-sm font-semibold text-slate-700">Autentificare în doi pași (2FA)</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Protecție suplimentară prin aplicație OTP</p>
                                </div>
                                <Toggle checked={twoFactor} onChange={setTwoFactor} />
                            </div>
                            <div className="flex items-center justify-between py-3.5">
                                <div className="pr-4">
                                    <p className="text-sm font-semibold text-slate-700">Alerte la autentificare</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Primești email la fiecare login nou</p>
                                </div>
                                <Toggle checked={loginAlerts} onChange={setLoginAlerts} />
                            </div>
                        </div>

                        {twoFactor && (
                            <div className="mt-4 bg-indigo-50/40 border border-indigo-100/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
                                <p className="text-xs font-bold text-indigo-650">Configurare 2FA</p>
                                <p className="text-[11px] text-indigo-600 leading-relaxed font-semibold">Scanează codul QR cu aplicația Google Authenticator sau Microsoft Authenticator.</p>
                                <div className="w-24 h-24 bg-white border border-indigo-100 rounded-xl flex flex-col items-center justify-center shadow-sm relative group overflow-hidden">
                                    {/* Simulated QR Code styling */}
                                    <div className="absolute inset-2 border-2 border-indigo-200 border-dashed rounded-lg flex flex-col items-center justify-center">
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide text-center">QR Code<br />simulat</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active sessions */}
                    <div className="bg-white/80 border border-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
                        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                            <Monitor size={16} className="text-indigo-500" /> Sesiuni Active
                        </h2>

                        <div className="space-y-3">
                            {SESSIONS.map((s, i) => (
                                <div key={i} className={`flex items-center justify-between gap-3 p-4 rounded-2xl border ${s.current ? 'bg-indigo-50/40 border-indigo-100/50' : 'bg-slate-50/50 border-slate-100/50'}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${s.current ? 'bg-indigo-100/50 text-indigo-650' : 'bg-slate-200 text-slate-500'}`}>
                                            <s.Icon size={17} />
                                        </div>
                                        <div className="min-w-0 text-xs">
                                            <p className="font-bold text-slate-800 truncate">{s.device}</p>
                                            <p className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">{s.location} · {s.time}</p>
                                        </div>
                                    </div>
                                    {s.current
                                        ? <span className="text-[9px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-100 shrink-0">Curentă</span>
                                        : (
                                            <button className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors shrink-0 cursor-pointer">
                                                <LogOut size={13} /> Deconectează
                                            </button>
                                        )
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side: Change password and Security score */}
                <div className="lg:col-span-2 space-y-6 fade-in" style={{ animationDelay: '160ms' }}>
                    
                    {/* Security Score Gauge card */}
                    <SecurityScoreGauge score={securityScore} />

                    {/* Change password form */}
                    <form
                        onSubmit={handleSave}
                        className="bg-white/80 border border-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-5"
                    >
                        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-2">
                            <Lock size={16} className="text-indigo-500" /> Schimbă Parola
                        </h2>

                        <PasswordField label="Parola Curentă" name="current" placeholder="••••••••"
                            value={form.current} show={show.current} onChange={handleChange} onToggleShow={() => toggleShow('current')} />
                        <PasswordField label="Parola Nouă" name="newPass" placeholder="Minim 8 caractere, o literă și o cifră"
                            value={form.newPass} show={show.newPass} onChange={handleChange} onToggleShow={() => toggleShow('newPass')} />
                        <PasswordField label="Confirmă Parola Nouă" name="confirm" placeholder="Repetă parola nouă"
                            value={form.confirm} show={show.confirm} onChange={handleChange} onToggleShow={() => toggleShow('confirm')} />

                        {error && (
                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50/50 border border-red-100 px-4 py-2.5 rounded-xl font-bold">
                                <AlertTriangle size={15} /> {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                            {saved ? (
                                <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in duration-300">
                                    <CheckCircle size={15} /> Parola a fost actualizată!
                                </span>
                            ) : (
                                <span />
                            )}
                            <button
                                type="submit"
                                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all select-none cursor-pointer"
                            >
                                Actualizează Parola
                            </button>
                        </div>
                    </form>

                </div>

            </div>
        </div>
    );
};

export default SecurityPage;
