// ============================================================
// 预设城市坐标字典（开发计划 Step 6：v1 用预设城市坐标点亮地图）
// ============================================================

export interface CityCoord {
  lat: number
  lng: number
  country: string
}

/** 常见城市坐标（中国为主，供地图点亮定位） */
export const CITY_DICT: Record<string, CityCoord> = {
  郑州: { lat: 34.75, lng: 113.62, country: '中国' },
  兰州: { lat: 36.06, lng: 103.83, country: '中国' },
  武威: { lat: 37.93, lng: 102.64, country: '中国' },
  张掖: { lat: 38.93, lng: 100.45, country: '中国' },
  嘉峪关: { lat: 39.77, lng: 98.29, country: '中国' },
  敦煌: { lat: 40.14, lng: 94.66, country: '中国' },
  西安: { lat: 34.34, lng: 108.94, country: '中国' },
  成都: { lat: 30.57, lng: 104.07, country: '中国' },
  乌鲁木齐: { lat: 43.83, lng: 87.62, country: '中国' },
  拉萨: { lat: 29.65, lng: 91.14, country: '中国' },
  三亚: { lat: 18.25, lng: 109.51, country: '中国' },
  北京: { lat: 39.9, lng: 116.41, country: '中国' },
  上海: { lat: 31.23, lng: 121.47, country: '中国' },
  广州: { lat: 23.13, lng: 113.26, country: '中国' },
  杭州: { lat: 30.27, lng: 120.16, country: '中国' },
  苏州: { lat: 31.3, lng: 120.58, country: '中国' },
  南京: { lat: 32.06, lng: 118.8, country: '中国' },
  青岛: { lat: 36.07, lng: 120.38, country: '中国' },
  重庆: { lat: 29.56, lng: 106.55, country: '中国' },
  武汉: { lat: 30.59, lng: 114.31, country: '中国' },
  长沙: { lat: 28.23, lng: 112.94, country: '中国' },
  昆明: { lat: 24.88, lng: 102.83, country: '中国' },
  大理: { lat: 25.61, lng: 100.27, country: '中国' },
  丽江: { lat: 26.86, lng: 100.23, country: '中国' },
  哈尔滨: { lat: 45.8, lng: 126.53, country: '中国' },
  沈阳: { lat: 41.8, lng: 123.43, country: '中国' },
  天津: { lat: 39.13, lng: 117.2, country: '中国' },
  香港: { lat: 22.32, lng: 114.17, country: '中国' },
  澳门: { lat: 22.2, lng: 113.55, country: '中国' },
  台北: { lat: 25.03, lng: 121.56, country: '中国' },
  东京: { lat: 35.68, lng: 139.69, country: '日本' },
  大阪: { lat: 34.69, lng: 135.5, country: '日本' },
  首尔: { lat: 37.57, lng: 126.98, country: '韩国' },
  曼谷: { lat: 13.76, lng: 100.5, country: '泰国' },
  新加坡: { lat: 1.35, lng: 103.82, country: '新加坡' },
  巴黎: { lat: 48.86, lng: 2.35, country: '法国' },
  伦敦: { lat: 51.51, lng: -0.13, country: '英国' },
  纽约: { lat: 40.71, lng: -74.01, country: '美国' },
  悉尼: { lat: -33.87, lng: 151.21, country: '澳大利亚' },
}

/** 未点亮参考城市（地图上以灰点展示，营造「待解锁」氛围） */
export const UNVISITED_CITIES: Array<{ name: string; coord: CityCoord }> = [
  { name: '成都', coord: CITY_DICT['成都'] },
  { name: '乌鲁木齐', coord: CITY_DICT['乌鲁木齐'] },
  { name: '拉萨', coord: CITY_DICT['拉萨'] },
  { name: '三亚', coord: CITY_DICT['三亚'] },
  { name: '北京', coord: CITY_DICT['北京'] },
  { name: '上海', coord: CITY_DICT['上海'] },
]

/** 按城市名查坐标（支持模糊：去除「市」等后缀） */
export function lookupCity(name: string): CityCoord | undefined {
  const key = name.trim()
  return CITY_DICT[key] || CITY_DICT[key.replace(/市$/, '')] || CITY_DICT[key.replace(/省$/, '')]
}
