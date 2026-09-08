import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  active?: boolean
}

/** 筛选 Chip（UI 规范 §7.3） */
export default function Chip({ children, active, className = '', ...rest }: ChipProps) {
  return (
    <button className={`chip${active ? ' active' : ''} ${className}`} {...rest}>
      {children}
    </button>
  )
}
