import type { Expense } from '../../types'
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../../lib/expense'
import { formatMoney } from '../../lib/format'
import Badge from '../ui/Badge'

interface BillRowProps {
  expense: Expense
  onDelete?: () => void
}

/** 账单明细行（UI 规范 §7.6/7.4） */
export default function BillRow({ expense, onDelete }: BillRowProps) {
  return (
    <div className="row">
      <Badge color={CATEGORY_COLOR[expense.category]}>
        {CATEGORY_LABEL[expense.category]}
      </Badge>
      <span className="note">{expense.note || '未备注'}</span>
      {onDelete && (
        <button className="row-del" onClick={onDelete} aria-label="删除这笔支出">
          ✕
        </button>
      )}
      <span className="amt">{formatMoney(expense.amount)}</span>
    </div>
  )
}
