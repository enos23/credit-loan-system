import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatToolCallTrace from './ChatToolCallTrace';

// Tailwind class overrides for ReactMarkdown elements so prose styling matches
// the rest of the app without pulling in @tailwindcss/typography.
const markdownComponents = {
    h1: ({ children }) => <h1 className="text-base font-bold text-slate-800 mt-3 mb-1.5">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm font-bold text-slate-800 mt-3 mb-1.5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-700 mt-2 mb-1">{children}</h3>,
    p: ({ children }) => <p className="text-sm text-slate-700 leading-relaxed mb-2 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="text-sm text-slate-700 list-disc pl-5 space-y-0.5 mb-2">{children}</ul>,
    ol: ({ children }) => <ol className="text-sm text-slate-700 list-decimal pl-5 space-y-0.5 mb-2">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ inline, children }) =>
        inline
            ? <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-800 text-[12px] font-mono">{children}</code>
            : <code className="block p-2 rounded bg-slate-100 text-slate-800 text-[12px] font-mono whitespace-pre-wrap">{children}</code>,
    pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
    table: ({ children }) => (
        <div className="my-2 overflow-x-auto">
            <table className="text-xs border-collapse w-full">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
    tr: ({ children }) => <tr className="border-b border-slate-200 last:border-0">{children}</tr>,
    th: ({ children }) => <th className="px-2 py-1.5 text-left font-semibold text-slate-700">{children}</th>,
    td: ({ children }) => <td className="px-2 py-1.5 text-slate-700">{children}</td>,
    blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-slate-300 pl-3 my-2 text-slate-600 italic">{children}</blockquote>
    ),
    hr: () => <hr className="my-3 border-slate-200" />,
};

const ChatMessage = ({ role, content, toolCalls }) => {
    if (role === 'user') {
        return (
            <div className="flex justify-end">
                <div className="max-w-[85%] bg-indigo-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                    {content}
                </div>
            </div>
        );
    }

    // assistant
    return (
        <div className="flex justify-start">
            <div className="max-w-[90%] bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {content}
                </ReactMarkdown>
                <ChatToolCallTrace toolCalls={toolCalls} />
            </div>
        </div>
    );
};

export default ChatMessage;
