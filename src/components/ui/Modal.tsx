import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative bg-[#121212] border-t border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold text-primary">{title}</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-surface-hover text-text-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
