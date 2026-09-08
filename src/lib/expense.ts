// ============================================================
// 账单聚合统计（开发计划 Step 7）
// ============================================================
import type { Expense, ExpenseCategory } from '../types'

/** 分类元信息：固定顺序（UI 规范 §3.3），颜色跟随实体而非排名 */
export const CATEGORY_META: Array<{
  key: ExpenseCategory
  label: string
  color: string
  emoji: string
}> = [
  { key: 'transport', label: '交通', color: 'var(--c-transport)', emoji: '🚞' },
  { key: 'hotel', label: '住宿', color: 'var(--c-hotel)', emoji: '🏨' },
  { key: 'food', label: '餐饮', color: 'var(--c-food)', emoji: '🍜' },
  { key: 'ticket', label: '门票', color: 'var(--c-ticket)', emoji: '🎫' },
  { key: 'shop', label: '购物', color: 'var(--c-shop)', emoji: '🛍️' },
  { key: 'entertainment', label: '娱乐', color: 'var(--c-entertainment)', emoji: '🎢' },
  { key: 'other', label: '其他', color: 'var(--c-other)', emoji: '📦' },
]

export const CATEGORY_LABEL: Record<ExpenseCategory, string> = CATEGORY_META.reduce(
  (acc, c) => {
    acc[c.key] = c.label
    return acc
  },
  {} as Record<ExpenseCategory, string>,
)

export const CATEGORY_COLOR: Record<ExpenseCategory, string> = CATEGORY_META.reduce(
  (acc, c) => {
    acc[c.key] = c.color
    return acc
  },
  {} as Record<ExpenseCategory, string>,
)

export interface CategoryTotal {
  category: ExpenseCategory
  amount: number
  percent: number
}

export interface ExpenseSummary {
  total: number
  byCategory: CategoryTotal[]
  dailyAverage: number
  perPerson: number
}

/** 按分类聚合（返回完整 6 类，含金额为 0 的项，保证图例/颜色固定顺序） */
export function aggregateExpense(
  expenses: Expense[],
  opts?: { days?: number; persons?: number },
): ExpenseSummary {
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  // 保持类别固定顺序（UI 规范 §3.3：颜色/顺序跟随实体而非排名）
  const byCategory: CategoryTotal[] = CATEGORY_META.map((c) => {
    const amount = expenses
      .filter((e) => e.category === c.key)
      .reduce((s, e) => s + e.amount, 0)
    return {
      category: c.key,
      amount,
      percent: total > 0 ? amount / total : 0,
    }
  })

  const days = opts?.days || 0
  const persons = opts?.persons || 0
  return {
    total,
    byCategory,
    dailyAverage: days > 0 ? total / days : 0,
    perPerson: persons > 0 ? total / persons : 0,
  }
}

/** 预算进度（0~1） */
export function budgetProgress(expenses: Expense[], budget?: number): number {
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  if (!budget || budget <= 0) return 0
  return Math.min(total / budget, 1)
}

export interface TrendPoint {
  date: string
  total: number
}

/** 每日支出趋势（按日期升序） */
export function dailyTrend(expenses: Expense[]): TrendPoint[] {
  const map = new Map<string, number>()
  for (const e of expenses) {
    map.set(e.date, (map.get(e.date) || 0) + e.amount)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, total]) => ({ date, total }))
}
