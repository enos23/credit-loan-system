import { useState } from 'react';
import { ChevronDown, MessageCircle, Book, ExternalLink, Send, CheckCircle, Phone, Mail } from 'lucide-react';

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
        <div className={`border border-slate-100 rounded-2xl overflow-hidden transition-all ${open ? 'bg-blue-50/50' : 'bg-white'}`}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
                <span className="text-sm font-semibold text-slate-800 pr-4">{q}</span>
                <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="px-5 pb-4">
                    <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    );
};

const HelpPage = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSent(false), 4000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-in { animation: fadeInUp 0.4s ease-out forwards; }
            `}</style>

            <div className="fade-in">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Ajutor & Suport</h1>
                <p className="text-sm text-slate-400 mt-1">Găsește răspunsuri sau contactează echipa de suport</p>
            </div>

            {/* Quick contact */}
            <div className="grid grid-cols-2 gap-4 fade-in" style={{ animationDelay: '60ms', opacity: 0 }}>
                <div className="bg-white/80 border border-white/80 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <Phone size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Telefon suport</p>
                        <p className="text-sm font-bold text-slate-800">+40 21 000 0000</p>
                    </div>
                </div>
                <div className="bg-white/80 border border-white/80 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <Mail size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Email suport</p>
                        <p className="text-sm font-bold text-slate-800">suport@creditwise.ro</p>
                    </div>
                </div>
            </div>

            {/* Documentation links */}
            <div
                className="bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm fade-in"
                style={{ animationDelay: '120ms', opacity: 0 }}
            >
                <h2 className="font-bold text-slate-800 text-base flex items-center gap-2 mb-4">
                    <Book size={16} className="text-blue-500" /> Documentație
                </h2>
                <div className="space-y-2">
                    {[
                        'Ghid de utilizare CreditWise',
                        'API Reference — Integrare externă',
                        'Manual Analist de Credit',
                        'Note de versiune (changelog)',
                    ].map((doc, i) => (
                        <button key={i} className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group text-left">
                            <span className="text-sm font-medium text-slate-700">{doc}</span>
                            <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div
                className="bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm fade-in"
                style={{ animationDelay: '180ms', opacity: 0 }}
            >
                <h2 className="font-bold text-slate-800 text-base flex items-center gap-2 mb-4">
                    <MessageCircle size={16} className="text-blue-500" /> Întrebări Frecvente
                </h2>
                <div className="space-y-2">
                    {FAQS.map((faq, i) => <FaqItem key={i} {...faq} />)}
                </div>
            </div>

            {/* Contact form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white/80 border border-white/80 rounded-3xl p-6 shadow-sm space-y-4 fade-in"
                style={{ animationDelay: '240ms', opacity: 0 }}
            >
                <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Send size={16} className="text-blue-500" /> Trimite un Mesaj
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Nume</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Numele tău"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="email@exemplu.ro"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Subiect</label>
                    <input
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="Descrie pe scurt problema"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Mesaj</label>
                    <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Descrie în detaliu problema sau întrebarea ta..."
                        rows={4}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                    />
                </div>

                <div className="flex items-center justify-between">
                    {sent && (
                        <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                            <CheckCircle size={16} /> Mesaj trimis! Te contactăm în curând.
                        </span>
                    )}
                    {!sent && <span />}
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        <Send size={15} /> Trimite
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HelpPage;
