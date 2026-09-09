import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PROVINCES } from '../lib/regions'

/** 城市选择页：左侧省份，右侧该省地级行政区，点选/取消，确认后回到地图 */
export default function SelectCitiesPage() {
  const navigate = useNavigate()
  const litCities = useStore((s) => s.litCities)
  const setLitCities = useStore((s) => s.setLitCities)

  const [selected, setSelected] = useState<Set<string>>(() => new Set(litCities))
  const [activeName, setActiveName] = useState<string>(PROVINCES[0].name)
  const [confirmReset, setConfirmReset] = useState(false)

  const activeProvince = PROVINCES.find((p) => p.name === activeName) || PROVINCES[0]

  const toggle = (city: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(city)) next.delete(city)
      else next.add(city)
      return next
    })
  }

  const confirm = () => {
    setLitCities([...selected])
    navigate('/map')
  }

  return (
    <div className="select-page">
      <div className="select-head">
        <button className="select-back" onClick={() => navigate('/map')} aria-label="返回">
          ←
        </button>
        <span className="select-title">点亮地图</span>
      </div>

      <div className="select-body">
        <div className="province-col">
          {PROVINCES.map((p) => (
            <button
              key={p.name}
              className={`province-item${p.name === activeName ? ' active' : ''}`}
              onClick={() => setActiveName(p.name)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="city-col">
          <div className="city-col-head">
            <span className="label">
              {activeProvince.name} · {activeProvince.cities.length} 城
            </span>
            <button className="city-reset" onClick={() => setConfirmReset(true)}>
              重置
            </button>
          </div>

          <div className="city-list">
            {activeProvince.cities.map((city) => {
              const on = selected.has(city)
              return (
                <button
                  key={city}
                  className={`city-item${on ? ' on' : ''}`}
                  onClick={() => toggle(city)}
                >
                  {city}
                </button>
              )
            })}
          </div>

          <div className="city-col-foot">
            <button className="btn-primary" style={{ width: '100%', padding: 11 }} onClick={confirm}>
              确认点亮（{selected.size}）
            </button>
          </div>
        </div>
      </div>

      {confirmReset && (
        <div className="modal-mask" onClick={() => setConfirmReset(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>清空所有已点亮城市？</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
              将取消当前选中的全部城市（{selected.size} 个），此操作无法撤销。
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmReset(false)}>
                取消
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--c-ticket)' }}
                onClick={() => {
                  setSelected(new Set())
                  setConfirmReset(false)
                }}
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
