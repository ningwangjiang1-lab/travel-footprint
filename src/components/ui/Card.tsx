import type { HTMLAttributes, ReactNode } from 'react'

/** 通用卡片容器（底 --card、边框 --line、圆角 16、阴影 e-1） */
export default function Card({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`chart-card ${className}`} {...rest}>
      {children}
    </div>
  )
}
