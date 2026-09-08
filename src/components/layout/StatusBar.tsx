import { useState } from 'react'

/** 状态栏 + 灵动岛（UI 规范 §7.1） */
export default function StatusBar() {
  const [time] = useState(() => {
    const d = new Date()
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  })

  return (
    <div className="statusbar">
      <span>{time}</span>
      <span className="notch" />
      <span className="right">
        <span>▮▮▮</span>
        <span>🔋</span>
      </span>
    </div>
  )
}
