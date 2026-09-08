import type { ButtonHTMLAttributes } from 'react'
import type { Item as ItemModel } from '../../types'
import ItemIcon from './ItemIcon'

const CIRCLED = [
  '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
  '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳',
]

export function toCircled(n: number): string {
  return n >= 1 && n <= CIRCLED.length ? CIRCLED[n - 1] : `${n}`
}

interface ItemProps {
  item: ItemModel
  /** 景点当天内序号（仅 location 类型显示） */
  seq?: number
  onToggleCheck?: () => void
  /** dnd-kit 拖拽手柄属性（attributes + listeners） */
  handleProps?: ButtonHTMLAttributes<HTMLButtonElement>
}

/** 时间轴条目（UI 规范 §7.5） */
export default function Item({ item, seq, onToggleCheck, handleProps }: ItemProps) {
  const checkable = item.type === 'location' || item.type === 'food'
  return (
    <div className="item">
      <ItemIcon type={item.type} emoji={item.metadata?.transportEmoji} />
      <span className="txt">
        {seq != null && <span className="seq">{toCircled(seq)}</span>}
        {item.content}
        {item.note && <span className="note">（{item.note}）</span>}
      </span>
      {checkable && (
        <button
          className={`check${item.checked ? '' : ' unchecked'}`}
          onClick={onToggleCheck}
          aria-label={item.checked ? '取消打卡' : '标记已打卡'}
        >
          ✓
        </button>
      )}
      {handleProps && (
        <button className="drag-handle" {...handleProps} aria-label="拖拽排序">
          ⋮⋮
        </button>
      )}
    </div>
  )
}
