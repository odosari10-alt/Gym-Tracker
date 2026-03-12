interface CardioIconProps {
  className?: string
}

export function CardioIcon({ className = '' }: CardioIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Heart outline */}
      <path
        d="M12 20S4 14.5 4 9.5C4 7 6 4.5 8.5 4.5c1.5 0 2.8.7 3.5 1.8C12.7 5.2 14 4.5 15.5 4.5 18 4.5 20 7 20 9.5 20 14.5 12 20 12 20z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* ECG pulse line through center */}
      <polyline
        points="4,12 8,12 9.5,8 11,14 12.5,10 14,12 20,12"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
