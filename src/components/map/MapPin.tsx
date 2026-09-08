interface MapPinProps {
  name: string
  lit: boolean
  left: number
  top: number
  onClick?: () => void
}

/** 地图地点图钉（UI 规范 §7.10：已点亮脉冲 / 未点亮灰点） */
export default function MapPin({ name, lit, left, top, onClick }: MapPinProps) {
  return (
    <span
      className={`pin${lit ? ' lit' : ' gray'}`}
      style={{ left: `${left}%`, top: `${top}%` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={name}
    >
      <div className="spot" />
      <div className="nm">{name}</div>
    </span>
  )
}
