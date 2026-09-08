// ============================================================
// 金额 / 日期 / 星期 / 百分比格式化（开发计划 Step 1）
// ============================================================
import type { Day } from '../types'
import { genId } from './id'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/** 'YYYY-MM-DD' → Date（按本地时区解析，避免 UTC 偏移） */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Date → 'YYYY-MM-DD' */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 'YYYY-MM-DD' 加 n 天 */
export function addDays(dateStr: string, n: number): string {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

/** 起止日期之间的天数（含首尾） */
export function daysBetween(start: string, end: string): number {
  const ms = parseDate(end).getTime() - parseDate(start).getTime()
  return Math.round(ms / 86400000) + 1
}

/** 由起止日期生成 Day[]（日期、星期由系统自动生成） */
export function buildDays(start: string, end: string): Day[] {
  const n = daysBetween(start, end)
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(start, i)
    return { id: genId(), dayNumber: i + 1, date, items: [] }
  })
}

/** '7月6日（周一）' */
export function formatDateCn(dateStr: string): string {
  const d = parseDate(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`
}

/** '07.06' */
export function formatShortDate(dateStr: string): string {
  const d = parseDate(dateStr)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/** '2026.07.06' */
export function formatFullDate(dateStr: string): string {
  const d = parseDate(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/** '周一' */
export function weekdayCn(dateStr: string): string {
  return WEEKDAYS[parseDate(dateStr).getDay()]
}

/** 金额 '¥8,420' */
export function formatMoney(n: number): string {
  return '¥' + Math.round(n).toLocaleString('en-US')
}

/** 金额（紧凑）'¥8.4k' / '¥1.2w' */
export function formatMoneyCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 10000) return '¥' + trimZero((n / 10000).toFixed(1)) + 'w'
  if (abs >= 1000) return '¥' + trimZero((n / 1000).toFixed(1)) + 'k'
  return formatMoney(n)
}

/** 百分比 '84%' */
export function formatPercent(ratio: number): string {
  return Math.round(ratio * 100) + '%'
}

function trimZero(s: string): string {
  return s.replace(/\.0$/, '')
}
