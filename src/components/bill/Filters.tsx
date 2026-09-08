import Chip from '../ui/Chip'
import { CATEGORY_META } from '../../lib/expense'

interface FiltersProps {
  active: string
  onSelect: (key: string) => void
}

/** 账单分类筛选 chips（UI 规范 §7.6） */
export default function Filters({ active, onSelect }: FiltersProps) {
  return (
    <div className="filters">
      <Chip active={active === 'all'} onClick={() => onSelect('all')}>
        全部
      </Chip>
      {CATEGORY_META.map((c) => (
        <Chip key={c.key} active={active === c.key} onClick={() => onSelect(c.key)}>
          {c.label}
        </Chip>
      ))}
    </div>
  )
}
