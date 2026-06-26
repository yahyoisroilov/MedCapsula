import { cn } from '@/lib/utils'

type IconProps = {
  className?: string
  strokeWidth?: number
}

function Svg({
  className,
  strokeWidth = 1.8,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5', className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const ArrowRight = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>
)
export const ArrowLeft = (p: IconProps) => (
  <Svg {...p}><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></Svg>
)
export const ChevronRight = (p: IconProps) => (
  <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>
)
export const Play = (p: IconProps) => (
  <Svg {...p}><path d="m7 4 13 8-13 8z" /></Svg>
)
export const FileText = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" />
  </Svg>
)
export const Check = (p: IconProps) => (
  <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>
)
export const CheckCircle = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>
)
export const ClipboardCheck = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </Svg>
)
export const Telegram = (p: IconProps) => (
  <Svg {...p}><path d="M21.5 4.5 2.5 12l6 2 2.5 6 3-4 4 3z" /><path d="m8.5 14 8-7" /></Svg>
)
export const Plus = (p: IconProps) => (
  <Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>
)
export const Trash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
  </Svg>
)
export const Info = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>
)
export const Globe = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
  </Svg>
)
export const TrendingUp = (p: IconProps) => (
  <Svg {...p}><path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" /></Svg>
)
export const Clock = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
)
export const Layers = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" />
  </Svg>
)
export const Target = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></Svg>
)
export const GraduationCap = (p: IconProps) => (
  <Svg {...p}><path d="m12 4 10 5-10 5L2 9z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></Svg>
)
export const User = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>
)
export const Menu = (p: IconProps) => (
  <Svg {...p}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></Svg>
)
export const X = (p: IconProps) => (
  <Svg {...p}><path d="M6 6 18 18" /><path d="M18 6 6 18" /></Svg>
)
export const LogOut = (p: IconProps) => (
  <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Svg>
)
export const Shield = (p: IconProps) => (
  <Svg {...p}><path d="M12 3 5 6v6c0 4 3 6.5 7 9 4-2.5 7-5 7-9V6z" /><path d="m9 12 2 2 4-4" /></Svg>
)
export const BookOpen = (p: IconProps) => (
  <Svg {...p}><path d="M12 6c-2-1.5-5-1.5-8 0v13c3-1.5 6-1.5 8 0 2-1.5 5-1.5 8 0V6c-3-1.5-6-1.5-8 0z" /><path d="M12 6v13" /></Svg>
)
export const Trophy = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a3 3 0 0 0 3 3" /><path d="M17 6h3v1a3 3 0 0 1-3 3" />
    <path d="M12 14v4" /><path d="M8 21h8" /><path d="M10 18h4" />
  </Svg>
)
export const RotateCw = (p: IconProps) => (
  <Svg {...p}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v4h-4" /></Svg>
)
export const Upload = (p: IconProps) => (
  <Svg {...p}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></Svg>
)
export const Bold = (p: IconProps) => (
  <Svg {...p}><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" /><path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" /></Svg>
)
export const Italic = (p: IconProps) => (
  <Svg {...p}><path d="M19 5h-7" /><path d="M12 19H5" /><path d="m15 5-4 14" /></Svg>
)
export const Heading = (p: IconProps) => (
  <Svg {...p}><path d="M6 5v14" /><path d="M18 5v14" /><path d="M6 12h12" /></Svg>
)
export const ListBullet = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 6h12" /><path d="M8 12h12" /><path d="M8 18h12" />
    <path d="M4 6h.01" /><path d="M4 12h.01" /><path d="M4 18h.01" />
  </Svg>
)
export const ListNumbered = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 6h11" /><path d="M10 12h11" /><path d="M10 18h11" />
    <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </Svg>
)
export const Quote = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2-1 3-3 4" />
    <path d="M19 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2-1 3-3 4" />
  </Svg>
)
export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Svg>
)
export const Minus = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14" /></Svg>
)
export const Eye = (p: IconProps) => (
  <Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></Svg>
)

/** Capsule logo mark used in the navbar / footer. */
export function CapsuleMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-flex h-[19px] w-[36px] overflow-hidden rounded-[6px]', className)}
      aria-hidden="true"
    >
      <span className="h-full w-1/2" style={{ background: 'linear-gradient(160deg,#3a7a5c,#2F6B4F)' }} />
      <span className="h-full w-1/2" style={{ background: 'linear-gradient(160deg,#92c4e4,#7FB8DC)' }} />
    </span>
  )
}
