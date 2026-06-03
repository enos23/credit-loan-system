import { useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Users, FileText, PieChart, Settings, CreditCard, LogOut, Scale, ShieldCheck, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import CreditWiseLogo from "@/components/ui/CreditWiseLogo";

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/credit-requests', label: 'Cereri Credit', icon: FileText },
    { path: '/clients', label: 'Clienți', icon: Users },
    { path: '/decisions', label: 'Panel Analist', icon: Scale, roles: ['Admin', 'Analyst'] },
    { path: '/transactions', label: 'Tranzacții', icon: CreditCard },
    { path: '/reports', label: 'Rapoarte', icon: PieChart },
    { path: '/settings', label: 'Setări', icon: Settings },
];

const adminMenuItems = [
    { path: '/users', label: 'Utilizatori', icon: ShieldCheck },
];

const visibleTo = (item, role) => !item.roles || item.roles.includes(role);

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Auto-close on route change. Without this the drawer stays open after navigation
    // and the user has to dismiss it manually.
    useEffect(() => {
        onClose?.();
    }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        return (
            <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl flex items-center gap-4 transition-all duration-200 font-medium ${isActive
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:bg-white/40 hover:text-slate-800'
                    }`}
            >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-slate-900" : ""} />
                <span>{item.label}</span>
            </button>
        );
    };

    return (
        <>
            {/* Backdrop — visible only on mobile when drawer is open. Click to close. */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-30"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <div
                className={`
                    h-screen w-64 bg-slate-50/95 md:bg-transparent backdrop-blur md:backdrop-blur-none
                    flex flex-col fixed left-0 top-0 pl-2 py-6 font-sans z-40
                    transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                `}
            >
                {/* Close button (mobile only) */}
                <button
                    onClick={onClose}
                    className="md:hidden absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                    aria-label="Închide meniu"
                >
                    <X size={18} />
                </button>

                <div className="px-5 mb-8 mt-2">
                    <CreditWiseLogo size="sm" />
                </div>

                <nav className="flex-1 px-4 space-y-1.5 flex flex-col pt-4">
                    {menuItems.filter(item => visibleTo(item, user?.role)).map(renderMenuItem)}

                    {user?.role === 'Admin' && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5">
                            {adminMenuItems.map(renderMenuItem)}
                        </div>
                    )}
                </nav>

                <div className="px-4 mt-auto mb-4 border-t border-slate-200/50 pt-4">
                    <div className="flex items-center gap-3 px-3 mb-4">
                        <Avatar
                            name={user?.fullName}
                            gradientId={user?.avatarGradient || 'blue'}
                            size="md"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{user?.fullName || "Admin"}</p>
                            <p className="text-xs text-slate-400 capitalize truncate">{user?.role || "Administrator"}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 font-medium text-slate-500 hover:bg-white/40 hover:text-slate-800"
                    >
                        <LogOut size={18} />
                        <span>Deconectare</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
