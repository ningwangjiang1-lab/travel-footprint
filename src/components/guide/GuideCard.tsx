import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, animate } from 'framer-motion'
import type { Guide } from '../../types'
import { formatFullDate } from '../../lib/format'

const DELETE_WIDTH = 84

interface GuideCardProps {
  guide: Guide
  onDelete: () => void
}

/** 攻略卡片（UI 规范 §7.4，无封面，支持左滑删除） */
export default function GuideCard({ guide, onDelete }: GuideCardProps) {
  const navigate = useNavigate()
  const x = useMotionValue(0)
  const [open, setOpen] = useState(false)
  // 标记是否刚发生了拖拽，避免拖拽后的 click 误触导航
  const draggedRef = useRef(false)

  const openDelete = () => {
    setOpen(true)
    animate(x, -DELETE_WIDTH, { type: 'spring', stiffness: 420, damping: 32 })
  }
  const closeDelete = () => {
    setOpen(false)
    animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 })
  }

  const handleClick = () => {
    if (draggedRef.current) return
    if (open) closeDelete()
    else navigate(`/guide/${guide.id}`)
  }

  return (
    <div className="swipe-wrap">
      <button className="swipe-delete" onClick={onDelete}>
        <span className="swipe-delete-icon">🗑️</span>
        <span>删除</span>
      </button>
      <motion.div
        className="swipe-card"
        drag="x"
        dragConstraints={{ left: -DELETE_WIDTH, right: 0 }}
        dragElastic={0.08}
        style={{ x }}
        onDragStart={() => {
          draggedRef.current = true
        }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -DELETE_WIDTH / 2) openDelete()
          else closeDelete()
          // 在浏览器 click 事件之后复位拖拽标记
          setTimeout(() => {
            draggedRef.current = false
          }, 0)
        }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleClick()
        }}
      >
        <div className="guide-body">
          <h3>{guide.title}</h3>
          <div className="meta">
            {guide.destination && <span>📍 {guide.destination}</span>}
            <span>
              📅 {formatFullDate(guide.startDate)} – {formatFullDate(guide.endDate)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
