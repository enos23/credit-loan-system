import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatPanel from './ChatPanel';

const ChatLauncher = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center transition-all hover:scale-105 z-40 group"
                    aria-label="Deschide asistent AI"
                >
                    <MessageCircle size={22} />
                    <span className="absolute right-full mr-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Întreabă AI
                    </span>
                </button>
            )}

            <ChatPanel open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default ChatLauncher;
