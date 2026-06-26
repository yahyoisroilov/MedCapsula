import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-soft">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full rounded-xl border border-[rgba(43,39,34,0.16)] bg-sand-card px-4 py-2.5 text-sm text-ink placeholder-ink-dim transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
          error && 'border-[#b3493d] focus:border-[#b3493d] focus:ring-[#b3493d]/15',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#b3493d]">{error}</p>}
    </div>
  )
}
