export default function MosqueSilhouette() {
  return (
    <div className="mosqueSilhouette" aria-hidden="true">
      <svg
        viewBox="0 0 1200 260"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M0 260V220c56-14 92-45 108-93 11-33 8-67 20-94 18-41 61-63 100-63 45 0 83 28 97 70 11 33 4 68 18 100 17 39 54 64 100 72 53 9 106-9 146-50 20-20 32-42 38-70 9-41 8-84 26-122 26-56 90-90 154-90 65 0 126 38 153 98 18 40 15 83 27 125 10 35 28 60 55 82 42 33 98 45 151 34 51-11 88-44 104-95 10-31 8-65 18-95 17-49 60-79 111-79 58 0 104 39 117 99 6 28 4 60 12 89 14 51 44 83 93 98v40H0Z"
          fill="url(#m)"
          opacity="0.45"
        />
        <path
          d="M300 260v-44c0-76 62-138 138-138s138 62 138 138v44H300Z"
          fill="url(#m2)"
          opacity="0.6"
        />
        <path
          d="M694 260v-44c0-78 64-142 142-142s142 64 142 142v44H694Z"
          fill="url(#m2)"
          opacity="0.6"
        />
        <path
          d="M438 78c0-42 34-76 76-76s76 34 76 76v24h-152V78Z"
          fill="url(#m3)"
          opacity="0.75"
        />
        <path
          d="M812 74c0-40 33-73 73-73s73 33 73 73v28H812V74Z"
          fill="url(#m3)"
          opacity="0.75"
        />
        <defs>
          <linearGradient id="m" x1="0" x2="0" y1="0" y2="260">
            <stop offset="0" stopColor="rgba(216,180,107,0.0)" />
            <stop offset="0.55" stopColor="rgba(216,180,107,0.12)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.55)" />
          </linearGradient>
          <linearGradient id="m2" x1="0" x2="0" y1="0" y2="260">
            <stop offset="0" stopColor="rgba(216,180,107,0.08)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.4)" />
          </linearGradient>
          <linearGradient id="m3" x1="0" x2="0" y1="0" y2="120">
            <stop offset="0" stopColor="rgba(240,208,138,0.18)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.28)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

