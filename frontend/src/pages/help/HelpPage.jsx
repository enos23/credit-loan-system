import { useState } from 'react';
import { 
    ChevronDown, MessageCircle, Book, ExternalLink, Send, 
    CheckCircle, Phone, Mail, Search, X 
} from 'lucide-react';

const FAQS = [
    { q: 'Cum adaug un client nou?', a: 'Navighează la secțiunea "Clienți" din bara laterală, apoi apasă butonul "Client Nou". Completează formularul cu datele clientului și salvează.' },
    { q: 'Cum procesez o cerere de credit?', a: 'Accesează "Cereri Credit" din meniu, selectează cererea dorită și apasă "Procesează". Sistemul va calcula automat scorul de credit pe baza datelor introduse.' },
    { q: 'Ce înseamnă statusul Pending?', a: 'Statusul Pending indică o cerere care nu a primit încă o decizie. Poate fi procesată manual din Panel Analist sau automat de sistem.' },
    { q: 'Cum export un raport PDF?', a: 'Din Dashboard, apasă butonul "Exportă PDF" din cardul "Raport Complet". Raportul va conține activitatea din ultimele 30 de zile.' },
    { q: 'Pot schimba parola contului?', a: 'Da. Navighează la Securitate (din meniul contului → Securitate), completează formularul de schimbare a parolei și salvează.' },
    { q: 'Cum funcționează scorul de credit?', a: 'Scorul este calculat pe o scară de la 0 la 100 în funcție de istoricul de plăți, nivelul de îndatorare și datele furnizate de client. Un scor peste 70 este considerat bun.' },
];

const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
            open 
                ? 'bg-indigo-50/20 border-indigo-150 shadow-[0_4px_12px_rgba(99,102,241,0.03)]' 
                : 'bg-white/80 border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]'
        }`}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none"
            >
                <span className="text-sm font-bold text-slate-800 pr-4">{q}</span>
                <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${open ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-5">
                    <p className="text-sm text-slate-650 leading-relaxed font-semibold">{a}</p>
                </div>
            </div>
        </div>
    );
};

const HelpPage = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [activeTab, setActiveTab] = useState('faq'); // 'faq' | 'contact'
    const [faqSearch, setFaqSearch] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSent(false), 4000);
    };

    // Filter FAQs based on search query
    const filteredFaqs = FAQS.filter(faq => 
        faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
        faq.a.toLowerCase().includes(faqSearch.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-7 pb-12 font-sans">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-in { animation: fadeInUp 0.4s ease-out forwards; }
            `}</style>

            {/* Welcome header */}
            <div className="fade-in">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Ajutor & Suport</h1>
                <p className="text-sm text-slate-500 mt-1">Găsește răspunsuri la întrebări sau contactează echipa de suport tehnic</p>
            </div>

            {/* Split layout: left sidebar, right tab content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left side: contacts and documentation links */}
                <div className="space-y-5 fade-in" style={{ animationDelay: '80ms' }}>
                    
                    {/* Quick contacts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <a 
                            href="tel:+40210000000" 
                            className="bg-white/80 border border-white/80 rounded-3xl p-5 flex items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-[1.02] transition-all duration-300 group select-none"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 transition-transform group-hover:scale-110 shadow-sm">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Telefon suport</p>
                                <p className="text-sm font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">+40 21 000 0000</p>
                            </div>
                        </a>
                        
                        <a 
                            href="mailto:suport@creditwise.ro" 
                            className="bg-white/80 border border-white/80 rounded-3xl p-5 flex items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-[1.02] transition-all duration-300 group select-none"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 transition-transform group-hover:scale-110 shadow-sm">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email suport</p>
                                <p className="text-sm font-extrabold text-slate-700 group-hover:text-emerald-600 transition-colors">suport@creditwise.ro</p>
                            </div>
                        </a>
                    </div>

                    {/* Documentation list card */}
                    <div className="bg-white/80 border border-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                        <h2 className="font-bold text-slate-800 text-base flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                            <Book size={16} className="text-indigo-500" /> Documentație
                        </h2>
                        <div className="space-y-1">
                            {[
                                'Ghid de utilizare CreditWise',
                                'API Reference — Integrare externă',
                                'Manual Analist de Credit',
                                'Note de versiune (changelog)',
                            ].map((doc, i) => (
                                <button key={i} className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left select-none">
                                    <span className="text-sm font-semibold text-slate-650 group-hover:text-slate-800 transition-colors">{doc}</span>
                                    <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-500 -translate-x-1 group-hover:translate-x-0 transition-all shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side: tabbed panel for FAQ and Contact */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-6 fade-in" style={{ animationDelay: '160ms' }}>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/30">
                        <button
                            onClick={() => setActiveTab('faq')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'faq' 
                                    ? 'bg-white text-slate-800 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <MessageCircle size={16} />
                            Întrebări Frecvente
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'contact' 
                                    ? 'bg-white text-slate-800 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Send size={15} />
                            Trimite un Mesaj
                        </button>
                    </div>

                    {/* FAQ Tab content */}
                    {activeTab === 'faq' && (
                        <div className="space-y-4">
                            
                            {/* Live Search input */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Caută în întrebări frecvente..."
                                    value={faqSearch}
                                    onChange={e => setFaqSearch(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                />
                                {faqSearch && (
                                    <button 
                                        onClick={() => setFaqSearch('')} 
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>

                            {/* FAQs list */}
                            <div className="space-y-2.5">
                                {filteredFaqs.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500 text-sm font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                                        Nu s-a găsit niciun răspuns pentru "{faqSearch}".
                                    </div>
                                ) : (
                                    filteredFaqs.map((faq, i) => <FaqItem key={i} {...faq} />)
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Form Tab content */}
                    {activeTab === 'contact' && (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nume</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Numele tău"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="email@exemplu.ro"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Subiect</label>
                                <input
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    placeholder="Descrie pe scurt subiectul mesajului tău"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mesaj</label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder="Descrie în detaliu întrebarea ta sau problema tehnică întâmpinată..."
                                    rows={4}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                {sent ? (
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in duration-300">
                                        <CheckCircle size={16} /> Mesaj trimis! Te contactăm în cel mai scurt timp.
                                    </span>
                                ) : (
                                    <span />
                                )}
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all select-none"
                                >
                                    <Send size={14} /> Trimite Mesajul
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
};

export default HelpPage;
