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
  /** dnd-kit 拖拽手柄属性（attributes + listeners） */
  handleProps?: ButtonHTMLAttributes<HTMLButtonElement>
  /** 单击回调（编辑模式下点击条目进入编辑） */
  onClick?: () => void
  /** 双击回调（非编辑模式下双击进入编辑） */
  onDoubleClick?: () => void
  /** 删除回调（编辑模式下显示删除按钮） */
  onDelete?: () => void
}

/** 时间轴条目（UI 规范 §7.5） */
export default function Item({ item, seq, handleProps, onClick, onDoubleClick, onDelete }: ItemProps) {
  return (
    <div className="item" onClick={onClick} onDoubleClick={onDoubleClick}>
      {item.type === 'location' ? (
        <span className="seq">{toCircled(seq ?? 0)}</span>
      ) : (
        <ItemIcon type={item.type} emoji={item.metadata?.transportEmoji} />
      )}
      <span className="txt">
        {item.content}
        {item.note && <span className="note">（{item.note}）</span>}
      </span>
      {handleProps && (
        <button
          className="drag-handle"
          {...handleProps}
          onClick={(e) => e.stopPropagation()}
          aria-label="拖拽排序"
        >
          ⋮⋮
        </button>
      )}
      {onDelete && (
        <button
          className="item-delete"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label="删除条目"
        >
          ✕
        </button>
      )}
    </div>
  )
}
