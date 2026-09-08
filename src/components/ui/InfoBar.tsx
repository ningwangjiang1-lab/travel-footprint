import type { Guide } from '../../types'
import { formatFullDate, daysBetween } from '../../lib/format'

interface InfoBarProps {
  guide: Guide
}

/** 攻略信息栏（UI 规范 §7.4） */
export default function InfoBar({ guide }: InfoBarProps) {
  const dateRange = `${formatFullDate(guide.startDate)} – ${formatFullDate(guide.endDate)}（${daysBetween(guide.startDate, guide.endDate)}天）`
  return (
    <div className="info-bar">
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3>{guide.title}</h3>
        <div className="sub">
          {guide.destination ? <>📍 {guide.destination} ｜ </> : null}📅 {dateRange}
        </div>
        {guide.companions.length > 0 && (
          <span className="companion-tag">👥 {guide.companions.join(' · ')}</span>
        )}
      </div>
    </div>
  )
}
