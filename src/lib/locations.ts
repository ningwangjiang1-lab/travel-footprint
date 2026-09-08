// ============================================================
// 地点聚合统计（开发计划 Step 6）
// ============================================================
import type { Location } from '../types'

export interface LocationStats {
  countries: number
  cities: number
  locations: number
}

/** 统计：X 国 / Y 城 / Z 地点（按唯一值去重） */
export function aggregateLocations(locations: Location[]): LocationStats {
  const countries = new Set(locations.map((l) => l.country).filter(Boolean))
  const cities = new Set(locations.map((l) => l.city).filter(Boolean))
  return {
    countries: countries.size,
    cities: cities.size,
    locations: locations.length,
  }
}

/** 按城市分组（用于城市筛选 chips 与地图聚合） */
export function groupByCity(locations: Location[]): Map<string, Location[]> {
  const map = new Map<string, Location[]>()
  for (const loc of locations) {
    const key = loc.city || '未知'
    const arr = map.get(key) || []
    arr.push(loc)
    map.set(key, arr)
  }
  return map
}

/** 城市列表（去重，按 visitCount 降序） */
export function uniqueCities(locations: Location[]): string[] {
  return [...groupByCity(locations).keys()]
}

/** 城市名集合（用于地图灰点去重） */
export function citySet(locations: Location[]): Set<string> {
  return new Set(locations.map((l) => l.city))
}
