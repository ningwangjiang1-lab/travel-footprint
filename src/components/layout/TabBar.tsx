import { useLocation, useNavigate } from 'react-router-dom'

interface TabDef {
  key: string
  icon: string
  label: string
  to: string
  match: (path: string) => boolean
}

/** 底部导航（UI 规范 §7.2）：旅行攻略 / 点亮地图 */
export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs: TabDef[] = [
    { key: 'home', icon: '🧭', label: '旅行攻略', to: '/', match: (p) => p === '/' },
    { key: 'map', icon: '🗺️', label: '点亮地图', to: '/map', match: (p) => p.startsWith('/map') },
  ]

  return (
    <nav className="tabbar">
      {tabs.map((t) => {
        const active = t.match(location.pathname)
        return (
          <button
            key={t.key}
            className={`tab${active ? ' active' : ''}`}
            onClick={() => navigate(t.to)}
            aria-label={t.label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="ti">{t.icon}</span>
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
