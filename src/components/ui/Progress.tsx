interface ProgressProps {
  /** 0~1 */
  value: number
  /** 高（px），攻略卡 5px / 预算 6px */
  height?: number
  /** 填充样式（默认日落橙） */
  fill?: string
}

/** 进度条（UI 规范 §7.7） */
export default function Progress({ value, height = 5, fill }: ProgressProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className="progress" style={{ height }}>
      <span style={{ width: `${pct}%`, ...(fill ? { background: fill } : {}) }} />
    </div>
  )
}
