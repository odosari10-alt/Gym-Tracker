import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`bg-surface rounded-2xl p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
