import type { ReactNode } from 'react'

interface EmptyStateProps {
  emoji?: string
  title: string
  desc?: string
  action?: ReactNode
}

/** 空状态（PRD §9 特别要求 2：温馨插画 + 引导文案） */
export default function EmptyState({ emoji = '🗺️', title, desc, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="illu">{emoji}</div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  )
}
