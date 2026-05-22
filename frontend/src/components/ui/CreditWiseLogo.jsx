import { useId } from 'react';

const LogoMark = ({ size = 40 }) => {
    const uid = useId().replace(/:/g, '');
    const gradId = `cw-bg-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
            </defs>

            {/* Background */}
            <rect width="100" height="100" rx="22" fill={`url(#${gradId})`} />

            {/* C shape */}
            <path
                d="M58,22 C38,14 12,30 14,50 C12,70 38,86 58,78"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
            />

            {/* Rising bars (inside the C opening) */}
            <rect x="65" y="56" width="6" height="14" rx="3" fill="#6366f1" opacity="0.55" />
            <rect x="75" y="44" width="6" height="26" rx="3" fill="#818cf8" opacity="0.78" />
            <rect x="85" y="30" width="6" height="40" rx="3" fill="#a5b4fc" />
        </svg>
    );
};

const CreditWiseLogo = ({ size = 'md', showText = true, textClass = '' }) => {
    const config = {
        sm: { mark: 32, text: 'text-xl font-extrabold tracking-tight text-slate-800' },
        md: { mark: 40, text: 'text-2xl font-extrabold tracking-tight text-slate-800' },
        lg: { mark: 52, text: 'text-3xl font-extrabold tracking-tight text-slate-800' },
    };
    const { mark, text } = config[size] ?? config.md;

    return (
        <div className="flex items-center gap-3">
            <LogoMark size={mark} />
            {showText && (
                <span className={`${text} ${textClass}`}>CreditWise</span>
            )}
        </div>
    );
};

export { LogoMark };
export default CreditWiseLogo;
