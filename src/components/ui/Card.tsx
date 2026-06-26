import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgba(43,39,34,0.10)] bg-sand-card shadow-card',
        hover && 'transition-all hover:-translate-y-0.5 hover:border-brand-line hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  )
}
