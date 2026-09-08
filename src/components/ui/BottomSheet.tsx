import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
}

/** 底部滑动面板（UI 规范 §7.9） */
export default function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  return (
    <>
      <div className={`sheet-mask${open ? ' open' : ''}`} onClick={onClose} />
      <div
        className={`bottom-sheet${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || '面板'}
      >
        <div className="sheet-handle" />
        {title && <h4>{title}</h4>}
        {children}
      </div>
    </>
  )
}
