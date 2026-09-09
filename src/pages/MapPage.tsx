import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Page from '../components/layout/Page'
import ChinaMap from '../components/map/ChinaMap'
import MapShareImage from '../components/map/MapShareImage'
import { useStore } from '../store/useStore'
import { provinceStats } from '../lib/regions'
import { exportNodeToPng } from '../lib/share'

/** 足迹地图页：中国地图按省份点亮比例着色，右下角入口进入城市选择 */
export default function MapPage() {
  const navigate = useNavigate()
  const litCities = useStore((s) => s.litCities)
  const litSet = useMemo(() => new Set(litCities), [litCities])
  const litProvinces = provinceStats(litSet).filter((s) => s.lit > 0).length

  const shareRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const handleShare = async () => {
    if (!shareRef.current) return
    setExporting(true)
    try {
      await exportNodeToPng(shareRef.current, '旅行足迹-足迹地图.png')
    } catch (err) {
      console.error('分享图导出失败', err)
      window.alert('分享图导出失败，请重试。')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Page>
      <h1 className="page-head">足迹地图</h1>
      <p className="page-sub">点亮你走过的每一座城</p>

      <div className="map-stats">
        <div className="cell">
          <b>{litProvinces}</b>
          <span>已点亮省份</span>
        </div>
        <div className="cell">
          <b>{litCities.length}</b>
          <span>已点亮城市</span>
        </div>
      </div>

      <div className="map-wrap">
        <ChinaMap lit={litSet} />
        <button className="map-fab" onClick={() => navigate('/map/select')}>
          点亮地图
        </button>
      </div>

      <button className="share-btn" onClick={handleShare} disabled={exporting}>
        {exporting ? '⏳ 生成中…' : '📤 生成分享图'}
      </button>

      {/* 分享图隐藏渲染区 */}
      <div className="share-render" aria-hidden>
        <MapShareImage ref={shareRef} litCities={litCities} />
      </div>
    </Page>
  )
}
