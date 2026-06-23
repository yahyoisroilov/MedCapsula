import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
}

export function Card({ children, className, hover, glass }: CardProps) {
  return (
    <div
      className={cn(
        glass ? 'glass' : 'bg-white dark:bg-medCard border border-black/5 dark:border-white/10',
        'rounded-2xl',
        hover && 'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 transition',
        className
      )}
    >
      {children}
    </div>
  )
}
