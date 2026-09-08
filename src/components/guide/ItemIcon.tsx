import type { ItemType } from '../../types'

const DEFAULT_EMOJI: Record<ItemType, string> = {
  transport: '🚞',
  location: '📍',
  food: '🍜',
  hotel: '🏨',
}

/** 条目图标容器（UI 规范 §7.11：30×30 圆角 9，底色按类型） */
export default function ItemIcon({ type, emoji }: { type: ItemType; emoji?: string }) {
  return <span className={`ic ${type}`}>{emoji || DEFAULT_EMOJI[type]}</span>
}
