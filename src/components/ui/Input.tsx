import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm text-text-secondary font-medium">{label}</label>}
      <input
        id={inputId}
        className={`bg-surface border border-border-input rounded-xl px-3 py-2.5 text-base text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors ${className}`}
        {...props}
      />
    </div>
  )
}
