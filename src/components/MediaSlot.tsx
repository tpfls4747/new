import type { Media } from '../data/projects'

/**
 * 이미지 자리. media.src가 있으면 실제 이미지를, 없으면 교체용 자리 표시를 그립니다.
 * 자리 표시 안의 스케치는 구성을 짐작하게 하는 와이어일 뿐, 실제 UI가 아닙니다.
 */
export function MediaSlot({ media, className = '', priority = false }: { media: Media; className?: string; priority?: boolean }) {
  const style = { aspectRatio: media.aspect ?? '4 / 3' }
  if (media.src) {
    return (
      <div className={`media ${className}`} style={style}>
        <img src={media.src} alt={media.alt} loading={priority ? 'eager' : 'lazy'} decoding="async" />
      </div>
    )
  }
  return (
    <div className={`media media--placeholder ${className}`} style={style} role="img" aria-label={`${media.alt} (샘플 화면)`}>
      <Sketch kind={media.sketch} />
      {/* 실제 이미지를 넣을 경로: public{media.hint} */}
      <div className="media-label" aria-hidden="true" title={`교체 경로: public${media.hint}`}>
        Sample UI
      </div>
    </div>
  )
}

function Sketch({ kind }: { kind?: Media['sketch'] }) {
  const stroke = 'var(--sketch)'
  switch (kind) {
    case 'seat-map':
      return (
        <svg className="sketch" viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <path d="M110 46 Q200 20 290 46" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 10 }).map((__, c) => {
              const x = 92 + c * 22 + (c > 4 ? 12 : 0)
              const y = 84 + r * 28
              const mine = (r === 2 && c === 1) || (r === 4 && c === 7)
              const swap = r === 3 && (c === 3 || c === 4)
              return (
                <rect
                  key={`${r}-${c}`}
                  x={x}
                  y={y}
                  width="16"
                  height="16"
                  rx="4"
                  fill={swap ? 'var(--sketch-accent)' : mine ? 'var(--sketch-strong)' : 'none'}
                  stroke={swap ? 'var(--sketch-accent)' : stroke}
                  strokeWidth="2"
                  strokeDasharray={mine ? '0' : undefined}
                />
              )
            }),
          )}
          <path d="M127 138 C150 150 160 170 168 176" fill="none" stroke="var(--sketch-accent)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M267 194 C240 196 215 186 200 178" fill="none" stroke="var(--sketch-accent)" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      )
    case 'phone':
      return (
        <svg className="sketch" viewBox="0 0 180 320" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <rect x="20" y="28" width="140" height="18" rx="6" fill="none" stroke={stroke} strokeWidth="2" />
          <rect x="20" y="62" width="140" height="70" rx="10" fill="none" stroke={stroke} strokeWidth="2" />
          <rect x="20" y="146" width="140" height="36" rx="8" fill="none" stroke={stroke} strokeWidth="2" />
          <rect x="20" y="192" width="140" height="36" rx="8" fill="none" stroke={stroke} strokeWidth="2" />
          <rect x="20" y="268" width="140" height="30" rx="15" fill="var(--sketch-accent)" />
        </svg>
      )
    case 'chart':
      return (
        <svg className="sketch" viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <rect x="60" y="50" width="140" height="22" rx="6" fill="none" stroke={stroke} strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="60" y={96 + i * 34} width={180 - i * 24} height="18" rx="6" fill="none" stroke={stroke} strokeWidth="2" />
          ))}
          <circle cx="300" cy="150" r="56" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M300 94 A56 56 0 0 1 352 170" fill="none" stroke="var(--sketch-accent)" strokeWidth="10" />
        </svg>
      )
    case 'room':
      return (
        <svg className="sketch" viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <rect x="70" y="50" width="260" height="200" rx="4" fill="none" stroke={stroke} strokeWidth="3" />
          <rect x="90" y="70" width="90" height="60" rx="6" fill="none" stroke={stroke} strokeWidth="2" />
          <rect x="230" y="170" width="80" height="60" rx="6" fill="var(--sketch-accent)" opacity="0.6" />
          <rect x="226" y="166" width="88" height="68" rx="8" fill="none" stroke="var(--sketch-accent)" strokeWidth="2" strokeDasharray="5 4" />
          <path d="M70 200 A40 40 0 0 1 110 240" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>
      )
    case 'flow':
      return (
        <svg className="sketch" viewBox="0 0 700 300" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={40 + i * 130} y="120" width="100" height="60" rx="12" fill={i === 2 ? 'var(--sketch-accent)' : 'none'} stroke={stroke} strokeWidth="2" />
              {i < 4 && <path d={`M${140 + i * 130} 150 h30`} stroke={stroke} strokeWidth="2" markerEnd="url(#arrow)" />}
            </g>
          ))}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill={stroke} />
            </marker>
          </defs>
        </svg>
      )
    default:
      return null
  }
}
