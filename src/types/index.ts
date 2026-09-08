// ============================================================
// 领域类型（PRD §7 / 开发计划 Step 1）
// ============================================================

/** 条目类型：交通 / 景点 / 美食 / 住宿 */
export type ItemType = 'transport' | 'location' | 'food' | 'hotel'

/** 账单分类（固定顺序，见 UI 规范 §3.3） */
export type ExpenseCategory =
  | 'transport'
  | 'hotel'
  | 'food'
  | 'ticket'
  | 'shop'
  | 'entertainment'
  | 'other'

export type GuideStatus = 'planning' | 'traveling' | 'completed'

/** 条目元数据：车次 / 站名 / 交通方式 / 景点坐标等 */
export interface ItemMetadata {
  /** 交通方式 emoji，如 🚞 🚇 🚌 🚗 🚕 🚶🏻‍♂️ 🚲 */
  transportEmoji?: string
  /** 交通方式细分标识 */
  transportMode?: 'train' | 'metro' | 'bus' | 'car' | 'taxi' | 'walk' | 'bike'
  /** 车次 / 线路号 */
  trainNo?: string
  /** 出发地 / 站 */
  from?: string
  /** 到达地 / 站 */
  to?: string
  /** 出发时间 */
  fromTime?: string
  /** 到达时间 */
  toTime?: string
  /** 景点关联城市（用于地图点亮） */
  city?: string
  /** 景点经纬度（地图点亮） */
  lat?: number
  lng?: number
  /** 住宿分店 / 位置 */
  branch?: string
}

/** 行程条目（多态） */
export interface Item {
  id: string
  type: ItemType
  /** 正文（名称 / 描述） */
  content: string
  /** 备注（次要说明，12px --ink-2） */
  note?: string
  order: number
  checked?: boolean
  metadata: ItemMetadata
}

/** 每日行程 */
export interface Day {
  /** 稳定身份（拖拽排序 / React key） */
  id: string
  dayNumber: number
  /** ISO 日期 'YYYY-MM-DD' */
  date: string
  /** 路线标签，如「郑州 → 兰州」或「兰州」 */
  route?: string
  items: Item[]
}

/** 攻略 */
export interface Guide {
  id: string
  title: string
  /** 封面 emoji / 图片 URL（可选） */
  coverImage?: string
  destination: string
  /** ISO 日期 'YYYY-MM-DD' */
  startDate: string
  /** ISO 日期 'YYYY-MM-DD' */
  endDate: string
  companions: string[]
  status: GuideStatus
  days: Day[]
  totalBudget?: number
  createdAt: string
}

/** 地点（地图点亮聚合） */
export interface Location {
  id: string
  name: string
  lat: number
  lng: number
  country: string
  city: string
  visitCount: number
  /** ISO 日期，首次打卡 */
  firstVisitDate: string
}

/** 账单 */
export interface Expense {
  id: string
  guideId: string
  amount: number
  currency: string
  category: ExpenseCategory
  note: string
  /** ISO 日期 'YYYY-MM-DD' */
  date: string
  locationId?: string
}
