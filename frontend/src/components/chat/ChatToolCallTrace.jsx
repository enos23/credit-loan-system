import { useState } from 'react';
import { Wrench, ChevronDown, AlertTriangle } from 'lucide-react';

// Collapsed by default — shows a single line "🔧 N tool calls". Expanded shows
// each tool name, args, and result as small monospace blocks. Pure transparency
// affordance; users rarely need to look at it.
const ChatToolCallTrace = ({ toolCalls }) => {
    const [expanded, setExpanded] = useState(false);

    if (!toolCalls || toolCalls.length === 0) return null;

    const hasError = toolCalls.some(t => t.isError);

    return (
        <div className="mt-2 text-xs">
            <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                    hasError
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
                {hasError ? <AlertTriangle size={11} /> : <Wrench size={11} />}
                {toolCalls.length} {toolCalls.length === 1 ? 'tool' : 'tools'}
                <ChevronDown
                    size={11}
                    className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>

            {expanded && (
                <div className="mt-2 space-y-2">
                    {toolCalls.map((tc, idx) => (
                        <div
                            key={idx}
                            className={`rounded-lg border p-2 ${
                                tc.isError ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'
                            }`}
                        >
                            <p className="font-mono font-semibold text-slate-700 mb-1">{tc.name}</p>
                            {tc.arguments && tc.arguments !== '{}' && (
                                <pre className="text-[10px] text-slate-500 overflow-x-auto whitespace-pre-wrap">
                                    {tc.arguments}
                                </pre>
                            )}
                            <details className="mt-1">
                                <summary className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-600">
                                    Result
                                </summary>
                                <pre className="text-[10px] text-slate-500 overflow-x-auto whitespace-pre-wrap mt-1 max-h-40 overflow-y-auto">
                                    {tc.result}
                                </pre>
                            </details>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatToolCallTrace;
