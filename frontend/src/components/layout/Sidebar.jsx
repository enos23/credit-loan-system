import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Users, FileText, PieChart, Settings, CreditCard, LogOut, Scale, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/credit-requests', label: 'Cereri Credit', icon: FileText },
    { path: '/clients', label: 'Clienți', icon: Users },
    { path: '/decisions', label: 'Panel Analist', icon: Scale },
    { path: '/transactions', label: 'Tranzacții', icon: CreditCard },
    { path: '/reports', label: 'Rapoarte', icon: PieChart },
    { path: '/settings', label: 'Setări', icon: Settings },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen w-64 bg-transparent flex flex-col fixed left-0 top-0 pl-2 py-6 font-sans">
            <div className="px-5 mb-8 mt-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
                    <Hexagon size={18} fill="currentColor" className="text-white" />
                </div>
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">CreditWise</h1>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 flex flex-col pt-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    // Let's also check for exact or prefix paths if necessary. 
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
                })}
            </nav>

            <div className="px-4 mt-auto mb-4 border-t border-slate-200/50 pt-4">
                {/* Displayed similar to the original bottom user details */}
                <div className="px-4 mb-4">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">CONECTAT CA</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName || "Admin"}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.role || "Administrator"}</p>
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