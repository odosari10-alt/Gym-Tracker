interface CheckIconProps {
  className?: string
}

export function CheckIcon({ className = '' }: CheckIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <polyline
        points="4,12 10,18 20,6"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
