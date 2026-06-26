import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  href,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-brand text-sand shadow-btn-sm hover:bg-brand-dark',
    secondary:
      'bg-sand-card text-ink border border-[rgba(43,39,34,0.16)] shadow-[0_1px_2px_rgba(43,39,34,0.05)] hover:bg-white',
    ghost: 'text-ink-mute hover:text-brand',
    danger: 'bg-[#b3493d] text-sand hover:bg-[#9c3e34]',
  }

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  }

  const classes = cn(base, variants[variant], sizes[size], className)

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="-ml-1 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
