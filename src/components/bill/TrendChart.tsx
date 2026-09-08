import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Expense } from '../../types'
import { dailyTrend } from '../../lib/expense'
import { formatMoney, formatShortDate } from '../../lib/format'

/** 每日支出趋势折线/面积图（UI 规范 §7.8，Recharts 实现） */
export default function TrendChart({ expenses }: { expenses: Expense[] }) {
  const data = dailyTrend(expenses).map((d) => ({
    date: formatShortDate(d.date),
    total: d.total,
  }))

  return (
    <div className="trend" role="img" aria-label="每日支出趋势折线图">
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E88D4B" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#E88D4B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9.5, fill: 'var(--ink-3)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9.5, fill: 'var(--ink-3)' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value: number) => [formatMoney(value), '支出']}
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              fontSize: 12,
              color: 'var(--ink)',
            }}
            labelStyle={{ color: 'var(--ink-2)' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#E88D4B"
            strokeWidth={2.5}
            fill="url(#trendArea)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
