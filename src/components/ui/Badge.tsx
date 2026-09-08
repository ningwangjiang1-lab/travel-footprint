import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  /** 底色（一般为类别色 Token） */
  color?: string
}

/** 分类徽章（UI 规范 §7.6：10.5px/500 白字、圆角 999、底为类别色） */
export default function Badge({ children, color }: BadgeProps) {
  return (
    <span className="cat" style={{ background: color }}>
      {children}
    </span>
  )
}
