import { useId } from 'react';

const LogoMark = ({ size = 40 }) => {
    const uid = useId().replace(/:/g, '');
    const bgGradId = `cw-bg-${uid}`;
    const borderGradId = `cw-border-${uid}`;
    const cwGradId = `cw-main-${uid}`;
    const starGradId = `cw-star-${uid}`;
    const glowGradId = `cw-glow-${uid}`;
    const gridPatternId = `cw-grid-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md"
        >
            <defs>
                {/* Background gradient (Deep Midnight to Indigo-950) */}
                <linearGradient id={bgGradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0b0f19" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>

                {/* Subtle glassmorphic glowing border gradient */}
                <linearGradient id={borderGradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                </linearGradient>

                {/* Main symbol gradient: transitioning from trust/credit blue to success green */}
                <linearGradient id={cwGradId} x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                {/* Star gradient: bright white-gold shine */}
                <linearGradient id={starGradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#a7f3d0" />
                </linearGradient>

                {/* Background grid pattern for a high-tech dashboard feel */}
                <pattern id={gridPatternId} width="14" height="14" patternUnits="userSpaceOnUse">
                    <circle cx="7" cy="7" r="0.75" fill="#ffffff" opacity="0.08" />
                </pattern>

                {/* Soft ambient background glow behind the upward arrow */}
                <radialGradient id={glowGradId} cx="70%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>

                {/* Glow filter for the star */}
                <filter id={`cw-glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Shadow filter for the main logo mark */}
                <filter id={`cw-shadow-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
                    <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
                </filter>
            </defs>

            {/* Background Squircle */}
            <rect width="100" height="100" rx="26" fill={`url(#${bgGradId})`} />

            {/* Micro-grid background */}
            <rect width="100" height="100" rx="26" fill={`url(#${gridPatternId})`} />

            {/* Subtle Metallic/Glass Border */}
            <rect x="1.5" y="1.5" width="97" height="97" rx="24.5" stroke={`url(#${borderGradId})`} strokeWidth="3" />

            {/* Ambient Radial Glow */}
            <circle cx="70" cy="30" r="35" fill={`url(#${glowGradId})`} />

            {/* Inner Graphic: The continuous C-W-Checkmark ribbon */}
            <path
                d="M 30 34 C 18 34 14 46 14 54 C 14 70 26 80 38 80 C 50 80 56 68 56 56 L 64 74 L 82 34"
                stroke={`url(#${cwGradId})`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                filter={`url(#cw-shadow-${uid})`}
            />

            {/* Spark / Diamond Star (at the peak of the upward-trending arrow) */}
            <path
                d="M 86 10 Q 86 18 94 18 Q 86 18 86 26 Q 86 18 78 18 Q 86 18 86 10 Z"
                fill={`url(#${starGradId})`}
                filter={`url(#cw-glow-${uid})`}
            />
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
        <div className="flex items-center gap-3 select-none">
            <LogoMark size={mark} />
            {showText && (
                <span className={`${text} ${textClass}`}>
                    Credit<span className="text-indigo-600 dark:text-indigo-400">Wise</span>
                </span>
            )}
        </div>
    );
};

export { LogoMark };
export default CreditWiseLogo;
