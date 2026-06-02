import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { sendChatMessage } from '../../api/chatApi';
import { extractErrorMessage } from '../../api/errors';
import ChatMessage from './ChatMessage';

// Maps display-shape messages to backend ChatMessage format for the history payload.
const toBackendHistory = (messages) => messages.map(m => ({
    role: m.role,
    content: [{ type: 'text', text: m.content }],
}));

const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
            <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    </div>
);

const ChatPanel = ({ open, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom on new message / loading state.
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Focus input when panel opens.
    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMessage = { role: 'user', content: trimmed };
        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setInput('');
        setLoading(true);

        try {
            // history excludes the message we're sending now (that goes in `message`)
            const res = await sendChatMessage(trimmed, toBackendHistory(messages));
            setMessages([
                ...nextMessages,
                {
                    role: 'assistant',
                    content: res.data.reply,
                    toolCalls: res.data.toolCalls,
                },
            ]);
        } catch (err) {
            setMessages([
                ...nextMessages,
                {
                    role: 'assistant',
                    content: `**Eroare:** ${extractErrorMessage(err, 'Ceva nu a mers. Încearcă din nou.')}`,
                    toolCalls: [],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Click-outside overlay (mostly for mobile/tablet; on desktop the panel is non-modal). */}
            <div
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40"
                onClick={onClose}
            />

            <div className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-slate-50 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Bot size={18} className="text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">CreditWise AI</p>
                            <p className="text-[11px] text-slate-500">Asistent date — read-only</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                        aria-label="Închide chat"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Message list */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
                    {messages.length === 0 && !loading && (
                        <div className="text-center text-slate-400 text-sm pt-8">
                            <Bot size={32} className="mx-auto mb-3 text-slate-300" />
                            <p className="font-medium text-slate-500">Întreabă-mă orice despre datele aplicației.</p>
                            <p className="text-xs mt-2">Ex: „Câte cereri pending sunt?"</p>
                            <p className="text-xs">Ex: „Detalii client cu CNP 1900101..."</p>
                        </div>
                    )}
                    {messages.map((m, idx) => (
                        <ChatMessage key={idx} role={m.role} content={m.content} toolCalls={m.toolCalls} />
                    ))}
                    {loading && <TypingIndicator />}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-end gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Întreabă ceva..."
                            rows={1}
                            disabled={loading}
                            className="flex-1 resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 disabled:opacity-60 max-h-32"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                            aria-label="Trimite"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ChatPanel;
