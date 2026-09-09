import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Page from '../components/layout/Page'
import InfoBar from '../components/ui/InfoBar'
import EmptyState from '../components/ui/EmptyState'
import BottomSheet from '../components/ui/BottomSheet'
import DayBlock from '../components/guide/DayBlock'
import ShareImage from '../components/guide/ShareImage'
import { useStore } from '../store/useStore'
import { useUi } from '../store/useUi'
import { lookupCity } from '../lib/cities'
import { exportNodeToPng } from '../lib/share'
import type { Item, ItemType } from '../types'

interface DragData {
  type?: 'day' | 'item'
  dayNumber?: number
}

const TYPE_LABEL: Record<ItemType, string> = {
  transport: '交通',
  location: '景点',
  food: '美食',
  hotel: '住宿',
}

const TYPE_ICON: Record<ItemType, string> = {
  transport: '🚞',
  location: '📍',
  food: '🍜',
  hotel: '🏨',
}

// 交通方式：火车/高铁、飞机需按字段依次填写，其余一行描述即可
const TRANSPORTS: { emoji: string; mode: 'train' | 'plane' | ''; label: string }[] = [
  { emoji: '🚞', mode: 'train', label: '火车/高铁' },
  { emoji: '✈️', mode: 'plane', label: '飞机' },
  { emoji: '🚇', mode: '', label: '地铁' },
  { emoji: '🚌', mode: '', label: '大巴' },
  { emoji: '🚗', mode: '', label: '自驾' },
  { emoji: '🚕', mode: '', label: '打车' },
  { emoji: '🚶🏻‍♂️', mode: '', label: '步行' },
  { emoji: '🚲', mode: '', label: '骑行' },
]

type StructKey = 'no' | 'from' | 'fromTime' | 'toTime' | 'to'

// 结构化交通（火车/飞机）的字段顺序与标签，填写后拼成一行
const STRUCTURED_FIELDS: Record<'train' | 'plane', { key: StructKey; label: string }[]> = {
  train: [
    { key: 'no', label: '车次' },
    { key: 'from', label: '出发站' },
    { key: 'fromTime', label: '发车时刻' },
    { key: 'toTime', label: '到达时刻' },
    { key: 'to', label: '到达站' },
  ],
  plane: [
    { key: 'no', label: '航班号' },
    { key: 'from', label: '出发机场' },
    { key: 'fromTime', label: '出发时间' },
    { key: 'toTime', label: '到达时间' },
    { key: 'to', label: '到达机场' },
  ],
}

/** 从拼接后的正文反推出结构化字段（兼容旧数据，无 struct 元数据时使用） */
function parseStructuredContent(content: string): {
  no: string
  from: string
  fromTime: string
  toTime: string
  to: string
} | null {
  const [left, right] = content.split(' – ')
  if (!left || !right) return null
  const l = left.trim().split(/\s+/)
  const r = right.trim().split(/\s+/)
  if (l.length < 3 || r.length < 2) return null
  return {
    no: l[0],
    from: l.slice(1, -1).join(' '),
    fromTime: l[l.length - 1],
    toTime: r[0],
    to: r.slice(1).join(' '),
  }
}

interface ItemFormState {
  dayNumber: number
  type: ItemType
  /** 编辑已有条目时传入其 id；为空表示新增 */
  itemId?: string
}

/** 攻略编辑页（开发计划 Step 4–5、8） */
export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const guide = useStore((s) => s.guides.find((g) => g.id === id))
  const {
    addDay,
    removeDay,
    updateDay,
    addItem,
    updateItem,
    removeItem,
    moveDay,
    reorderItem,
    upsertLocation,
    removeLocationByName,
  } = useStore.getState()
  const openNewGuide = useUi((s) => s.openNewGuide)

  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [sheetDay, setSheetDay] = useState<number | null>(null)
  const [form, setForm] = useState<ItemFormState | null>(null)
  const [deleteDay, setDeleteDay] = useState<number | null>(null)
  const [deleteItem, setDeleteItem] = useState<{ dayNumber: number; item: Item } | null>(null)

  // 条目表单字段
  const [content, setContent] = useState('')
  const [note, setNote] = useState('')
  const [transportEmoji, setTransportEmoji] = useState('🚞')
  // 结构化交通（火车/飞机）的分段字段
  const [struct, setStruct] = useState<Record<StructKey, string>>({
    no: '',
    from: '',
    fromTime: '',
    toTime: '',
    to: '',
  })

  const selectedTransport = TRANSPORTS.find((t) => t.emoji === transportEmoji)
  const structuredMode =
    form?.type === 'transport' && selectedTransport?.mode ? selectedTransport.mode : null
  const canSubmit = structuredMode
    ? Object.values(struct).every((v) => v.trim() !== '')
    : content.trim().length > 0

  // 分享图
  const shareRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  if (!guide) {
    return (
      <Page>
        <h1 className="page-head">攻略编辑</h1>
        <EmptyState
          emoji="📝"
          title={id ? '攻略不存在' : '还没有攻略'}
          desc={id ? '这份攻略可能已被删除。' : '先创建一份攻略，开始规划你的旅程。'}
          action={
            id ? (
              <button className="btn-primary" onClick={() => navigate('/')}>
                返回首页
              </button>
            ) : (
              <button className="btn-primary" onClick={openNewGuide}>
                ＋ 新建攻略
              </button>
            )
          }
        />
      </Page>
    )
  }

  const dayIds = guide.days.map((d) => d.id)

  const toggleCollapse = (dayNumber: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(dayNumber)) next.delete(dayNumber)
      else next.add(dayNumber)
      return next
    })
  }

  const handleDeleteDay = (dayNumber: number) => {
    if (guide.days.length <= 1) return
    setDeleteDay(dayNumber)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const a = active.data.current as DragData | undefined
    const o = over.data.current as DragData | undefined

    if (a?.type === 'day' && o?.type === 'day') {
      const from = guide.days.findIndex((d) => d.id === active.id)
      const to = guide.days.findIndex((d) => d.id === over.id)
      if (from >= 0 && to >= 0 && from !== to) moveDay(guide.id, from, to)
    } else if (a?.type === 'item' && o?.type === 'item' && a.dayNumber === o.dayNumber) {
      const day = guide.days.find((d) => d.dayNumber === a.dayNumber)
      if (day) {
        const from = day.items.findIndex((i) => i.id === active.id)
        const to = day.items.findIndex((i) => i.id === over.id)
        if (from >= 0 && to >= 0 && from !== to) reorderItem(guide.id, day.dayNumber, from, to)
      }
    }
  }

  const inferCity = (dayNumber: number): string => {
    const day = guide.days.find((d) => d.dayNumber === dayNumber)
    const routeLast = (day?.route || '').split(/[→\s/]+/).filter(Boolean).pop()
    if (routeLast && lookupCity(routeLast)) return routeLast
    const destLast = guide.destination.split(/[→\s/]+/).filter(Boolean).pop()
    return destLast || ''
  }

  const openForm = (dayNumber: number, type: ItemType) => {
    setForm({ dayNumber, type })
    setSheetDay(null)
    setContent('')
    setNote('')
    setTransportEmoji('🚞')
    setStruct({ no: '', from: '', fromTime: '', toTime: '', to: '' })
  }

  const openEditForm = (dayNumber: number, item: Item) => {
    setForm({ dayNumber, type: item.type, itemId: item.id })
    setSheetDay(null)
    setContent(item.content || '')
    setNote(item.note || '')
    setTransportEmoji(item.metadata?.transportEmoji || '🚞')
    const s = item.metadata?.struct ?? parseStructuredContent(item.content || '')
    setStruct({
      no: s?.no || '',
      from: s?.from || '',
      fromTime: s?.fromTime || '',
      toTime: s?.toTime || '',
      to: s?.to || '',
    })
  }

  const submitForm = () => {
    if (!form) return
    let finalContent = content.trim()
    let structMeta: Item['metadata']['struct'] = undefined
    if (structuredMode) {
      // 火车/飞机：按字段顺序拼成一行「车次 出发站 发车时刻 – 到达时刻 到达站」
      const { no, from, fromTime, toTime, to } = struct
      if (![no, from, fromTime, toTime, to].every((v) => v.trim() !== '')) return
      finalContent = `${no.trim()} ${from.trim()} ${fromTime.trim()} – ${toTime.trim()} ${to.trim()}`
      structMeta = {
        no: no.trim(),
        from: from.trim(),
        fromTime: fromTime.trim(),
        toTime: toTime.trim(),
        to: to.trim(),
      }
    }
    if (!finalContent) return
    const metadata: Item['metadata'] =
      form.type === 'transport'
        ? { transportEmoji, ...(structMeta ? { struct: structMeta } : {}) }
        : { city: inferCity(form.dayNumber) }
    const patch = {
      content: finalContent,
      note: note.trim() || undefined,
      metadata,
    }

    if (form.itemId) {
      // 二次编辑：更新已有条目
      updateItem(guide.id, form.dayNumber, form.itemId, patch)
      if (form.type === 'location') {
        const day = guide.days.find((d) => d.dayNumber === form.dayNumber)
        const old = day?.items.find((i) => i.id === form.itemId)
        if (old && old.content !== finalContent) {
          removeLocationByName(old.content, inferCity(form.dayNumber))
        }
        upsertLocation({ name: finalContent, city: inferCity(form.dayNumber) })
      }
    } else {
      addItem(guide.id, form.dayNumber, { type: form.type, ...patch })
      if (form.type === 'location') {
        upsertLocation({ name: finalContent, city: inferCity(form.dayNumber) })
      }
    }
    setForm(null)
  }

  const handleShare = async () => {
    if (!shareRef.current) return
    setExporting(true)
    try {
      await exportNodeToPng(shareRef.current, `${guide.title}-旅行足迹.png`)
    } catch (err) {
      console.error('分享图导出失败', err)
      window.alert('分享图导出失败，请重试。')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Page>
      <InfoBar guide={guide} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={dayIds} strategy={verticalListSortingStrategy}>
          {guide.days.map((day) => (
            <DayBlock
              key={day.id}
              day={day}
              collapsed={collapsed.has(day.dayNumber)}
              onToggleCollapse={() => toggleCollapse(day.dayNumber)}
              onAddItem={() => setSheetDay(day.dayNumber)}
              onDeleteDay={() => handleDeleteDay(day.dayNumber)}
              onEditRoute={(route) => updateDay(guide.id, day.dayNumber, { route })}
              onEditItem={(item) => openEditForm(day.dayNumber, item)}
              onDeleteItem={(item) => setDeleteItem({ dayNumber: day.dayNumber, item })}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button className="btn-ghost" style={{ width: '100%', padding: 12, borderRadius: 14, marginTop: 4 }} onClick={() => addDay(guide.id)}>
        ＋ 添加一天
      </button>

      <button className="share-btn" onClick={handleShare} disabled={exporting}>
        {exporting ? '⏳ 生成中…' : '📤 生成分享图'}
      </button>

      {/* 添加条目 · 类型选择 */}
      <BottomSheet
        open={sheetDay !== null}
        title="添加条目"
        onClose={() => setSheetDay(null)}
      >
        <div className="sheet-grid">
          {(Object.keys(TYPE_LABEL) as ItemType[]).map((type) => (
            <button key={type} onClick={() => sheetDay != null && openForm(sheetDay, type)}>
              <span className="e">{TYPE_ICON[type]}</span>
              {TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* 添加条目 · 内容表单 */}
      {form && (
        <div className="modal-mask" onClick={() => setForm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {form.type === 'transport' ? transportEmoji : TYPE_ICON[form.type]}{' '}
              {TYPE_LABEL[form.type]}
            </h3>
            {form.type === 'transport' && (
              <div className="field">
                <label>交通方式</label>
                <div className="transport-grid">
                  {TRANSPORTS.map((t) => (
                    <button
                      key={t.emoji}
                      type="button"
                      className={transportEmoji === t.emoji ? 'selected' : ''}
                      onClick={() => setTransportEmoji(t.emoji)}
                      aria-label={t.label}
                    >
                      {t.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {structuredMode ? (
              <>
                {STRUCTURED_FIELDS[structuredMode].map((f, i) => (
                  <div className="field" key={f.key}>
                    <label>{f.label}</label>
                    <input
                      autoFocus={i === 0}
                      value={struct[f.key]}
                      onChange={(e) => setStruct((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="field">
                <label>
                  {form.type === 'hotel'
                    ? '酒店名'
                    : form.type === 'food'
                      ? '餐厅 / 小吃'
                      : form.type === 'location'
                        ? '景点名称'
                        : '描述'}
                </label>
                <input autoFocus value={content} onChange={(e) => setContent(e.target.value)} />
              </div>
            )}

            <div className="field">
              <label>备注（可选）</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={structuredMode ? '可填写座位号' : undefined}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setForm(null)}>
                取消
              </button>
              <button className="btn-primary" onClick={submitForm} disabled={!canSubmit}>
                {form.itemId ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除某天确认 */}
      {deleteDay !== null && (
        <div className="modal-mask" onClick={() => setDeleteDay(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>删除这一天？</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
              第 {deleteDay} 天及当天所有条目都会被删除，无法撤销。
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setDeleteDay(null)}>
                取消
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--c-ticket)' }}
                onClick={() => {
                  removeDay(guide.id, deleteDay)
                  setDeleteDay(null)
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除某条条目确认 */}
      {deleteItem !== null && (
        <div className="modal-mask" onClick={() => setDeleteItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>删除这条条目？</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
              「{deleteItem.item.content}」删除后无法撤销。
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setDeleteItem(null)}>
                取消
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--c-ticket)' }}
                onClick={() => {
                  removeItem(guide.id, deleteItem.dayNumber, deleteItem.item.id)
                  setDeleteItem(null)
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分享图隐藏渲染区 */}
      <div className="share-render" aria-hidden>
        <ShareImage ref={shareRef} guide={guide} />
      </div>
    </Page>
  )
}
