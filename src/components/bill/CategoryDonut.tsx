import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { Expense } from '../../types'
import { aggregateExpense, CATEGORY_COLOR, CATEGORY_LABEL } from '../../lib/expense'
import { formatMoney, formatPercent } from '../../lib/format'

/** 分类环形图 + 图例（UI 规范 §7.8，Recharts 实现） */
export default function CategoryDonut({ expenses }: { expenses: Expense[] }) {
  const { total, byCategory } = aggregateExpense(expenses)
  const data = byCategory.filter((c) => c.amount > 0)

  return (
    <div className="donut-wrap">
      <div className="donut" role="img" aria-label={`分类支出，总支出 ${formatMoney(total)}`}>
        {data.length === 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '12px solid var(--line)',
            }}
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                innerRadius="68%"
                outerRadius="100%"
                paddingAngle={1}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((c) => (
                  <Cell key={c.category} fill={CATEGORY_COLOR[c.category]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="center">
          <b>{formatMoney(total)}</b>
          <span>总支出</span>
        </div>
      </div>

      <div className="legend">
        {byCategory.map((c) => (
          <div className="li" key={c.category}>
            <span className="sw" style={{ background: CATEGORY_COLOR[c.category] }} />
            <span className="nm">{CATEGORY_LABEL[c.category]}</span>
            <span className="amt">{formatMoney(c.amount)}</span>
            <span className="pct">{formatPercent(c.percent)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
