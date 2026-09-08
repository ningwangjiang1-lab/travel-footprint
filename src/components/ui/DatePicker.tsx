import { useState, type CSSProperties } from 'react'
import { parseDate, toISODate, formatDateCn } from '../../lib/format'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  /** 可选日期下限（含），ISO 日期 */
  min?: string
  /** 可选日期上限（含），ISO 日期 */
  max?: string
}

const WEEK = ['一', '二', '三', '四', '五', '六', '日']

// 统一取设计 Token，暗色模式自动适配
const C = {
  brown: 'var(--brown)',
  cream: 'var(--cream)',
  card: 'var(--card)',
  line: 'var(--line)',
  ink: 'var(--ink)',
  ink2: 'var(--ink-2)',
  ink3: 'var(--ink-3)',
}

/** 单日选择器：日历样式与新建攻略的日期选择保持一致 */
export default function DatePicker({ value, onChange, min, max }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const d = parseDate(value)
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const today = toISODate(new Date())
  // 是否在可选范围内（ISO 日期字符串字典序即时间序）
  const inRange = (d: string) => (!min || d >= min) && (!max || d <= max)
  const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7 // 周一 = 0
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()

  const shiftMonth = (delta: number) => {
    let m = view.m + delta
    let y = view.y
    if (m < 0) {
      m = 11
      y -= 1
    }
    if (m > 11) {
      m = 0
      y += 1
    }
    setView({ y, m })
  }

  const cells: Array<string | null> = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISODate(new Date(view.y, view.m, d)))
  while (cells.length % 7 !== 0) cells.push(null)

  const fieldBtn: CSSProperties = {
    width: '100%',
    background: C.cream,
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    color: C.ink,
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const navBtn: CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 9,
    border: `1px solid ${C.line}`,
    background: C.cream,
    color: C.ink2,
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  }

  const dayBtn = (d: string): CSSProperties => {
    const selected = d === value
    const disabled = !inRange(d)
    return {
      width: '100%',
      height: 36,
      borderRadius: 10,
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 13,
      fontWeight: selected ? 700 : 400,
      color: selected ? '#fff' : disabled ? C.ink3 : C.ink,
      background: selected ? C.brown : 'transparent',
      opacity: disabled ? 0.4 : 1,
      boxShadow: d === today && !selected && !disabled ? `inset 0 0 0 1px ${C.brown}` : 'none',
    }
  }

  return (
    <div>
      <button type="button" style={fieldBtn} onClick={() => setOpen((o) => !o)}>
        <span>📅 {formatDateCn(value)}</span>
        <span style={{ color: C.ink3, fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 14,
            background: C.card,
            border: `1px solid ${C.line}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button type="button" onClick={() => shiftMonth(-1)} style={navBtn} aria-label="上个月">
              ‹
            </button>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
              {view.y} 年 {view.m + 1} 月
            </span>
            <button type="button" onClick={() => shiftMonth(1)} style={navBtn} aria-label="下个月">
              ›
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
            {WEEK.map((w) => (
              <div key={w} style={{ textAlign: 'center', fontSize: 11, color: C.ink3, padding: '4px 0' }}>
                {w}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {cells.map((d, i) =>
              d ? (
                <button
                  key={d}
                  type="button"
                  style={dayBtn(d)}
                  disabled={!inRange(d)}
                  onClick={() => {
                    onChange(d)
                    setOpen(false)
                  }}
                >
                  {parseDate(d).getDate()}
                </button>
              ) : (
                <div key={i} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}
