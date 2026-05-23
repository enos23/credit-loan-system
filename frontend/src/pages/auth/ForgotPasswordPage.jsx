import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MailCheck, Copy, Check, KeyRound } from 'lucide-react';
import CreditWiseLogo from '../../components/ui/CreditWiseLogo';
import { forgotPassword } from '../../api/authApi';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await forgotPassword(email);
            setSubmitted(true);
            if (res.data.token) setToken(res.data.token);
        } catch (err) {
            if (err.response?.status === 429) setError(err.response.data);
            else setError('A apărut o eroare. Încercați din nou.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f4f9] p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute top-[0%] left-[0%] w-[30%] h-[40%] bg-indigo-300/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[40%] bg-emerald-300/20 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-[26rem] bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-10 relative z-10 border border-slate-100">
                <div className="mb-8">
                    <CreditWiseLogo size="md" />
                </div>

                {!submitted ? (
                    <>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Resetare parolă</h1>
                        <p className="text-slate-500 text-sm mb-8">
                            Introduceți adresa de email asociată contului pentru a primi un cod de resetare.
                        </p>

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

                            {error && (
                                <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-[#1c1c1c] hover:bg-black text-white text-base font-medium shadow-md transition-transform active:scale-[0.98]"
                            >
                                {loading ? 'Se procesează...' : 'Trimite cod de resetare'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                <MailCheck size={32} className="text-emerald-500" />
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Verificați emailul</h2>
                            <p className="text-slate-500 text-sm">
                                Dacă adresa există în sistem, veți primi un cod de resetare. Codul expiră în <span className="font-semibold text-slate-700">1 oră</span>.
                            </p>
                        </div>

                        {token && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">Cod de resetare (mod dezvoltare)</p>
                                <div className="flex items-center gap-3">
                                    <code className="flex-1 text-sm font-mono font-bold text-slate-800 break-all">{token}</code>
                                    <button
                                        onClick={handleCopy}
                                        className="shrink-0 w-9 h-9 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-amber-300 transition-all"
                                    >
                                        {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={() => navigate(token ? `/reset-password?token=${token}` : '/reset-password')}
                            className="w-full h-12 rounded-xl bg-[#1c1c1c] hover:bg-black text-white text-base font-medium shadow-md flex items-center justify-center gap-2"
                        >
                            <KeyRound size={18} />
                            Continuă resetarea parolei
                        </Button>
                    </div>
                )}

                <div className="mt-7 flex justify-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Înapoi la conectare
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
