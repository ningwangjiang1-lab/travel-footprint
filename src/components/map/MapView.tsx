import type { Location } from '../../types'
import { citySet } from '../../lib/locations'
import { UNVISITED_CITIES } from '../../lib/cities'
import MapPin from './MapPin'

// 中国及周边区域等距投影（让坐标在风格化面板上保持相对地理位置）
const BOUNDS = { minLng: 75, maxLng: 135, minLat: 18, maxLat: 55 }

function project(lat: number, lng: number): { x: number; y: number } {
  const x = (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)
  const y = (BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)
  return {
    x: Math.max(0.05, Math.min(0.95, x)),
    y: Math.max(0.06, Math.min(0.94, y)),
  }
}

interface MapViewProps {
  locations: Location[]
  activeCity: string
}

/**
 * 旅行地图（开发计划 Step 6）。
 * 采用风格化面板 + 自定义投影（离线友好、忠实还原 demo 视觉），
 * 暗色模式由 CSS（body.dark）自动切换为深蓝星空。
 */
export default function MapView({ locations, activeCity }: MapViewProps) {
  const filtered = activeCity === 'all' ? locations : locations.filter((l) => l.city === activeCity)
  const visitedCities = citySet(locations)
  const unvisited = UNVISITED_CITIES.filter((c) => !visitedCities.has(c.name))

  return (
    <div className="map-panel" role="img" aria-label="旅行足迹地图">
      {filtered.map((loc) => {
        const { x, y } = project(loc.lat, loc.lng)
        return <MapPin key={loc.id} name={loc.name} lit left={x * 100} top={y * 100} />
      })}
      {unvisited.map((c) => {
        const { x, y } = project(c.coord.lat, c.coord.lng)
        return <MapPin key={c.name} name={c.name} lit={false} left={x * 100} top={y * 100} />
      })}
      <div className="map-legend">
        <span>● 已点亮</span>
        <span>○ 未点亮</span>
      </div>
    </div>
  )
}
