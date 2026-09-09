import { useState } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Day, Item as ItemModel } from '../../types'
import { formatDateCn } from '../../lib/format'
import Item from './Item'
import QuickAddBar from './QuickAddBar'

interface SortableItemRowProps {
  item: ItemModel
  seq?: number
  dayNumber: number
  /** 是否处于编辑模式（仅编辑模式下显示拖拽手柄、单击可编辑） */
  editing: boolean
  /** 编辑模式下单击条目 */
  onClickEdit?: () => void
  /** 非编辑模式下双击条目 */
  onDoubleClickEdit?: () => void
  /** 编辑模式下删除条目 */
  onDelete?: () => void
}

/** 可拖拽排序的条目行 */
function SortableItemRow({ item, seq, dayNumber, editing, onClickEdit, onDoubleClickEdit, onDelete }: SortableItemRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'item', dayNumber },
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'dragging' : ''}>
      <Item
        item={item}
        seq={seq}
        handleProps={editing ? { ...attributes, ...listeners } : undefined}
        onClick={editing ? onClickEdit : undefined}
        onDoubleClick={editing ? undefined : onDoubleClickEdit}
        onDelete={editing ? onDelete : undefined}
      />
    </div>
  )
}

interface DayBlockProps {
  day: Day
  collapsed: boolean
  onToggleCollapse: () => void
  onAddItem: () => void
  onDeleteDay: () => void
  onEditRoute: (route: string) => void
  onEditItem: (item: ItemModel) => void
  onDeleteItem: (item: ItemModel) => void
}

/** 天块时间轴（UI 规范 §7.5） */
export default function DayBlock({
  day,
  collapsed,
  onToggleCollapse,
  onAddItem,
  onDeleteDay,
  onEditRoute,
  onEditItem,
  onDeleteItem,
}: DayBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: day.id,
    data: { type: 'day', dayNumber: day.dayNumber },
  })
  const [editingRoute, setEditingRoute] = useState(false)
  const [routeDraft, setRouteDraft] = useState(day.route || '')
  // 编辑模式：默认展示模式，✏️ 进入编辑后可增删、拖拽条目
  const [editing, setEditing] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const itemIds = day.items.map((i) => i.id)
  // 景点序号：当天内 location 条目按顺序自动编号
  let locSeq = 0

  const commitRoute = () => {
    setEditingRoute(false)
    // 按空格/箭头拆分城市，多个城市自动用 → 连接
    const cities = routeDraft.trim().split(/[\s→]+/).filter(Boolean)
    onEditRoute(cities.length > 1 ? cities.join(' → ') : cities[0] || '')
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`day${collapsed ? ' collapsed' : ''}${isDragging ? ' dragging' : ''}`}
    >
      <div className="day-head" onClick={onToggleCollapse}>
        <div className="day-head-top">
          <span
            className="drag-handle"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            aria-label="拖拽调整天数"
          >
            ⋮⋮
          </span>
          <span className="when">{formatDateCn(day.date)}</span>
          <span className="flex-spacer" />
          <div className="day-actions" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditing((v) => !v)}
              aria-label={editing ? '完成编辑' : '编辑当天攻略'}
              style={
                editing
                  ? {
                      background: 'var(--brown)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  : undefined
              }
            >
              ✏️
            </button>
            <button onClick={onDeleteDay} aria-label="删除当天">
              🗑️
            </button>
          </div>
          <span
            className="fold"
            onClick={(e) => {
              e.stopPropagation()
              onToggleCollapse()
            }}
          >
            {collapsed ? '▸' : '▾'}
          </span>
        </div>
        {editingRoute ? (
          <input
            className="day-route-input"
            autoFocus
            value={routeDraft}
            placeholder="如有多个城市请用空格隔开"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setRouteDraft(e.target.value)}
            onBlur={commitRoute}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRoute()
            }}
          />
        ) : (
          <span
            className="route"
            onClick={(e) => {
              e.stopPropagation()
              setEditingRoute(true)
            }}
          >
            {day.route || '＋ 城市'}
          </span>
        )}
      </div>

      {!collapsed && (
        <>
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="day-body">
              {day.items.map((item) => {
                if (item.type === 'location') locSeq += 1
                return (
                  <SortableItemRow
                    key={item.id}
                    item={item}
                    seq={item.type === 'location' ? locSeq : undefined}
                    dayNumber={day.dayNumber}
                    editing={editing}
                    onClickEdit={() => onEditItem(item)}
                    onDoubleClickEdit={() => {
                      setEditing(true)
                      onEditItem(item)
                    }}
                    onDelete={() => onDeleteItem(item)}
                  />
                )
              })}
              {day.items.length === 0 && (
                <div className="empty-day">
                  {editing ? '点击下方「＋ 添加条目」开始规划路线' : '这一天还没有安排~'}
                </div>
              )}
            </div>
          </SortableContext>
          {editing && <QuickAddBar onAdd={onAddItem} />}
        </>
      )}
    </div>
  )
}
