import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, TrendingUp, Scale, ShieldCheck, Lock } from 'lucide-react';
import CreditWiseLogo from '../../components/ui/CreditWiseLogo';

const DashboardMockup = () => (
    <div className="w-full h-full flex flex-col gap-3 max-w-[22rem] mx-auto justify-center origin-center transform scale-95">
        <div className="flex gap-3 h-[110px]">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex flex-col shadow-xl">
                <div className="w-12 h-1.5 bg-indigo-200/50 rounded-full mb-2"></div>
                <div className="w-24 h-4 bg-white/90 rounded-md mb-auto"></div>

                <div className="flex items-end gap-2.5 h-14 pt-2 opacity-90">
                    <div className="flex-1 bg-indigo-300 rounded-t-md h-[40%]"></div>
                    <div className="flex-1 bg-indigo-400 rounded-t-md h-[65%]"></div>
                    <div className="flex-1 bg-indigo-200 rounded-t-md h-[30%]"></div>
                    <div className="flex-1 bg-white rounded-t-md h-[95%] shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                    <div className="flex-1 bg-indigo-400 rounded-t-md h-[55%]"></div>
                </div>
            </div>
            <div className="w-[38%] flex flex-col gap-3">
                <div className="flex-1 bg-gradient-to-br from-indigo-800 to-indigo-900 rounded-2xl p-3 shadow-xl border border-indigo-700 flex flex-col justify-center">
                    <p className="text-[10px] text-indigo-300 mb-1 font-medium">Profit Generat</p>
                    <p className="font-extrabold text-white text-lg">89.4k</p>
                </div>
                <div className="flex-1 bg-emerald-500 rounded-2xl p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <TrendingUp size={14} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="w-full max-w-[2rem] h-1 bg-white/50 rounded-full mb-1"></div>
                        <div className="w-full h-1 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex-1 flex flex-col gap-2.5 shadow-xl max-h-[140px]">
            <div className="w-24 h-2 bg-white/50 rounded-full mb-1"></div>
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 w-full py-1 border-b border-white/10 last:border-0">
                    <div className="w-5 h-5 rounded bg-white/20 shrink-0"></div>
                    <div className="w-16 h-1.5 bg-white/40 rounded-full"></div>
                    <div className="ml-auto w-12 h-1.5 bg-emerald-400/80 rounded-full"></div>
                </div>
            ))}
        </div>
    </div>
);

const AnalistMockup = () => (
    <div className="w-full h-full flex items-center justify-center p-2">
        <div className="w-full max-w-[20rem] bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-slate-100 origin-center transform scale-95">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-100 rounded-bl-full -z-10"></div>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner">
                    <Scale size={20} className="text-amber-500" />
                </div>
                <div>
                    <div className="w-24 h-2.5 bg-slate-800 rounded-full mb-2"></div>
                    <div className="w-16 h-1.5 bg-slate-300 rounded-full"></div>
                </div>
            </div>

            <div className="flex justify-center mb-8 relative">
                <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90 drop-shadow-md">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="80 100" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-800">80</span>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mt-1">Scor</span>
                </div>
            </div>

            <div className="flex gap-3">
                <div className="flex-[0.8] h-10 bg-slate-100 rounded-xl"></div>
                <div className="flex-[1.2] h-10 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/30 flex justify-center items-center">
                    <div className="w-12 h-1 bg-white/50 rounded-full"></div>
                </div>
            </div>
        </div>
    </div>
);

const SecurityMockup = () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 origin-center transform scale-95">
        <div className="relative mt-4">
            <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-40 rounded-full animate-pulse scale-150"></div>
            <div className="w-28 h-28 bg-gradient-to-b from-white to-slate-50 rounded-full shadow-2xl flex items-center justify-center relative z-10 border border-white">
                <ShieldCheck size={56} className="text-emerald-500 drop-shadow-md" strokeWidth={1.5} />
            </div>

            {/* Orbiting element */}
            <div className="absolute top-0 right-0 -mr-3 -mt-3 w-8 h-8 bg-indigo-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center z-20 animate-bounce">
                <Lock size={14} className="text-white" />
            </div>
        </div>

        <div className="w-full max-w-[240px] bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 text-center shadow-2xl">
            <h3 className="text-white font-bold text-base mb-2">Criptare End-to-End</h3>
            <div className="w-full h-1.5 bg-indigo-900/50 rounded-full overflow-hidden mb-3">
                <div className="w-full h-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
            </div>
            <p className="text-[11px] font-medium text-white/70">Sistem permanent 100% securizat</p>
        </div>
    </div>
);

const CAROUSEL_ITEMS = [
    {
        component: DashboardMockup,
        title: "Analiză avansată pentru performanță.",
        desc: "Gestionează și urmărește cererile și tranzacțiile tale dintr-un singur dashboard rapid și inteligent."
    },
    {
        component: AnalistMockup,
        title: "Sistem inteligent de validare clienți.",
        desc: "Evaluează clienții automat pe baza scorului de credit, vizualizând rapoarte precise."
    },
    {
        component: SecurityMockup,
        title: "Securitate de Nivel Bancar asigurată.",
        desc: "Datele tale și deciziile clienților tăi sunt permanent protejate prin algoritmi de criptare."
    }
];

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
        }, 5500);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.status === 429) setError(err.response.data);
            else setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f4f9] p-4 sm:p-5 relative overflow-hidden">
            {/* Optional background glow effects */}
            <div className="absolute top-[0%] left-[0%] w-[30%] h-[40%] bg-indigo-300/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[40%] bg-emerald-300/20 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-[70rem] min-h-[640px] bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row overflow-hidden relative z-10 border border-slate-100">
                {/* Left Side (Form) */}
                <div className="flex-1 p-8 sm:p-12 lg:p-14 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <div className="mb-12">
                            <CreditWiseLogo size="md" />
                        </div>

                        <div className="max-w-sm mr-auto">
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 font-sans tracking-tight">Bun venit!</h1>
                            <p className="text-slate-500 mb-8 text-sm">Introduceți detaliile de conectare mai jos</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700 ml-1">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@exemplu.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-slate-400 transition-shadow px-4"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700 ml-1">Parolă</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Parola ta"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-slate-400 transition-shadow pr-10 px-4"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-1">
                                        <Link to="/forgot-password" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">Ați uitat parola?</Link>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-[#1c1c1c] hover:bg-black text-white text-base font-medium mt-4 shadow-md transition-transform active:scale-[0.98]"
                                    disabled={loading}
                                >
                                    {loading ? 'Se conectează...' : 'Conectare'}
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-white px-3 text-slate-400 font-medium tracking-wide">sau continuă cu</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full mt-6 h-12 rounded-xl border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Conectare cu Google
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side (Descriptive UI Carousel) */}
                <div className="hidden md:flex flex-1 p-3 pl-0 relative">
                    <div className="w-full h-full bg-indigo-600 rounded-[1.5rem] flex flex-col p-12 relative overflow-hidden text-left bg-gradient-to-b from-indigo-600 to-indigo-800 shadow-inner">
                        {/* Decorative background geometry */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/4"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900 opacity-30 rounded-full translate-y-1/4 -translate-x-1/4"></div>

                        {/* Text Area (Aligns at Top Left) */}
                        <div className="z-20 relative h-[150px]">
                            {CAROUSEL_ITEMS.map((item, idx) => (
                                currentSlide === idx && (
                                    <div
                                        key={idx}
                                        className="absolute inset-0 w-full animate-in fade-in slide-in-from-top-4 duration-700 ease-out"
                                    >
                                        <h2 className="text-[2rem] leading-[1.2] font-bold text-white mb-4 tracking-tight pr-4">
                                            {item.title}
                                        </h2>
                                        <p className="text-indigo-100/90 text-[15px] max-w-[340px] leading-relaxed font-medium">
                                            {item.desc}
                                        </p>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Interactive UI Mockup (Center/Bottom Area) */}
                        <div className="flex-1 w-full relative z-10 mt-4">
                            {CAROUSEL_ITEMS.map((item, idx) => {
                                const Mockup = item.component;
                                return currentSlide === idx && (
                                    <div
                                        key={idx}
                                        className="absolute inset-0 w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-700 ease-out fill-mode-forwards"
                                    >
                                        <Mockup />
                                    </div>
                                )
                            })}
                        </div>

                        {/* Native-looking Indicators */}
                        <div className="flex gap-2.5 mt-auto z-20 pt-8 pb-2">
                            {CAROUSEL_ITEMS.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-2 rounded-full transition-all duration-500 ease-out outline-none ${currentSlide === idx ? 'bg-white w-8 shadow-[0_0_12px_rgba(255,255,255,0.7)]' : 'bg-white/30 hover:bg-white/50 w-2'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;