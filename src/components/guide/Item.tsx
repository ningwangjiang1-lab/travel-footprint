import type { ButtonHTMLAttributes } from 'react'
import type { Item as ItemModel } from '../../types'
import { toCircled, toRoman } from '../../lib/seq'
import ItemIcon from './ItemIcon'

interface ItemProps {
  item: ItemModel
  /** 大景点当天内序号（仅 location 类型显示，带圈数字） */
  seq?: number
  /** 小景点序号（罗马数字） */
  roman?: number
  /** 是否为小景点（缩进显示） */
  isSub?: boolean
  /** dnd-kit 拖拽手柄属性（attributes + listeners） */
  handleProps?: ButtonHTMLAttributes<HTMLButtonElement>
  /** 单击回调（编辑模式下点击条目进入编辑） */
  onClick?: () => void
  /** 双击回调（非编辑模式下双击进入编辑） */
  onDoubleClick?: () => void
  /** 删除回调（编辑模式下显示删除按钮） */
  onDelete?: () => void
  /** 添加小景点回调（编辑模式下大景点显示 + 号） */
  onAddSub?: () => void
}

/** 时间轴条目（UI 规范 §7.5） */
export default function Item({
  item,
  seq,
  roman,
  isSub,
  handleProps,
  onClick,
  onDoubleClick,
  onDelete,
  onAddSub,
}: ItemProps) {
  return (
    <div className={`item${isSub ? ' sub' : ''}`} onClick={onClick} onDoubleClick={onDoubleClick}>
      {!isSub && (
        <button
          className="drag-handle"
          {...(handleProps || {})}
          onClick={(e) => e.stopPropagation()}
          aria-label="拖拽排序"
          style={handleProps ? undefined : { visibility: 'hidden' }}
        >
          ⋮⋮
        </button>
      )}
      {item.type === 'location' ? (
        <span className="seq">{isSub ? toRoman(roman ?? 0) : toCircled(seq ?? 0)}</span>
      ) : (
        <ItemIcon type={item.type} emoji={item.metadata?.transportEmoji} />
      )}
      <span className="txt">
        {item.content}
        {item.note && <span className="note">（{item.note}）</span>}
      </span>
      {onAddSub && (
        <button
          className="item-add-sub"
          onClick={(e) => {
            e.stopPropagation()
            onAddSub()
          }}
          aria-label="添加小景点"
        >
          +
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
