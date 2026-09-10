import { forwardRef, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { provinceStats } from '../../lib/regions'
import { lightColor } from '../../lib/mapColor'

let geoPromise: Promise<any> | null = null
function loadChinaGeo(): Promise<any> {
  if (!geoPromise) {
    geoPromise = fetch(`${import.meta.env.BASE_URL}geo/china.json`).then((r) => r.json())
  }
  return geoPromise
}

interface MapShareImageProps {
  litCities: string[]
}

/**
 * 足迹地图分享图渲染区：标题 + 静态中国地图（SVG）+ 底部标语，
 * 隐藏于屏幕外，由 lib/share.ts 的 html-to-image 导出为 PNG。
 */
const MapShareImage = forwardRef<HTMLDivElement, MapShareImageProps>(({ litCities }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const litSet = new Set(litCities)
  const stats = provinceStats(litSet)
  const litProvinces = stats.filter((s) => s.lit > 0).length

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const geo = await loadChinaGeo()
      if (cancelled || !mapRef.current) return
      const clean = {
        ...geo,
        features: (geo.features || []).filter((f: any) => f.properties && f.properties.name),
      }
      echarts.registerMap('china', clean)
      const chart = echarts.init(mapRef.current, undefined, { renderer: 'svg' })
      chart.setOption({
        backgroundColor: 'transparent',
        series: [
          {
            type: 'map',
            map: 'china',
            roam: false,
            zoom: 1.12,
            label: { show: false },
            emphasis: { disabled: true },
            itemStyle: {
              areaColor: '#EBE0CB',
              borderColor: '#FFFFFF',
              borderWidth: 1,
            },
            data: stats.map((s) => ({
              name: s.name,
              itemStyle: { areaColor: lightColor(s.ratio) },
            })),
          },
        ],
      })
      return () => {
        chart.dispose()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [litCities])

  return (
    <div
      ref={ref}
      style={{
        width: 680,
        background: '#F7F2EA',
        color: '#3A2C1F',
        padding: 18,
        fontFamily: 'system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>我的足迹地图</div>
        <div style={{ fontSize: 13, color: '#8A7A68', marginTop: 6 }}>
          已点亮 {litCities.length} 座城市 · {litProvinces} 个省份
        </div>
      </div>

      <div ref={mapRef} style={{ width: '100%', height: 480, marginTop: 14 }} />

      <div
        style={{
          marginTop: 14,
          fontSize: 13,
          color: '#B4A893',
          textAlign: 'center',
          letterSpacing: 1,
        }}
      >
        旅行足迹 · 记录每一段旅程
      </div>
    </div>
  )
})

MapShareImage.displayName = 'MapShareImage'

export default MapShareImage
