export default function ProposalSilhouette() {
  return (
    <div className="proposalSilhouette" aria-hidden="true">
      <svg viewBox="0 0 640 260" role="presentation" focusable="false">
        <defs>
          <linearGradient id="p" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(240,208,138,0.20)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.55)" />
          </linearGradient>
          <linearGradient id="p2" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(216,180,107,0.28)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.55)" />
          </linearGradient>
        </defs>

        {/* Standing figure */}
        <circle cx="392" cy="58" r="18" fill="url(#p2)" opacity="0.92" />
        <path
          d="M380 82c20-10 40-10 60 0l-8 70c-8 36-36 62-52 62s-34-26-34-62l-8-70c12-6 26-6 42 0Z"
          fill="url(#p)"
          opacity="0.92"
        />
        <path
          d="M378 132c22-10 44-10 66 0"
          stroke="rgba(216,180,107,0.24)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Kneeling figure */}
        <circle cx="248" cy="86" r="16" fill="url(#p2)" opacity="0.92" />
        <path
          d="M235 106c16-8 32-8 48 0l10 42c6 26-8 48-26 52-18 4-34-10-40-34l-12-46c8-6 14-10 20-14Z"
          fill="url(#p)"
          opacity="0.92"
        />
        <path
          d="M210 198c34-20 74-20 108 0"
          stroke="rgba(216,180,107,0.22)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.72"
        />
        <path
          d="M312 144c14-10 30-12 48-6"
          stroke="rgba(240,208,138,0.28)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Ring sparkle (minimal) */}
        <path
          d="M322 118l8 8-8 8-8-8 8-8Z"
          fill="rgba(247,246,242,0.52)"
          opacity="0.85"
        />
      </svg>
    </div>
  )
}

