import type { LocationStats } from '../../lib/locations'

/** 地图统计卡（UI 规范 §7.4：X 国 / Y 城 / Z 地点） */
export default function MapStats({ stats }: { stats: LocationStats }) {
  return (
    <div className="map-stats">
      <div className="cell">
        <b>{stats.countries}</b>
        <span>个国家</span>
      </div>
      <div className="cell">
        <b>{stats.cities}</b>
        <span>个城市</span>
      </div>
      <div className="cell">
        <b>{stats.locations}</b>
        <span>个地点</span>
      </div>
    </div>
  )
}
