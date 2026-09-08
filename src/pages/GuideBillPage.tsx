import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Page from '../components/layout/Page'
import KpiCard from '../components/ui/KpiCard'
import EmptyState from '../components/ui/EmptyState'
import DatePicker from '../components/ui/DatePicker'
import CategoryDonut from '../components/bill/CategoryDonut'
import TrendChart from '../components/bill/TrendChart'
import BillRow from '../components/bill/BillRow'
import Filters from '../components/bill/Filters'
import { useStore } from '../store/useStore'
import { aggregateExpense, CATEGORY_META } from '../lib/expense'
import { formatMoney, toISODate } from '../lib/format'
import type { ExpenseCategory } from '../types'

/** 单个攻略的账单页：记账优先，汇总与可视化放最下面 */
export default function GuideBillPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const guide = useStore((s) => s.guides.find((g) => g.id === id))
  const expenses = useStore((s) => s.expenses)
  const addExpense = useStore((s) => s.addExpense)
  const removeExpense = useStore((s) => s.removeExpense)

  const guideExpenses = useMemo(
    () => expenses.filter((e) => e.guideId === guide?.id),
    [expenses, guide?.id],
  )

  const [filter, setFilter] = useState('all')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('transport')
  const [note, setNote] = useState('')
  // 默认日期：上一次记账使用的日期，否则回到行程第一天
  const [date, setDate] = useState<string>(
    () => guideExpenses[0]?.date || guide?.startDate || toISODate(new Date()),
  )

  // 切换攻略时重置日期，避免沿用上一个攻略的日期
  useEffect(() => {
    setDate(guideExpenses[0]?.date || guide?.startDate || toISODate(new Date()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide?.id])

  if (!guide) {
    return (
      <Page>
        <EmptyState
          emoji="💳"
          title="攻略不存在"
          desc="这份攻略可能已被删除。"
          action={
            <button className="btn-primary" onClick={() => navigate('/')}>
              返回首页
            </button>
          }
        />
      </Page>
    )
  }

  const filtered = filter === 'all' ? guideExpenses : guideExpenses.filter((e) => e.category === filter)
  const days = guide.days.length
  const summary = aggregateExpense(guideExpenses, { days })

  const saveExpense = () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return
    addExpense({
      guideId: guide.id,
      amount: amt,
      currency: 'CNY',
      category,
      note: note.trim(),
      date,
    })
    setAmount('')
    setNote('')
  }

  return (
    <Page>
      <h1 className="page-head">{guide.title}</h1>
      <p className="page-sub">记录这趟旅程的每一笔花费。</p>

      {/* 1. 记账优先 */}
      <div className="chart-card" style={{ marginTop: 14 }}>
        <h4 style={{ marginBottom: 10 }}>记一笔</h4>
        <div className="field-row">
          <div className="field" style={{ flex: 1.4 }}>
            <label>金额（元）</label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="field">
            <label>分类</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
              {CATEGORY_META.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>日期</label>
          <DatePicker value={date} onChange={setDate} min={guide.startDate} max={guide.endDate} />
        </div>
        <div className="field">
          <label>备注</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button
          className="btn-primary"
          style={{ width: '100%', padding: 11 }}
          onClick={saveExpense}
          disabled={!amount.trim()}
        >
          ＋ 保存这笔
        </button>
      </div>

      {/* 2. 账单明细 */}
      <div className="section-title">账单明细</div>
      <div className="bill-table">
        <Filters active={filter} onSelect={setFilter} />
        {filtered.length === 0 ? (
          <div className="empty-day">暂无支出记录。</div>
        ) : (
          filtered.map((e) => (
            <BillRow key={e.id} expense={e} onDelete={() => removeExpense(e.id)} />
          ))
        )}
      </div>

      {/* 3. 汇总 + 可视化（放最下面） */}
      <div className="section-title">汇总</div>
      <div className="bill-top" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <KpiCard label="总支出" value={formatMoney(summary.total)} />
        <KpiCard label="日均" value={formatMoney(summary.dailyAverage)} />
      </div>

      <div className="chart-card">
        <h4>分类支出</h4>
        <CategoryDonut expenses={guideExpenses} />
      </div>

      <div className="chart-card">
        <h4>每日支出趋势</h4>
        <TrendChart expenses={guideExpenses} />
      </div>
    </Page>
  )
}
