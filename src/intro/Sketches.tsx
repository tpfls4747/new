/** 3D 로딩 전이나 WebGL을 쓸 수 없을 때 보이는 평면 일러스트 */
export function LockSketch() {
  return (
    <svg className="lock-sketch" viewBox="0 0 200 220" aria-hidden="true">
      <defs>
        <linearGradient id="lk-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffc2dc" />
        </linearGradient>
      </defs>
      <path d="M62 78 V58 a38 38 0 0 1 76 0 V78" fill="none" stroke="#d6a45c" strokeWidth="13" strokeLinecap="round" />
      <path d="M100 205 C80 190 18 150 18 104 C18 76 38 60 60 60 C80 60 94 72 100 86 C106 72 120 60 140 60 C162 60 182 76 182 104 C182 150 120 190 100 205Z" fill="url(#lk-body)" stroke="#d6a45c" strokeWidth="2" />
      <path d="M22 100 C6 92 2 76 6 66 C14 76 22 80 32 84Z M178 100 C194 92 198 76 194 66 C186 76 178 80 168 84Z" fill="#fff" stroke="#d6c9ee" />
      <path d="M100 82 l10 12 -10 12 -10 -12z" fill="#e6dcff" />
      <circle cx="100" cy="132" r="22" fill="#f3d79f" />
      <circle cx="100" cy="126" r="8" fill="#1d0f2a" />
      <path d="M96 131 h8 l3 16 h-14z" fill="#1d0f2a" />
    </svg>
  )
}

export function KeySketch() {
  return (
    <svg className="key-sketch" viewBox="0 0 160 60" aria-hidden="true">
      <path d="M30 8 l6 13 14 1 -11 9 4 14 -13 -8 -13 8 4 -14 -11 -9 14 -1z" fill="#efc98a" stroke="#d6a45c" strokeWidth="1.5" />
      <rect x="50" y="27" width="96" height="6" rx="3" fill="#efc98a" />
      <rect x="126" y="33" width="14" height="12" rx="2" fill="#efc98a" />
    </svg>
  )
}
