import { useState } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Day, Item as ItemModel } from '../../types'
import { formatDateCn } from '../../lib/format'
import Item from './Item'
import QuickAddBar from './QuickAddBar'

interface SortableBlockRowProps {
  /** 块内条目：第一个为大景点，其后为其小景点 */
  block: ItemModel[]
  dayNumber: number
  /** 是否处于编辑模式（仅编辑模式下显示拖拽手柄、单击可编辑） */
  editing: boolean
  /** 条目 id → 序号信息（带圈数字 / 罗马数字） */
  seqInfo: Map<string, { seq?: number; roman?: number }>
  /** 编辑模式下单击条目 */
  onClickEdit: (item: ItemModel) => void
  /** 非编辑模式下双击条目 */
  onDoubleClickEdit: (item: ItemModel) => void
  /** 编辑模式下删除条目 */
  onDelete: (item: ItemModel) => void
  /** 编辑模式下添加小景点（大景点） */
  onAddSub?: () => void
}

/** 可拖拽排序的块：大景点连同其小景点作为一个整体移动 */
function SortableBlockRow({
  block,
  dayNumber,
  editing,
  seqInfo,
  onClickEdit,
  onDoubleClickEdit,
  onDelete,
  onAddSub,
}: SortableBlockRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block[0].id,
    data: { type: 'item', dayNumber },
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'dragging' : ''}>
      {block.map((item) => {
        const info = seqInfo.get(item.id)
        const isParent = !item.parentId
        return (
          <Item
            key={item.id}
            item={item}
            seq={info?.seq}
            roman={info?.roman}
            isSub={!isParent}
            handleProps={editing && isParent ? { ...attributes, ...listeners } : undefined}
            onClick={editing ? () => onClickEdit(item) : undefined}
            onDoubleClick={editing ? undefined : () => onDoubleClickEdit(item)}
            onDelete={editing ? () => onDelete(item) : undefined}
            onAddSub={editing && isParent && item.type === 'location' ? onAddSub : undefined}
          />
        )
      })}
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
  /** 在大景点下添加小景点 */
  onAddSub: (parentId: string) => void
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
  onAddSub,
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

  // 将条目按「大景点 + 其小景点」分块，块作为一个整体参与拖拽排序
  const blocks: ItemModel[][] = []
  for (const item of day.items) {
    if (!item.parentId) {
      blocks.push([item])
    } else if (blocks.length > 0) {
      blocks[blocks.length - 1].push(item)
    } else {
      blocks.push([item])
    }
  }
  const blockIds = blocks.map((b) => b[0].id)

  // 景点序号：大景点按顺序用带圈数字编号，小景点按所属大景点用罗马数字编号
  let locSeq = 0
  const subSeq = new Map<string, number>()
  const seqInfo = new Map<string, { seq?: number; roman?: number }>()
  for (const item of day.items) {
    if (item.type === 'location' && !item.parentId) {
      locSeq += 1
      seqInfo.set(item.id, { seq: locSeq })
    } else if (item.type === 'location' && item.parentId) {
      const n = (subSeq.get(item.parentId) || 0) + 1
      subSeq.set(item.parentId, n)
      seqInfo.set(item.id, { roman: n })
    }
  }

  const commitRoute = () => {
    setEditingRoute(false)
    // 按空格/箭头拆分城市，多个城市自动用 → 连接
    const cities = routeDraft.trim().split(/[\s→]+/).filter(Boolean)
    onEditRoute(cities.length > 1 ? cities.join(' → ') : cities[0] || '')
  }

  // 进入编辑模式时自动展开当天；收起当天时自动退出编辑模式
  const handleToggleEdit = () => {
    const next = !editing
    setEditing(next)
    if (next && collapsed) onToggleCollapse()
  }
  const handleToggleCollapse = () => {
    if (!collapsed) setEditing(false)
    onToggleCollapse()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`day${collapsed ? ' collapsed' : ''}${isDragging ? ' dragging' : ''}`}
    >
      <div className="day-head" onClick={handleToggleCollapse}>
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
              onClick={handleToggleEdit}
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
              handleToggleCollapse()
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
          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            <div className="day-body">
              {blocks.map((block) => (
                <SortableBlockRow
                  key={block[0].id}
                  block={block}
                  dayNumber={day.dayNumber}
                  editing={editing}
                  seqInfo={seqInfo}
                  onClickEdit={(item) => onEditItem(item)}
                  onDoubleClickEdit={(item) => {
                    setEditing(true)
                    onEditItem(item)
                  }}
                  onDelete={(item) => onDeleteItem(item)}
                  onAddSub={
                    block[0].type === 'location' ? () => onAddSub(block[0].id) : undefined
                  }
                />
              ))}
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
