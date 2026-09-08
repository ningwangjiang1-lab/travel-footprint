import { useLocation, useNavigate } from 'react-router-dom'
import { useUi } from '../../store/useUi'

/** App 顶栏：首页/地图显示品牌；攻略详情显示返回键 + 账单入口（UI 规范 §7.1） */
export default function AppBar() {
  const dark = useUi((s) => s.dark)
  const toggleDark = useUi((s) => s.toggleDark)
  const location = useLocation()
  const navigate = useNavigate()

  const m = location.pathname.match(/^\/guide\/([^/]+)(\/bill)?$/)
  const guideId = m?.[1]
  const isBill = m?.[2] === '/bill'
  const inGuide = Boolean(guideId)

  return (
    <div className="appbar">
      {inGuide ? (
        <button
          onClick={() => navigate(isBill ? `/guide/${guideId}` : '/')}
          aria-label="返回"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            border: '1px solid var(--line)',
            background: 'var(--card)',
            color: 'var(--ink)',
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          ‹
        </button>
      ) : (
        <div className="brand">
          <span className="dot" />
          旅行足迹
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {inGuide && !isBill && (
          <button
            onClick={() => navigate(`/guide/${guideId}/bill`)}
            aria-label="账单"
            style={{
              border: 'none',
              background: 'var(--orange)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              padding: '7px 12px',
              borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            💳 账单
          </button>
        )}
        <button
          className="theme-btn"
          onClick={toggleDark}
          aria-label={dark ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}
