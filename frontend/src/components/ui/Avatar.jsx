export const AVATAR_GRADIENTS = [
    { id: 'blue',   label: 'Albastru',  from: '#3b82f6', to: '#4f46e5' },
    { id: 'navy',   label: 'Marin',     from: '#1e3a5f', to: '#1e40af' },
    { id: 'teal',   label: 'Teal',      from: '#0d9488', to: '#0891b2' },
    { id: 'slate',  label: 'Antracit',  from: '#475569', to: '#1e293b' },
    { id: 'violet', label: 'Violet',    from: '#7c3aed', to: '#4f46e5' },
    { id: 'rose',   label: 'Burgund',   from: '#9f1239', to: '#7f1d1d' },
];

const getInitials = (name) => {
    if (!name) return 'U';
    return name
        .split(' ')
        .filter(Boolean)
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const SIZES = {
    xs:  { box: 24,  font: 10 },
    sm:  { box: 32,  font: 12 },
    md:  { box: 40,  font: 14 },
    lg:  { box: 56,  font: 20 },
    xl:  { box: 80,  font: 28 },
};

const Avatar = ({ name, gradientId = 'blue', size = 'md', className = '' }) => {
    const initials = getInitials(name);
    const g = AVATAR_GRADIENTS.find(g => g.id === gradientId) ?? AVATAR_GRADIENTS[0];
    const { box, font } = SIZES[size] ?? SIZES.md;

    return (
        <div
            className={`rounded-full flex items-center justify-center text-white font-bold select-none shrink-0 ${className}`}
            style={{
                width: box,
                height: box,
                fontSize: font,
                background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                boxShadow: `0 2px 8px ${g.from}55`,
            }}
        >
            {initials}
        </div>
    );
};

export { getInitials };
export default Avatar;
