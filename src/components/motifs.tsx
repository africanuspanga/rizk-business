import { useId, type ReactNode } from 'react'

/**
 * Swahili coast motifs, black and white only.
 * Lattice: the 8-point star screen (Arabic jali) on Zanzibar windows.
 * Arch: the rounded top of carved Stone Town and Indian doors.
 * Rosette: the carved door boss, used as a small ornament.
 */

export function Lattice({ size = 44, stroke = 'currentColor', opacity = 0.14, className = '' }: { size?: number; stroke?: string; opacity?: number; className?: string }) {
  const id = useId()
  const h = size / 2
  const q = size * 0.29
  return (
    <svg aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={stroke} strokeWidth="1" opacity={opacity}>
            {/* Two overlapped squares make the 8-point star; corner quarters join the tiles. */}
            <rect x={h - q} y={h - q} width={q * 2} height={q * 2} />
            <rect x={h - q} y={h - q} width={q * 2} height={q * 2} transform={`rotate(45 ${h} ${h})`} />
            <circle cx={h} cy={h} r={q * 0.42} />
            <path d={`M0 0 L${h - q * 1.41} 0 M0 0 L0 ${h - q * 1.41} M${size} ${size} L${size - (h - q * 1.41)} ${size} M${size} ${size} L${size} ${size - (h - q * 1.41)}`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export function Rosette({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" className={className}>
      <g fill="currentColor">
        <rect x="6" y="6" width="12" height="12" />
        <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
      </g>
      <circle cx="12" cy="12" r="3" fill="var(--rosette-hole, #fff)" />
    </svg>
  )
}

/** A door arch: rounded top, with a second hairline arch outside it like a carved frame. */
export function Arch({ children, className = '', frame = true, dark = false }: { children: ReactNode; className?: string; frame?: boolean; dark?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      {frame && (
        <div
          aria-hidden
          className={`absolute -inset-3 rounded-t-full border ${dark ? 'border-white/25' : 'border-black/15'}`}
        />
      )}
      <div className="relative h-full overflow-hidden rounded-t-full">{children}</div>
    </div>
  )
}

/** Kanga-style border: a row of small diamonds, for section edges. */
export function DiamondRow({ className = '' }: { className?: string }) {
  const id = useId()
  return (
    <svg aria-hidden className={`h-3 w-full ${className}`}>
      <defs>
        <pattern id={id} width="18" height="12" patternUnits="userSpaceOnUse">
          <path d="M9 1 L14 6 L9 11 L4 6 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="9" cy="6" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
