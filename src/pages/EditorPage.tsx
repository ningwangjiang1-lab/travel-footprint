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
import type { ItemType } from '../types'

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

const TRANSPORT_EMOJIS = ['🚞', '🚇', '🚌', '🚗', '🚕', '🚶🏻‍♂️', '🚲']

const FIELD_PLACEHOLDER: Record<ItemType, string> = {
  transport: '如：Z105 郑州站 01:27 – 14:57 兰州站',
  location: '如：中山桥',
  food: '如：马子禄牛肉面',
  hotel: '如：兰州宜佳酒店',
}

interface ItemFormState {
  dayNumber: number
  type: ItemType
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
    toggleItemChecked,
    addItem,
    moveDay,
    reorderItem,
    upsertLocation,
  } = useStore.getState()
  const openNewGuide = useUi((s) => s.openNewGuide)

  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [sheetDay, setSheetDay] = useState<number | null>(null)
  const [form, setForm] = useState<ItemFormState | null>(null)
  const [deleteDay, setDeleteDay] = useState<number | null>(null)

  // 条目表单字段
  const [content, setContent] = useState('')
  const [note, setNote] = useState('')
  const [transportEmoji, setTransportEmoji] = useState('🚞')

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
  }

  const submitForm = () => {
    if (!form || !content.trim()) return
    const metadata =
      form.type === 'transport' ? { transportEmoji } : { city: inferCity(form.dayNumber) }
    addItem(guide.id, form.dayNumber, {
      type: form.type,
      content: content.trim(),
      note: note.trim() || undefined,
      metadata,
    })
    if (form.type === 'location') {
      upsertLocation({ name: content.trim(), city: inferCity(form.dayNumber) })
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
              onToggleCheck={(itemId) => toggleItemChecked(guide.id, day.dayNumber, itemId)}
              onAddItem={() => setSheetDay(day.dayNumber)}
              onDeleteDay={() => handleDeleteDay(day.dayNumber)}
              onEditRoute={(route) => updateDay(guide.id, day.dayNumber, { route })}
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
              <span className="e">
                {type === 'transport' ? '🚞' : type === 'location' ? '📍' : type === 'food' ? '🍜' : '🏨'}
              </span>
              {TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* 添加条目 · 内容表单 */}
      {form && (
        <div className="modal-mask" onClick={() => setForm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>添加{TYPE_LABEL[form.type]}</h3>
            {form.type === 'transport' && (
              <div className="field">
                <label>交通方式</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TRANSPORT_EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setTransportEmoji(em)}
                      style={{
                        width: 34,
                        height: 34,
                        fontSize: 18,
                        borderRadius: 9,
                        border: transportEmoji === em ? '2px solid var(--brown)' : '1px solid var(--line)',
                        background: 'var(--cream)',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="field">
              <label>{form.type === 'hotel' ? '酒店名' : form.type === 'food' ? '餐厅 / 小吃' : form.type === 'location' ? '景点名称' : '描述'}</label>
              <input
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={FIELD_PLACEHOLDER[form.type]}
              />
            </div>
            <div className="field">
              <label>备注（可选）</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="费用、说明等" />
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setForm(null)}>
                取消
              </button>
              <button className="btn-primary" onClick={submitForm} disabled={!content.trim()}>
                添加
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

      {/* 分享图隐藏渲染区 */}
      <div className="share-render" aria-hidden>
        <ShareImage ref={shareRef} guide={guide} />
      </div>
    </Page>
  )
}
