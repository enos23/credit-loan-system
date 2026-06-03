import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, toggleUserActive } from '../../api/usersApi';
import { extractErrorMessage } from '../../api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Pencil, Power, X, Eye, EyeOff, ChevronDown, ShieldCheck, Users } from 'lucide-react';

const ROLES = [
    { value: 'Admin', label: 'Administrator' },
    { value: 'Analyst', label: 'Analist' },
    { value: 'Banker', label: 'Bancher' },
];

const ROLE_LABELS = { Admin: 'Administrator', Analyst: 'Analist', Banker: 'Bancher' };

const ROLE_STYLES = {
    Admin: 'bg-violet-100 text-violet-700 border border-violet-200',
    Analyst: 'bg-amber-100 text-amber-700 border border-amber-200',
    Banker: 'bg-blue-100 text-blue-700 border border-blue-200',
};

const emptyForm = { firstName: '', lastName: '', email: '', password: '', role: '' };

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                    <X size={20} />
                </button>
            </div>
            {children}
        </div>
    </div>
);

const UserForm = ({ initial, onSubmit, loading, error, isEdit }) => {
    const [form, setForm] = useState(initial);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700 ml-1">Prenume</Label>
                    <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Ion"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-slate-400 px-4" />
                </div>
                <div className="flex-1 space-y-2">
                    <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700 ml-1">Nume</Label>
                    <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Popescu"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-slate-400 px-4" />
                </div>
            </div>

            {!isEdit && (
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700 ml-1">Email</Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@exemplu.com"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-slate-400 px-4" />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-semibold text-slate-700 ml-1">Rol</Label>
                <div className="relative">
                    <select id="role" name="role" value={form.role} onChange={handleChange}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-slate-400 px-4 text-sm text-slate-700 appearance-none pr-10">
                        <option value="" disabled>Selectați un rol</option>
                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {!isEdit && (
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700 ml-1">Parolă</Label>
                    <div className="relative">
                        <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                            onChange={handleChange} required minLength={8} placeholder="Minim 8 caractere, o literă și o cifră"
                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-slate-400 pr-10 px-4" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

            <Button type="submit" disabled={loading}
                className="w-full h-11 rounded-xl bg-[#1c1c1c] hover:bg-black text-white font-medium mt-2 shadow-md transition-transform active:scale-[0.98]">
                {loading ? 'Se salvează...' : isEdit ? 'Salvează modificările' : 'Creare utilizator'}
            </Button>
        </form>
    );
};

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalMode, setModalMode] = useState(null); // 'create' | { edit: user }
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [togglingId, setTogglingId] = useState(null);

    const loadUsers = useCallback(async () => {
        try {
            const res = await getUsers();
            setUsers(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const closeModal = () => { setModalMode(null); setFormError(''); };

    const handleCreate = async (form) => {
        setFormLoading(true);
        setFormError('');
        try {
            await createUser({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, role: form.role });
            await loadUsers();
            closeModal();
        } catch (err) {
            setFormError(extractErrorMessage(err, 'Eroare la creare.'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (form) => {
        setFormLoading(true);
        setFormError('');
        try {
            await updateUser(modalMode.edit.id, { firstName: form.firstName, lastName: form.lastName, role: form.role });
            await loadUsers();
            closeModal();
        } catch (err) {
            setFormError(extractErrorMessage(err, 'Eroare la actualizare.'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggle = async (user) => {
        setTogglingId(user.id);
        try {
            await toggleUserActive(user.id);
            await loadUsers();
        } finally {
            setTogglingId(null);
        }
    };

    const editInitial = modalMode?.edit
        ? { firstName: modalMode.edit.firstName, lastName: modalMode.edit.lastName, email: modalMode.edit.email, password: '', role: modalMode.edit.role }
        : emptyForm;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                        <Users size={20} className="text-violet-600" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestionare Utilizatori</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Creare, editare și gestionare acces</p>
                    </div>
                </div>
                <Button
                    onClick={() => { setModalMode('create'); setFormError(''); }}
                    className="h-10 px-5 rounded-xl bg-[#1c1c1c] hover:bg-black text-white font-medium flex items-center gap-2 shadow-md self-start sm:self-auto"
                >
                    <UserPlus size={17} />
                    Utilizator nou
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-slate-400 text-sm">Se încarcă...</div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                        <Users size={36} strokeWidth={1.5} />
                        <p className="text-sm">Niciun utilizator găsit.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm min-w-[640px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Utilizator</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Adăugat</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-indigo-600">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_STYLES[user.role] || 'bg-slate-100 text-slate-600'}`}>
                                            {user.role === 'Admin' && <ShieldCheck size={11} />}
                                            {ROLE_LABELS[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                            {user.isActive ? 'Activ' : 'Dezactivat'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {new Date(user.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button
                                                onClick={() => setModalMode({ edit: user })}
                                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                                title="Editează"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleToggle(user)}
                                                disabled={togglingId === user.id}
                                                className={`p-2 rounded-xl transition-colors ${user.isActive ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                title={user.isActive ? 'Dezactivează' : 'Activează'}
                                            >
                                                <Power size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modalMode === 'create' && (
                <Modal title="Creare utilizator nou" onClose={closeModal}>
                    <UserForm initial={emptyForm} onSubmit={handleCreate} loading={formLoading} error={formError} isEdit={false} />
                </Modal>
            )}

            {modalMode?.edit && (
                <Modal title="Editare utilizator" onClose={closeModal}>
                    <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-indigo-600">
                                {modalMode.edit.firstName[0]}{modalMode.edit.lastName[0]}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{modalMode.edit.email}</p>
                            <p className="text-xs text-slate-400">Email nu poate fi modificat</p>
                        </div>
                    </div>
                    <UserForm initial={editInitial} onSubmit={handleEdit} loading={formLoading} error={formError} isEdit={true} />
                </Modal>
            )}
        </div>
    );
};

export default UsersPage;
