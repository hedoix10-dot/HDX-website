export default function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <a href="/#start" className="flex items-center gap-3" aria-label="HeDoiX">
      <svg viewBox="0 0 64 64" className="h-10 w-10" role="img" aria-label="Logo HDX">
        <defs>
          <linearGradient id="hdx-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0B1114" />
            <stop offset="1" stopColor="#05080A" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#hdx-g)" stroke="#1FE8CF" strokeOpacity="0.45" strokeWidth="2" />
        <path d="M17 10h6v10h6V10h6v28h-6V26h-6v12h-6z" fill="#FF6A00" />
        <text x="32" y="55" fontFamily="Unbounded, Arial, sans-serif" fontSize="15" fontWeight="800" fill="#1FE8CF" textAnchor="middle" letterSpacing="1">DX</text>
      </svg>
      {withText && (
        <span className="font-display text-lg font-black tracking-tight">HeDoiX</span>
      )}
    </a>
  );
}
