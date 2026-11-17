import { useReducedMotion } from 'motion/react'

/** 화면 구석의 작은 분홍 구름 친구 (장식) */
export function Mascot() {
  const reduced = useReducedMotion()
  return (
    <div className={`mascot${reduced ? ' mascot--still' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 120 100">
        <defs>
          <radialGradient id="mascot-body" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#ffd6e7" />
            <stop offset="1" stopColor="#ff9dc4" />
          </radialGradient>
        </defs>
        <path
          d="M28 86c-14 0-22-10-20-21 1-9 8-15 16-16 0-15 12-27 28-26 9-12 30-12 39 3 14-1 25 10 23 24 9 4 12 14 7 23-4 9-12 13-22 13z"
          fill="url(#mascot-body)"
        />
        <ellipse cx="36" cy="66" rx="7" ry="4.5" fill="#ff7fae" opacity="0.45" />
        <ellipse cx="84" cy="66" rx="7" ry="4.5" fill="#ff7fae" opacity="0.45" />
        <g className="mascot-eyes">
          <ellipse cx="46" cy="56" rx="5.5" ry="6.5" fill="#2b1c3c" />
          <ellipse cx="74" cy="56" rx="5.5" ry="6.5" fill="#2b1c3c" />
          <circle cx="48" cy="53.5" r="1.8" fill="#fff" />
          <circle cx="76" cy="53.5" r="1.8" fill="#fff" />
        </g>
        <path d="M55 66q5 5 10 0" fill="none" stroke="#2b1c3c" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M98 22l2.5 5.5 5.5 2.5-5.5 2.5-2.5 5.5-2.5-5.5-5.5-2.5 5.5-2.5z" fill="#fff" className="mascot-spark" />
      </svg>
    </div>
  )
}
