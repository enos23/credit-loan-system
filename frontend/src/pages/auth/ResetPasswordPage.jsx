import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import CreditWiseLogo from '../../components/ui/CreditWiseLogo';
import { resetPassword } from '../../api/authApi';
import { extractErrorMessage } from '../../api/errors';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({ token: '', newPassword: '', confirm: '' });
    const [show, setShow] = useState({ newPassword: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) setForm(f => ({ ...f, token: tokenFromUrl }));
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.newPassword.length < 8) {
            setError('Parola trebuie să aibă cel puțin 8 caractere.');
            return;
        }
        if (!/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
            setError('Parola trebuie să conțină cel puțin o literă și o cifră.');
            return;
        }
        if (form.newPassword !== form.confirm) {
            setError('Parolele nu coincid.');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(form.token, form.newPassword);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(extractErrorMessage(err, 'Codul de resetare este invalid sau a expirat.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f4f9] p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute top-[0%] left-[0%] w-[30%] h-[40%] bg-indigo-300/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[40%] bg-emerald-300/20 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-[26rem] bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-10 relative z-10 border border-slate-100">
                <div className="mb-8">
                    <CreditWiseLogo size="md" />
                </div>

                {success ? (
                    <div className="text-center py-4 space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                <ShieldCheck size={32} className="text-emerald-500" />
                            </div>
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Parolă resetată!</h2>
                        <p className="text-slate-500 text-sm">Parola ta a fost actualizată. Vei fi redirecționat la pagina de conectare.</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Parolă nouă</h1>
                        <p className="text-slate-500 text-sm mb-8">
                            Introduceți codul de resetare și noua parolă.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="token" className="text-xs font-semibold text-slate-700 ml-1">Cod de resetare</Label>
                                <Input
                                    id="token"
                                    type="text"
                                    placeholder="Codul primit..."
                                    value={form.token}
                                    onChange={e => setForm({ ...form, token: e.target.value })}
                                    required
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700 ml-1">Parolă nouă</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={show.newPassword ? 'text' : 'password'}
                                        placeholder="Minim 8 caractere"
                                        value={form.newPassword}
                                        onChange={e => setForm({ ...form, newPassword: e.target.value })}
                                        required
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pr-12"
                                    />
                                    <button type="button" onClick={() => setShow(s => ({ ...s, newPassword: !s.newPassword }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                        {show.newPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm" className="text-xs font-semibold text-slate-700 ml-1">Confirmă parola</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm"
                                        type={show.confirm ? 'text' : 'password'}
                                        placeholder="Repetă parola nouă"
                                        value={form.confirm}
                                        onChange={e => setForm({ ...form, confirm: e.target.value })}
                                        required
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pr-12"
                                    />
                                    <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                        {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-[#1c1c1c] hover:bg-black text-white text-base font-medium shadow-md transition-transform active:scale-[0.98]"
                            >
                                {loading ? 'Se salvează...' : 'Resetează parola'}
                            </Button>
                        </form>
                    </>
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

export default ResetPasswordPage;
