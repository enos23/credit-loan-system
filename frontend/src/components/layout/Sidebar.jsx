import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Users, FileText, PieChart, Settings, CreditCard, LogOut, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/ui/Avatar";
import CreditWiseLogo from "@/components/ui/CreditWiseLogo";

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/credit-requests', label: 'Cereri Credit', icon: FileText },
    { path: '/clients', label: 'Clienți', icon: Users },
    { path: '/decisions', label: 'Panel Analist', icon: Scale },
    { path: '/transactions', label: 'Tranzacții', icon: CreditCard },
    { path: '/reports', label: 'Rapoarte', icon: PieChart },
    { path: '/settings', label: 'Setări', icon: Settings },
];

const adminMenuItems = [
    { path: '/users', label: 'Utilizatori', icon: ShieldCheck },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);
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
        <div className="h-screen w-64 bg-transparent flex flex-col fixed left-0 top-0 pl-2 py-6 font-sans">
            <div className="px-5 mb-8 mt-2">
                <CreditWiseLogo size="sm" />
            </div>

            <nav className="flex-1 px-4 space-y-1.5 flex flex-col pt-4">
                {menuItems.map(renderMenuItem)}

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
    );
};

export default Sidebar;