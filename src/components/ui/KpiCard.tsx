import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  children?: ReactNode
}

/** KPI 统计卡（UI 规范 §7.4） */
export default function KpiCard({ label, value, hint, children }: KpiCardProps) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {children}
      {hint != null && <div className="hint">{hint}</div>}
    </div>
  )
}
