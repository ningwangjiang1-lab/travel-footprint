// ============================================================
// Zustand 全局状态 + LocalStorage 持久化（开发计划 Step 1）
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Day,
  Expense,
  Guide,
  Item,
  Location,
} from '../types'
import { genId } from '../lib/id'
import { addDays, buildDays } from '../lib/format'
import { lookupCity } from '../lib/cities'

const STORAGE_KEY = 'travel-footprint-v1'

export interface NewGuideInput {
  title: string
  destination: string
  startDate: string
  endDate: string
  companions?: string[]
  totalBudget?: number
  coverImage?: string
}

interface StoreState {
  guides: Guide[]
  expenses: Expense[]
  locations: Location[]

  // Guide
  addGuide: (input: NewGuideInput) => Guide
  updateGuide: (id: string, patch: Partial<Guide>) => void
  removeGuide: (id: string) => void

  // Day
  addDay: (guideId: string) => void
  updateDay: (guideId: string, dayNumber: number, patch: Partial<Day>) => void
  removeDay: (guideId: string, dayNumber: number) => void
  moveDay: (guideId: string, from: number, to: number) => void

  // Item
  addItem: (
    guideId: string,
    dayNumber: number,
    input: { type: Item['type']; content: string; note?: string; metadata?: Item['metadata'] },
  ) => void
  updateItem: (
    guideId: string,
    dayNumber: number,
    itemId: string,
    patch: Partial<Item>,
  ) => void
  removeItem: (guideId: string, dayNumber: number, itemId: string) => void
  reorderItem: (guideId: string, dayNumber: number, from: number, to: number) => void
  toggleItemChecked: (guideId: string, dayNumber: number, itemId: string) => void

  // Expense
  addExpense: (input: Omit<Expense, 'id'>) => void
  removeExpense: (id: string) => void

  // Location
  upsertLocation: (input: {
    name: string
    city?: string
    lat?: number
    lng?: number
    country?: string
  }) => void
  removeLocationByName: (name: string, city?: string) => void

  // 示例数据（便于验证全站功能）
  seedDemo: () => void
}

/** 对单个攻略的 days 数组做不可变更新 */
function mapGuide(
  guides: Guide[],
  guideId: string,
  fn: (guide: Guide) => Guide,
): Guide[] {
  return guides.map((g) => (g.id === guideId ? fn(g) : g))
}

/** 对攻略内指定 day 做不可变更新 */
function mapDay(
  guide: Guide,
  dayNumber: number,
  fn: (day: Day) => Day,
): Guide {
  return {
    ...guide,
    days: guide.days.map((d) => (d.dayNumber === dayNumber ? fn(d) : d)),
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      guides: [],
      expenses: [],
      locations: [],

      addGuide: (input) => {
        const guide: Guide = {
          id: genId(),
          title: input.title.trim() || '未命名攻略',
          destination: input.destination.trim(),
          coverImage: input.coverImage,
          startDate: input.startDate,
          endDate: input.endDate,
          companions: input.companions || [],
          status: 'planning',
          days: buildDays(input.startDate, input.endDate),
          totalBudget: input.totalBudget,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ guides: [guide, ...s.guides] }))
        return guide
      },

      updateGuide: (id, patch) =>
        set((s) => ({
          guides: mapGuide(s.guides, id, (g) => ({ ...g, ...patch })),
        })),

      removeGuide: (id) =>
        set((s) => ({
          guides: s.guides.filter((g) => g.id !== id),
          expenses: s.expenses.filter((e) => e.guideId !== id),
        })),

      addDay: (guideId) =>
        set((s) => ({
          guides: mapGuide(s.guides, guideId, (g) => {
            const last = g.days[g.days.length - 1]
            const nextDate = last ? addDays(last.date, 1) : g.startDate
            return {
              ...g,
              endDate: nextDate,
              days: [
                ...g.days,
                { id: genId(), dayNumber: g.days.length + 1, date: nextDate, items: [] },
              ],
            }
          }),
        })),

      updateDay: (guideId, dayNumber, patch) =>
        set((s) => ({
          guides: mapGuide(s.guides, guideId, (g) =>
            mapDay(g, dayNumber, (d) => ({ ...d, ...patch })),
          ),
        })),

      removeDay: (guideId, dayNumber) =>
        set((s) => ({
          guides: mapGuide(s.guides, guideId, (g) => {
            const days = g.days
              .filter((d) => d.dayNumber !== dayNumber)
              .map((d, i) => ({ ...d, dayNumber: i + 1 }))
            const last = days[days.length - 1]
            return { ...g, days, endDate: last ? last.date : g.startDate }
          }),
        })),

      moveDay: (guideId, from, to) =>
        set((s) => ({
          guides: mapGuide(s.guides, guideId, (g) => {
            const days = [...g.days]
            const [moved] = days.splice(from, 1)
            days.splice(to, 0, moved)
            const renumbered = days.map((d, i) => ({ ...d, dayNumber: i + 1 }))
            // 重新按新顺序重算日期（统一本地时区工具，避免 UTC 偏移）
            const withDates = renumbered.map((d, i) => ({
              ...d,
              date: addDays(g.startDate, i),
            }))
            return {
              ...g,
              days: withDates,
              startDate: withDates[0]?.date || g.startDate,
              endDate: withDates[withDates.length - 1]?.date || g.startDate,
            }
          }),
        })),

      addItem: (guideId, dayNumber, input) =>
        set((s) => ({
          guides: mapGuide(s.guides, guideId, (g) =>
            mapDay(g, dayNumber, (d) => {
              const item: Item = {
                id: genId(),
                type: input.type,
                content: input.content.trim(),
                note: input.note?.trim() || undefined,
                order: d.items.length,
                metadata: input.metadata || {},
              }
              return { ...d, items: [...d.items, item] }
            }),
          ),
        })),

      updateItem: (guideId, dayNumber, itemId, patch) =>
        set((s) => ({
          guides: mapGuide(s.guides, guideId, (g) =>
            mapDay(g, dayNumber, (d) => ({
              ...d,
              items: d.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
            })),
          ),
        })),

      removeItem: (guideId, dayNumber, itemId) =>
        set((s) => ({
          guides: mapGuide(s.guides, guideId, (g) =>
            mapDay(g, dayNumber, (d) => ({
              ...d,
              items: d.items
                .filter((it) => it.id !== itemId)
                .map((it, i) => ({ ...it, order: i })),
            })),
          ),
        })),

      reorderItem: (guideId, dayNumber, from, to) =>
        set((s) => ({
          guides: mapGuide(s.guides, guideId, (g) =>
            mapDay(g, dayNumber, (d) => {
              const items = [...d.items]
              const [moved] = items.splice(from, 1)
              items.splice(to, 0, moved)
              return {
                ...d,
                items: items.map((it, i) => ({ ...it, order: i })),
              }
            }),
          ),
        })),

      toggleItemChecked: (guideId, dayNumber, itemId) =>
        set((s) => ({
          guides: mapGuide(s.guides, guideId, (g) =>
            mapDay(g, dayNumber, (d) => ({
              ...d,
              items: d.items.map((it) =>
                it.id === itemId ? { ...it, checked: !it.checked } : it,
              ),
            })),
          ),
        })),

      addExpense: (input) =>
        set((s) => ({
          expenses: [{ ...input, id: genId() }, ...s.expenses],
        })),

      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      upsertLocation: (input) => {
        const name = input.name.trim()
        if (!name) return
        set((s) => {
          const existing = s.locations.find(
            (l) => l.name === name && (!input.city || l.city === input.city),
          )
          if (existing) {
            return {
              locations: s.locations.map((l) =>
                l.id === existing.id ? { ...l, visitCount: l.visitCount + 1 } : l,
              ),
            }
          }
          const city = input.city || '未知'
          const coord = lookupCity(city) || {
            lat: input.lat,
            lng: input.lng,
            country: input.country || '中国',
          }
          if (coord.lat == null || coord.lng == null) {
            return {} // 无坐标，无法点亮，忽略
          }
          const loc: Location = {
            id: genId(),
            name,
            lat: coord.lat,
            lng: coord.lng,
            country: coord.country || '中国',
            city,
            visitCount: 1,
            firstVisitDate: new Date().toISOString().slice(0, 10),
          }
          return { locations: [...s.locations, loc] }
        })
      },

      removeLocationByName: (name, city) =>
        set((s) => ({
          locations: s.locations.filter(
            (l) => !(l.name === name && (!city || l.city === city)),
          ),
        })),

      seedDemo: () => {
        const gid = 'demo-guide'
        const guide: Guide = {
          id: gid,
          title: '西北丝路自由行',
          destination: '郑州 → 敦煌',
          coverImage: '🏔️',
          startDate: '2026-07-06',
          endDate: '2026-07-15',
          companions: ['和朋友', '2 人'],
          status: 'completed',
          totalBudget: 10000,
          createdAt: new Date().toISOString(),
          days: [
            {
              id: 'day-1',
              dayNumber: 1,
              date: '2026-07-06',
              route: '郑州 → 兰州',
              items: [
                { id: 'i1', type: 'transport', content: 'Z105 郑州站 01:27 – 14:57 兰州站', order: 0, metadata: { transportEmoji: '🚞', trainNo: 'Z105' } },
                { id: 'i2', type: 'transport', content: '乘地铁至酒店放行李', order: 1, metadata: { transportEmoji: '🚇' } },
                { id: 'i3', type: 'transport', content: '步行至张掖路步行街', order: 2, metadata: { transportEmoji: '🚶🏻‍♂️' } },
                { id: 'i4', type: 'location', content: '张掖路步行街', order: 3, checked: true, metadata: { city: '兰州' } },
                { id: 'i5', type: 'food', content: '马子禄牛肉面 · 茹记烤肉 · 马三洋芋片', note: '美食清单', order: 4, metadata: {} },
                { id: 'i6', type: 'transport', content: '步行至中山桥', order: 5, metadata: { transportEmoji: '🚶🏻‍♂️' } },
                { id: 'i7', type: 'location', content: '中山桥', order: 6, checked: true, metadata: { city: '兰州' } },
                { id: 'i8', type: 'location', content: '白塔山公园', order: 7, metadata: { city: '兰州' } },
                { id: 'i9', type: 'hotel', content: '兰州宜佳酒店', note: '张掖路西关地铁站店', order: 8, metadata: { branch: '张掖路西关地铁站店' } },
              ],
            },
            {
              id: 'day-2',
              dayNumber: 2,
              date: '2026-07-07',
              route: '兰州',
              items: [
                { id: 'i10', type: 'location', content: '甘肃省博物馆', order: 0, metadata: { city: '兰州' } },
                { id: 'i11', type: 'food', content: '正宁路夜市', order: 1, metadata: {} },
                { id: 'i12', type: 'hotel', content: '兰州宜佳酒店', note: '张掖路西关地铁站店', order: 2, metadata: {} },
              ],
            },
            {
              id: 'day-3',
              dayNumber: 3,
              date: '2026-07-08',
              route: '兰州 → 武威',
              items: [
                { id: 'i13', type: 'transport', content: '大巴 武威客运中心站 13:00 – 17:00 张掖汽车站', order: 0, metadata: { transportEmoji: '🚌' } },
                { id: 'i14', type: 'location', content: '雷台汉墓', order: 1, checked: true, metadata: { city: '武威' } },
                { id: 'i15', type: 'hotel', content: '武威宾馆', order: 2, metadata: {} },
              ],
            },
          ],
        }

        const locations: Location[] = [
          { id: 'L-lanzhou', name: '兰州', lat: 36.06, lng: 103.83, country: '中国', city: '兰州', visitCount: 3, firstVisitDate: '2026-07-06' },
          { id: 'L-wuwei', name: '武威', lat: 37.93, lng: 102.64, country: '中国', city: '武威', visitCount: 1, firstVisitDate: '2026-07-08' },
          { id: 'L-zhangye', name: '张掖', lat: 38.93, lng: 100.45, country: '中国', city: '张掖', visitCount: 1, firstVisitDate: '2026-07-09' },
          { id: 'L-jiayuguan', name: '嘉峪关', lat: 39.77, lng: 98.29, country: '中国', city: '嘉峪关', visitCount: 1, firstVisitDate: '2026-07-11' },
          { id: 'L-dunhuang', name: '敦煌', lat: 40.14, lng: 94.66, country: '中国', city: '敦煌', visitCount: 1, firstVisitDate: '2026-07-13' },
          { id: 'L-xian', name: '西安', lat: 34.34, lng: 108.94, country: '中国', city: '西安', visitCount: 1, firstVisitDate: '2025-11-08' },
        ]

        const expenses: Expense[] = [
          { id: 'e1', guideId: gid, amount: 1020, currency: 'CNY', category: 'transport', note: '高铁 Z105 郑州 – 兰州', date: '2026-07-06' },
          { id: 'e2', guideId: gid, amount: 560, currency: 'CNY', category: 'hotel', note: '兰州宜佳酒店 · 2 晚', date: '2026-07-06' },
          { id: 'e3', guideId: gid, amount: 160, currency: 'CNY', category: 'ticket', note: '七彩丹霞', date: '2026-07-09' },
          { id: 'e4', guideId: gid, amount: 86, currency: 'CNY', category: 'food', note: '马子禄牛肉面 · 牛肉小饭', date: '2026-07-07' },
          { id: 'e5', guideId: gid, amount: 280, currency: 'CNY', category: 'ticket', note: '莫高窟', date: '2026-07-13' },
          { id: 'e6', guideId: gid, amount: 2180, currency: 'CNY', category: 'transport', note: '往返大交通', date: '2026-07-06' },
          { id: 'e7', guideId: gid, amount: 1840, currency: 'CNY', category: 'hotel', note: '全程住宿', date: '2026-07-08' },
          { id: 'e8', guideId: gid, amount: 1414, currency: 'CNY', category: 'food', note: '餐饮合计', date: '2026-07-10' },
          { id: 'e9', guideId: gid, amount: 360, currency: 'CNY', category: 'ticket', note: '其他门票', date: '2026-07-12' },
          { id: 'e10', guideId: gid, amount: 320, currency: 'CNY', category: 'shop', note: '伴手礼', date: '2026-07-14' },
          { id: 'e11', guideId: gid, amount: 200, currency: 'CNY', category: 'other', note: '杂项', date: '2026-07-14' },
        ]

        set({ guides: [guide], expenses, locations })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        guides: s.guides,
        expenses: s.expenses,
        locations: s.locations,
      }),
    },
  ),
)

/** 便捷 selector：获取单个攻略 */
export function useGuide(id?: string): Guide | undefined {
  return useStore((s) => s.guides.find((g) => g.id === id))
}
