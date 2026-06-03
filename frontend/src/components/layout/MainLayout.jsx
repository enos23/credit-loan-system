import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatLauncher from '../chat/ChatLauncher';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#e6eeff] to-[#f0ebf8]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile hamburger — floating top-left, hidden on md+ where the sidebar is always visible. */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden fixed top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-20"
                aria-label="Deschide meniu"
            >
                <Menu size={20} />
            </button>

            <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 pt-16 md:pt-6 relative">
                {children}
            </main>

            <ChatLauncher />
        </div>
    );
};

export default MainLayout;
