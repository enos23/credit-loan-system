import { useState } from 'react';
import { Bell, Globe, Layout, Save, CheckCircle, Moon, Sun, Monitor } from 'lucide-react';

const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-500' : 'bg-slate-200'}`}
    >
        <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
    </button>
);

const SettingsPage = () => {
    const [notif, setNotif] = useState({
        emailNew: true,
        emailDecision: true,
        browserAlerts: false,
        weeklyReport: true,
    });
    const [language, setLanguage] = useState('ro');
    const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');
    const [itemsPerPage, setItemsPerPage] = useState('10');
    const [theme, setTheme] = useState('light');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const Section = ({ title, children }) => (
        <div className="bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-base">{title}</h2>
            {children}
        </div>
    );

    const Row = ({ label, description, children }) => (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>
            {children}
        </div>
    );

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
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Setări Cont</h1>
                <p className="text-sm text-slate-400 mt-1">Personalizează comportamentul aplicației</p>
            </div>

            {/* Notifications */}
            <div className="fade-in" style={{ animationDelay: '60ms', opacity: 0 }}>
                <Section title={<span className="flex items-center gap-2"><Bell size={16} className="text-blue-500" /> Notificări</span>}>
                    <div className="divide-y divide-slate-100">
                        <Row label="Cerere nouă" description="Primești email când apare o cerere de credit">
                            <Toggle checked={notif.emailNew} onChange={v => setNotif({ ...notif, emailNew: v })} />
                        </Row>
                        <Row label="Decizie luată" description="Notificare la fiecare aprobare sau respingere">
                            <Toggle checked={notif.emailDecision} onChange={v => setNotif({ ...notif, emailDecision: v })} />
                        </Row>
                        <Row label="Alerte browser" description="Notificări push în timp real">
                            <Toggle checked={notif.browserAlerts} onChange={v => setNotif({ ...notif, browserAlerts: v })} />
                        </Row>
                        <Row label="Raport săptămânal" description="Rezumat de activitate în fiecare luni">
                            <Toggle checked={notif.weeklyReport} onChange={v => setNotif({ ...notif, weeklyReport: v })} />
                        </Row>
                    </div>
                </Section>
            </div>

            {/* Localization */}
            <div className="fade-in" style={{ animationDelay: '120ms', opacity: 0 }}>
                <Section title={<span className="flex items-center gap-2"><Globe size={16} className="text-blue-500" /> Limbă & Regiune</span>}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Limbă</label>
                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                            >
                                <option value="ro">Română</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Format Dată</label>
                            <select
                                value={dateFormat}
                                onChange={e => setDateFormat(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                            >
                                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Display */}
            <div className="fade-in" style={{ animationDelay: '180ms', opacity: 0 }}>
                <Section title={<span className="flex items-center gap-2"><Layout size={16} className="text-blue-500" /> Afișare</span>}>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Înregistrări per pagină</label>
                        <select
                            value={itemsPerPage}
                            onChange={e => setItemsPerPage(e.target.value)}
                            className="w-full sm:w-40 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        >
                            {['5', '10', '25', '50'].map(n => <option key={n} value={n}>{n} rânduri</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Temă</label>
                        <div className="flex gap-3">
                            {[
                                { value: 'light', label: 'Light', Icon: Sun },
                                { value: 'dark', label: 'Dark', Icon: Moon },
                                { value: 'system', label: 'System', Icon: Monitor },
                            ].map(({ value, label, Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setTheme(value)}
                                    className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${theme === value ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                >
                                    <Icon size={18} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>
            </div>

            {/* Save */}
            <div className="flex justify-end items-center gap-4 fade-in" style={{ animationDelay: '240ms', opacity: 0 }}>
                {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                        <CheckCircle size={16} /> Setările au fost salvate
                    </span>
                )}
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                    <Save size={15} /> Salvează
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
