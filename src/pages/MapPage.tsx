import { useState } from 'react'
import Page from '../components/layout/Page'
import EmptyState from '../components/ui/EmptyState'
import MapStats from '../components/map/MapStats'
import MapView from '../components/map/MapView'
import CityChips from '../components/map/CityChips'
import { useStore } from '../store/useStore'
import { aggregateLocations, groupByCity } from '../lib/locations'

/** 地图页（开发计划 Step 6）：点亮 + 统计 + 筛选 + 暗色星空 */
export default function MapPage() {
  const locations = useStore((s) => s.locations)
  const [activeCity, setActiveCity] = useState('all')

  const stats = aggregateLocations(locations)
  const cities = [...groupByCity(locations).keys()]

  const shownGroups =
    activeCity === 'all'
      ? [...groupByCity(locations).entries()]
      : [...groupByCity(locations).entries()].filter(([city]) => city === activeCity)

  if (locations.length === 0) {
    return (
      <Page>
        <h1 className="page-head">我的足迹地图</h1>
        <p className="page-sub">每点亮一座城，就是一次抵达。</p>
        <EmptyState
          emoji="🗺️"
          title="还没有点亮任何地点"
          desc="在编辑页添加「景点」条目后，这里会自动点亮对应的城市。"
        />
      </Page>
    )
  }

  return (
    <Page>
      <h1 className="page-head">我的足迹地图</h1>
      <p className="page-sub">每点亮一座城，就是一次抵达。</p>

      <MapStats stats={stats} />
      <MapView locations={locations} activeCity={activeCity} />
      <CityChips cities={cities} active={activeCity} onSelect={setActiveCity} />

      <div className="bill-table" style={{ marginTop: 6 }}>
        {shownGroups.map(([city, locs]) => (
          <div className="row" key={city}>
            <span className="cat" style={{ background: 'var(--c-ticket)' }}>
              {city}
            </span>
            <span className="note">{locs.map((l) => l.name).join(' · ')}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{locs.length} 处</span>
          </div>
        ))}
      </div>
    </Page>
  )
}
