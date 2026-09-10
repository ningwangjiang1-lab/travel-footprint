// ============================================================
// 数据备份 / 恢复（纯前端本地方案）
// 导出为 JSON 文件，导入时校验并覆盖本地数据
// ============================================================
import type { Guide, Expense, Location } from '../types'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

export interface BackupData {
  app: string
  version: number
  exportedAt: string
  guides: Guide[]
  expenses: Expense[]
  locations: Location[]
  litCities: string[]
}

const APP_ID = '旅行足迹'
const VERSION = 1

/** 需要校验的四个核心字段 */
const REQUIRED_FIELDS = ['guides', 'expenses', 'locations', 'litCities'] as const

export function buildBackup(data: {
  guides: Guide[]
  expenses: Expense[]
  locations: Location[]
  litCities: string[]
}): BackupData {
  return {
    app: APP_ID,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    guides: data.guides,
    expenses: data.expenses,
    locations: data.locations,
    litCities: data.litCities,
  }
}

/** 导出备份 JSON 文件：浏览器触发下载，App 内写入缓存并唤起系统分享 */
export async function downloadBackup(data: BackupData): Promise<void> {
  const json = JSON.stringify(data, null, 2)
  const date = new Date().toISOString().slice(0, 10)
  const filename = `旅行足迹-备份-${date}.json`

  if (Capacitor.isNativePlatform()) {
    // App 内：写入缓存文件，唤起系统分享面板（可存文件 / 发送给他人）
    const base64 = btoa(unescape(encodeURIComponent(json)))
    const written = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    })
    try {
      await Share.share({
        title: '旅行足迹备份',
        text: '我的旅行足迹数据备份',
        url: written.uri,
        dialogTitle: '导出备份',
      })
    } catch {
      // 用户取消分享，静默处理
    }
  } else {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
}

/** 解析并校验备份 JSON 字符串，不合法时抛错 */
export function parseBackup(json: string): BackupData {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('文件不是有效的 JSON')
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('文件内容不是有效的备份数据')
  }
  const r = raw as Record<string, unknown>
  const missing = REQUIRED_FIELDS.filter((k) => !Array.isArray(r[k]))
  if (missing.length > 0) {
    throw new Error(`缺少字段：${missing.join('、')}，该文件可能不是「旅行足迹」的备份`)
  }
  return {
    app: APP_ID,
    version: typeof r.version === 'number' ? r.version : 1,
    exportedAt: typeof r.exportedAt === 'string' ? r.exportedAt : '',
    guides: r.guides as Guide[],
    expenses: r.expenses as Expense[],
    locations: r.locations as Location[],
    litCities: r.litCities as string[],
  }
}

/** 读取用户选择的备份文件 */
export function readBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(parseBackup(String(reader.result)))
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file, 'utf-8')
  })
}
