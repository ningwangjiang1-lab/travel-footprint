// ============================================================
// 攻略统计辅助（地点数 / 完成进度）
// ============================================================
import type { Guide, Item } from '../types'

/** 攻略内的所有条目（扁平化） */
export function flatItems(guide: Guide): Item[] {
  return guide.days.flatMap((d) => d.items)
}

/** 景点（location）条目数（不含小景点） */
export function countLocations(guide: Guide): number {
  return flatItems(guide).filter((i) => i.type === 'location' && !i.parentId).length
}

/** 可打卡条目数（景点 + 美食；小景点不单独打卡） */
function checkableItems(guide: Guide): Item[] {
  return flatItems(guide).filter(
    (i) => (i.type === 'location' || i.type === 'food') && !i.parentId,
  )
}

/** 完成进度 0~1（已打卡 / 可打卡条目数） */
export function guideProgress(guide: Guide): number {
  const items = checkableItems(guide)
  if (items.length === 0) return 0
  const done = items.filter((i) => i.checked).length
  return done / items.length
}

/** 旅行天数（按 days 数组，或起止日期推算） */
export function guideTotalDays(guide: Guide): number {
  return guide.days.length
}
