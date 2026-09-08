import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost'
}

/** 通用按钮（UI 规范 §7.3） */
export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: ButtonProps) {
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-ghost'
  return (
    <button className={`${cls} ${className}`} {...rest}>
      {children}
    </button>
  )
}
