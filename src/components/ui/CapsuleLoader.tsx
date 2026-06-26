/**
 * Branded loading indicator — a gently bobbing two-tone capsule (green / blue),
 * echoing the MedCapsula mark and the three-stage identity.
 * Pure CSS animation (keyframes live in globals.css), safe in server components.
 */

type Size = 'sm' | 'md' | 'lg'

const DIMS: Record<Size, { w: number; h: number }> = {
  sm: { w: 34, h: 78 },
  md: { w: 48, h: 112 },
  lg: { w: 60, h: 140 },
}

export function CapsuleLoader({
  size = 'md',
  label = 'Yuklanmoqda…',
  className = '',
}: {
  size?: Size
  label?: string | null
  className?: string
}) {
  const { w, h } = DIMS[size]

  return (
    <div className={`flex flex-col items-center justify-center gap-5 ${className}`}>
      <div className="relative grid place-items-center" style={{ width: h, height: h }}>
        {/* soft brand glow behind the capsule */}
        <span
          className="mc-cap-glow absolute rounded-full"
          style={{
            width: h * 0.78,
            height: h * 0.78,
            background: 'radial-gradient(circle, rgba(47,107,79,0.22), rgba(127,184,220,0.12) 55%, transparent 72%)',
            animation: 'mcGlow 2.4s ease-in-out infinite',
          }}
          aria-hidden="true"
        />

        {/* the capsule */}
        <span
          className="mc-cap-bob relative block overflow-hidden border border-white/30 shadow-lift"
          style={{
            width: w,
            height: h,
            borderRadius: w,
            animation: 'mcBob 2.4s ease-in-out infinite',
            filter: 'drop-shadow(0 14px 20px rgba(43,39,34,0.18))',
          }}
          role="status"
          aria-label={label ?? 'Yuklanmoqda'}
        >
          {/* green top half */}
          <span
            className="absolute inset-x-0 top-0 block"
            style={{ height: '50%', background: 'linear-gradient(150deg,#3d805f,#2F6B4F 60%,#27593f)' }}
          >
            <span className="absolute left-[22%] top-[12%] h-[58%] w-[16%] rounded-full bg-white/25" />
          </span>
          {/* blue bottom half */}
          <span
            className="absolute inset-x-0 bottom-0 block"
            style={{ height: '50%', background: 'linear-gradient(150deg,#9ccaea,#7FB8DC 55%,#69a6cf)' }}
          />
          {/* seam */}
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/10" />
          {/* sweeping sheen */}
          <span
            className="mc-cap-sheen absolute inset-x-0 block h-1/3"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.45), transparent)',
              animation: 'mcSheen 2.2s ease-in-out infinite',
            }}
            aria-hidden="true"
          />
        </span>
      </div>

      {/* three stage dots: green · blue · green */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {['#2F6B4F', '#5A95BE', '#2F6B4F'].map((c, i) => (
          <span
            key={i}
            className="mc-cap-dot h-1.5 w-1.5 rounded-full"
            style={{ background: c, animation: `mcDot 1.2s ease-in-out ${i * 0.18}s infinite` }}
          />
        ))}
      </div>

      {label && (
        <p className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-ink-faint">{label}</p>
      )}
    </div>
  )
}

export default CapsuleLoader
