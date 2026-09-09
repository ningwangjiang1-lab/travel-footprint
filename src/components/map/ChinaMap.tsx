import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { provinceStats } from '../../lib/regions'
import { lightColor } from '../../lib/mapColor'

let geoPromise: Promise<any> | null = null
function loadChinaGeo(): Promise<any> {
  if (!geoPromise) {
    geoPromise = fetch('/geo/china.json').then((r) => r.json())
  }
  return geoPromise
}

function buildOption(lit: Set<string>): any {
  const stats = provinceStats(lit)
  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'map',
        map: 'china',
        roam: true,
        scaleLimit: { min: 0.6, max: 8 },
        zoom: 1.12,
        label: { show: false },
        itemStyle: {
          areaColor: '#EBE0CB',
          borderColor: '#FFFFFF',
          borderWidth: 1,
        },
        emphasis: { disabled: true },
        data: stats.map((s) => ({
          name: s.name,
          itemStyle: { areaColor: lightColor(s.ratio) },
        })),
      },
    ],
  }
}

interface ChinaMapProps {
  lit: Set<string>
}

/** 足迹地图：可缩放的中国地图，按省份点亮比例着色 */
export default function ChinaMap({ lit }: ChinaMapProps) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const geo = await loadChinaGeo()
      if (cancelled || !ref.current) return
      // 过滤掉无名 feature（南海诸岛/九段线），仅保留 34 个省级行政区
      const clean = {
        ...geo,
        features: (geo.features || []).filter((f: any) => f.properties && f.properties.name),
      }
      echarts.registerMap('china', clean)
      if (!chartRef.current) chartRef.current = echarts.init(ref.current)
      chartRef.current.setOption(buildOption(lit), true)
    })()
    return () => {
      cancelled = true
    }
  }, [lit])

  useEffect(
    () => () => {
      chartRef.current?.dispose()
      chartRef.current = null
    },
    [],
  )

  return <div ref={ref} className="china-map" />
}
