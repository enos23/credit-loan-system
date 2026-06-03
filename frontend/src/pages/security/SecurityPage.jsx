import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, Monitor, Smartphone, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
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
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-500' : 'bg-slate-200'}`}
    >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const PasswordField = ({ label, name, placeholder, value, show, onChange, onToggleShow }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
        <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
                type={show ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            <button type="button" onClick={onToggleShow} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    </div>
);

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

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-in { animation: fadeInUp 0.4s ease-out forwards; }
            `}</style>

            <div className="fade-in">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Securitate</h1>
                <p className="text-sm text-slate-400 mt-1">Gestionează parola și accesul la cont</p>
            </div>

            {/* Change password */}
            <form
                onSubmit={handleSave}
                className="bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm space-y-4 fade-in"
                style={{ animationDelay: '60ms', opacity: 0 }}
            >
                <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Lock size={16} className="text-blue-500" /> Schimbă Parola
                </h2>

                <PasswordField label="Parola Curentă" name="current" placeholder="••••••••"
                    value={form.current} show={show.current} onChange={handleChange} onToggleShow={() => toggleShow('current')} />
                <PasswordField label="Parola Nouă" name="newPass" placeholder="Minim 8 caractere, o literă și o cifră"
                    value={form.newPass} show={show.newPass} onChange={handleChange} onToggleShow={() => toggleShow('newPass')} />
                <PasswordField label="Confirmă Parola Nouă" name="confirm" placeholder="Repetă parola nouă"
                    value={form.confirm} show={show.confirm} onChange={handleChange} onToggleShow={() => toggleShow('confirm')} />

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">
                        <AlertTriangle size={15} /> {error}
                    </div>
                )}

                <div className="flex items-center justify-between pt-1">
                    {saved && (
                        <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                            <CheckCircle size={16} /> Parola a fost actualizată
                        </span>
                    )}
                    {!saved && <span />}
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        Actualizează Parola
                    </button>
                </div>
            </form>

            {/* Security options */}
            <div
                className="bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm space-y-1 fade-in"
                style={{ animationDelay: '120ms', opacity: 0 }}
            >
                <h2 className="font-bold text-slate-800 text-base flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-blue-500" /> Opțiuni de Securitate
                </h2>

                <div className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Autentificare în doi pași (2FA)</p>
                            <p className="text-xs text-slate-400 mt-0.5">Protecție suplimentară prin cod SMS sau aplicație</p>
                        </div>
                        <Toggle checked={twoFactor} onChange={setTwoFactor} />
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Alerte la autentificare</p>
                            <p className="text-xs text-slate-400 mt-0.5">Primești email la fiecare login nou</p>
                        </div>
                        <Toggle checked={loginAlerts} onChange={setLoginAlerts} />
                    </div>
                </div>

                {twoFactor && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <p className="text-sm font-semibold text-blue-700 mb-1">Configurare 2FA</p>
                        <p className="text-xs text-blue-500">Scanează codul QR cu aplicația Google Authenticator sau Authy.</p>
                        <div className="mt-3 w-24 h-24 bg-white border border-blue-200 rounded-xl flex items-center justify-center">
                            <p className="text-[10px] text-slate-300 text-center">QR Code<br />placeholder</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Active sessions */}
            <div
                className="bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm fade-in"
                style={{ animationDelay: '180ms', opacity: 0 }}
            >
                <h2 className="font-bold text-slate-800 text-base flex items-center gap-2 mb-4">
                    <Monitor size={16} className="text-blue-500" /> Sesiuni Active
                </h2>

                <div className="space-y-3">
                    {SESSIONS.map((s, i) => (
                        <div key={i} className={`flex items-center justify-between gap-3 p-4 rounded-2xl ${s.current ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.current ? 'bg-blue-100 text-blue-500' : 'bg-slate-200 text-slate-500'}`}>
                                    <s.Icon size={17} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{s.device}</p>
                                    <p className="text-xs text-slate-400 truncate">{s.location} · {s.time}</p>
                                </div>
                            </div>
                            {s.current
                                ? <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full shrink-0">Curentă</span>
                                : (
                                    <button className="text-xs font-semibold text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors shrink-0">
                                        <LogOut size={13} /> Deconectează
                                    </button>
                                )
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SecurityPage;
