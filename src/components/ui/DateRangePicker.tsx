import { useState, type CSSProperties } from 'react'
import { parseDate, toISODate, formatDateCn, daysBetween } from '../../lib/format'

interface DateRangePickerProps {
  start: string
  end: string
  onChange: (start: string, end: string) => void
}

const WEEK = ['一', '二', '三', '四', '五', '六', '日']

// 统一取设计 Token，暗色模式自动适配
const C = {
  brown: 'var(--brown)',
  orange: 'var(--orange)',
  cream: 'var(--cream)',
  line: 'var(--line)',
  ink: 'var(--ink)',
  ink2: 'var(--ink-2)',
  ink3: 'var(--ink-3)',
  ring: 'var(--ring)',
}

/** 起止日期选择器：出发 / 结束分开选择，支持未来日期 */
export default function DateRangePicker({ start, end, onChange }: DateRangePickerProps) {
  const [active, setActive] = useState<'start' | 'end'>('start')
  const [view, setView] = useState(() => {
    const d = parseDate(start)
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const today = toISODate(new Date())
  const totalDays = daysBetween(start, end)

  const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7 // 周一 = 0
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()

  const inRange = (d: string) => d >= start && d <= end

  const goTo = (date: string) => {
    const d = parseDate(date)
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  const pickField = (which: 'start' | 'end') => {
    setActive(which)
    goTo(which === 'start' ? start : end)
  }

  const handleDay = (date: string) => {
    if (active === 'start') {
      // 选出发：若晚于结束，则结束随动为同一天
      onChange(date, date > end ? date : end)
    } else {
      // 选结束：若早于出发，则出发随动为同一天
      onChange(date < start ? date : start, date)
    }
  }

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

  const fieldCard = (which: 'start' | 'end'): CSSProperties => {
    const on = active === which
    const accent = which === 'start' ? C.brown : C.orange
    return {
      flex: 1,
      textAlign: 'left',
      padding: '10px 12px',
      borderRadius: 12,
      cursor: 'pointer',
      background: on ? C.ring : C.cream,
      border: `1px solid ${on ? accent : C.line}`,
    }
  }

  const dayBtn = (d: string): CSSProperties => {
    const isS = d === start
    const isE = d === end && d !== start
    const selected = isS || isE
    return {
      width: '100%',
      height: 38,
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: selected ? 700 : 400,
      color: selected ? '#fff' : C.ink,
      background: isS ? C.brown : isE ? C.orange : inRange(d) ? C.ring : 'transparent',
      boxShadow: d === today && !selected ? `inset 0 0 0 1px ${C.brown}` : 'none',
    }
  }

  return (
    <div>
      {/* 出发 / 结束两个独立字段 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button type="button" style={fieldCard('start')} onClick={() => pickField('start')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.brown }} />
            <span style={{ fontSize: 11, color: C.ink2 }}>出发日期</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginTop: 4 }}>
            {formatDateCn(start)}
          </div>
        </button>
        <button type="button" style={fieldCard('end')} onClick={() => pickField('end')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.orange }} />
            <span style={{ fontSize: 11, color: C.ink2 }}>结束日期</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginTop: 4 }}>
            {formatDateCn(end)}
          </div>
        </button>
      </div>

      <div style={{ fontSize: 11, color: C.ink2, textAlign: 'center', marginBottom: 10 }}>
        正在选择{active === 'start' ? '出发日期' : '结束日期'} · 共 {totalDays} 天
      </div>

      {/* 月份导航 */}
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

      {/* 星期表头 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
        {WEEK.map((w) => (
          <div key={w} style={{ textAlign: 'center', fontSize: 11, color: C.ink3, padding: '4px 0' }}>
            {w}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map((d, i) =>
          d ? (
            <button key={d} type="button" style={dayBtn(d)} onClick={() => handleDay(d)}>
              {parseDate(d).getDate()}
            </button>
          ) : (
            <div key={i} />
          ),
        )}
      </div>
    </div>
  )
}
