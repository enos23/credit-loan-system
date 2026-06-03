import { useEffect, useState } from 'react';
import { Bell, Globe, Layout, Save, CheckCircle, Moon, Sun, Monitor, AlertCircle } from 'lucide-react';
import { getPreferences, updatePreferences } from '../../api/userPreferencesApi';
import { extractErrorMessage } from '../../api/errors';
import { useAuth } from '../../context/AuthContext';

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

const DEFAULT_PREFS = {
    notifyEmailNewRequest: true,
    notifyEmailDecision: true,
    notifyBrowserAlerts: false,
    notifyWeeklyReport: true,
    language: 'ro',
    dateFormat: 'dd/mm/yyyy',
    itemsPerPage: 10,
    theme: 'light',
};

const SettingsPage = () => {
    const { updatePreferencesInContext } = useAuth();
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        getPreferences()
            .then(res => setPrefs(res.data))
            .catch(err => setError(extractErrorMessage(err, 'Nu am putut încărca preferințele.')))
            .finally(() => setLoading(false));
    }, []);

    const setField = (field, value) => setPrefs(p => ({ ...p, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await updatePreferences(prefs);
            setPrefs(res.data);
            updatePreferencesInContext?.(res.data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(extractErrorMessage(err, 'Nu am putut salva preferințele.'));
        } finally {
            setSaving(false);
        }
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

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
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
                        <Row label="Cerere nouă" description="Primești email când apare o cerere de credit (se va activa la integrarea email-ului)">
                            <Toggle checked={prefs.notifyEmailNewRequest} onChange={v => setField('notifyEmailNewRequest', v)} />
                        </Row>
                        <Row label="Decizie luată" description="Notificare la fiecare aprobare sau respingere">
                            <Toggle checked={prefs.notifyEmailDecision} onChange={v => setField('notifyEmailDecision', v)} />
                        </Row>
                        <Row label="Alerte browser" description="Notificări push în timp real">
                            <Toggle checked={prefs.notifyBrowserAlerts} onChange={v => setField('notifyBrowserAlerts', v)} />
                        </Row>
                        <Row label="Raport săptămânal" description="Rezumat de activitate în fiecare luni">
                            <Toggle checked={prefs.notifyWeeklyReport} onChange={v => setField('notifyWeeklyReport', v)} />
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
                                value={prefs.language}
                                onChange={e => setField('language', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                            >
                                <option value="ro">Română</option>
                                <option value="en">English</option>
                            </select>
                            <p className="text-[11px] text-slate-400 mt-1">Persistă în profil. Limba UI-ului se va schimba odată cu integrarea i18n.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Format Dată</label>
                            <select
                                value={prefs.dateFormat}
                                onChange={e => setField('dateFormat', e.target.value)}
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
                            value={prefs.itemsPerPage}
                            onChange={e => setField('itemsPerPage', parseInt(e.target.value))}
                            className="w-full sm:w-40 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        >
                            {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n} rânduri</option>)}
                        </select>
                        <p className="text-[11px] text-slate-400 mt-1">Aplică la listele de clienți și cereri de credit.</p>
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
                                    onClick={() => setField('theme', value)}
                                    className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${prefs.theme === value ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                >
                                    <Icon size={18} />
                                    {label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">Persistă în profil. Modul dark/system se va activa la implementarea suportului de teme.</p>
                    </div>
                </Section>
            </div>

            {/* Save */}
            <div className="flex flex-wrap justify-end items-center gap-4 fade-in" style={{ animationDelay: '240ms', opacity: 0 }}>
                {error && (
                    <span className="flex items-center gap-1.5 text-sm text-red-500 font-semibold">
                        <AlertCircle size={16} /> {error}
                    </span>
                )}
                {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                        <CheckCircle size={16} /> Setările au fost salvate
                    </span>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                    <Save size={15} /> {saving ? 'Se salvează...' : 'Salvează'}
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
