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
        <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-in { animation: fadeInUp 0.4s ease-out forwards; }
            `}</style>

            {/* Welcome header */}
            <div className="fade-in">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Profilul Meu</h1>
                <p className="text-sm text-slate-500 mt-1">Gestionează-ți identitatea vizuală și detaliile de contact în CreditWise</p>
            </div>

            {/* Avatar card (Top panel) */}
            <div
                className="bg-white/80 border border-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] fade-in"
                style={{ animationDelay: '80ms', opacity: 0 }}
            >
                <div className="flex items-center gap-5 mb-5">
                    {/* Giant Avatar with active glow */}
                    <div className="relative group select-none">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
                        <Avatar name={displayName} gradientId={gradientId} size="xl" className="relative z-10 shadow-md transform group-hover:scale-102 transition-transform duration-300" />
                    </div>
                    <div>
                        <p className="font-extrabold text-slate-800 text-lg leading-tight">{displayName}</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">{user?.email || ''}</p>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100/40 px-3.5 py-1 rounded-full shadow-inner select-none mt-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            {user?.role || 'Administrator'}
                        </span>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider ml-1">Culoare Avatar</p>
                    <div className="flex flex-wrap gap-2.5">
                        {AVATAR_GRADIENTS.map(g => (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() => setGradientId(g.id)}
                                title={g.label}
                                className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer ${
                                    gradientId === g.id 
                                        ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' 
                                        : 'hover:scale-105'
                                }`}
                                style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Info form (Bottom panel) */}
            <form
                onSubmit={handleSave}
                className="bg-white/80 border border-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-5 fade-in"
                style={{ animationDelay: '160ms', opacity: 0 }}
            >
                <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-2">
                    <User size={16} className="text-indigo-500" /> Informații Personale
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Name Input */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nume Complet</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Numele tău complet"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Email Read-only */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={user?.email || ''}
                                readOnly
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-400 font-semibold bg-slate-100/50 cursor-not-allowed select-none"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold ml-1">Emailul contului nu poate fi modificat</p>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Telefon</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+40 7xx xxx xxx"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Role Read-only */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Rol Alocat</label>
                        <div className="relative">
                            <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={user?.role || 'Administrator'}
                                readOnly
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-400 font-semibold bg-slate-100/50 cursor-not-allowed select-none"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold ml-1">Rolul este alocat de către administrator</p>
                    </div>
                </div>

                {/* Bio Textarea */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Descriere Personală</label>
                    <div className="relative">
                        <FileText size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Scrie o scurtă descriere despre activitatea ta ca analist..."
                            rows={3}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Action buttons and Status */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div>
                        {status === 'saved' && (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in duration-300">
                                <CheckCircle size={15} /> Modificările au fost salvate!
                            </span>
                        )}
                        {status === 'error' && (
                            <span className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-in fade-in duration-300">
                                <AlertCircle size={15} /> Eroare la salvarea modificărilor.
                            </span>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={status === 'saving'}
                        className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 disabled:scale-100 transition-all select-none disabled:cursor-not-allowed"
                    >
                        {status === 'saving' ? 'Se salvează...' : 'Salvează Modificările'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
