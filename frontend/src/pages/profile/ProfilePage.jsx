import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, FileText, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import Avatar, { AVATAR_GRADIENTS } from '../../components/ui/Avatar';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
    });
    const [gradientId, setGradientId] = useState(user?.avatarGradient || 'blue');
    const [status, setStatus] = useState(null); // 'saving' | 'saved' | 'error'

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        setStatus('saving');
        try {
            const [firstName, ...rest] = form.fullName.trim().split(' ');
            await updateUser({
                firstName: firstName || '',
                lastName: rest.join(' ') || '',
                phone: form.phone || null,
                bio: form.bio || null,
                avatarGradient: gradientId,
            });
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const displayName = form.fullName || user?.fullName || 'Administrator';

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
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Profilul Meu</h1>
                <p className="text-sm text-slate-400 mt-1">Modificările sunt salvate în baza de date</p>
            </div>

            {/* Avatar card */}
            <div
                className="bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm fade-in"
                style={{ animationDelay: '60ms', opacity: 0 }}
            >
                <div className="flex items-center gap-5 mb-5">
                    <Avatar name={displayName} gradientId={gradientId} size="xl" />
                    <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">{displayName}</p>
                        <p className="text-sm text-slate-400 mt-0.5">{user?.email || ''}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full">
                            {user?.role || 'Administrator'}
                        </span>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Culoare Avatar</p>
                    <div className="flex flex-wrap gap-3">
                        {AVATAR_GRADIENTS.map(g => (
                            <button
                                key={g.id}
                                onClick={() => setGradientId(g.id)}
                                title={g.label}
                                className={`w-8 h-8 rounded-full transition-all ${gradientId === g.id ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : 'hover:scale-105'}`}
                                style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Info form */}
            <form
                onSubmit={handleSave}
                className="bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm space-y-5 fade-in"
                style={{ animationDelay: '120ms', opacity: 0 }}
            >
                <h2 className="font-bold text-slate-800 text-base">Informații Personale</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Nume Complet</label>
                        <div className="relative">
                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Numele tău complet"
                                required
                                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                        <div className="relative">
                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                value={user?.email || ''}
                                readOnly
                                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-100 text-sm text-slate-400 font-medium bg-slate-50 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Emailul nu poate fi modificat</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Telefon</label>
                        <div className="relative">
                            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+40 7xx xxx xxx"
                                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Rol</label>
                        <div className="relative">
                            <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                value={user?.role || 'Administrator'}
                                readOnly
                                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-100 text-sm text-slate-400 font-medium bg-slate-50 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Descriere</label>
                    <div className="relative">
                        <FileText size={15} className="absolute left-3.5 top-3.5 text-slate-300" />
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Scurtă descriere despre tine..."
                            rows={3}
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div>
                        {status === 'saved' && (
                            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                                <CheckCircle size={16} /> Salvat cu succes
                            </span>
                        )}
                        {status === 'error' && (
                            <span className="flex items-center gap-1.5 text-sm text-red-500 font-semibold">
                                <AlertCircle size={16} /> Eroare la salvare
                            </span>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={status === 'saving'}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {status === 'saving' ? 'Se salvează...' : 'Salvează Modificările'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
