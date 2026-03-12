interface BookmarkIconProps {
  className?: string
  filled?: boolean
}

export function BookmarkIcon({ className = '', filled = false }: BookmarkIconProps) {
  return (
    <svg
      viewBox="0 0 14 18"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14l-6-4-6 4V3z" />
    </svg>
  )
}
