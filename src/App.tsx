import { useEffect, useState } from 'react'
import StatusBar from './components/layout/StatusBar'
import AppBar from './components/layout/AppBar'
import TabBar from './components/layout/TabBar'
import Loading from './components/ui/Loading'
import ErrorBoundary from './components/ui/ErrorBoundary'
import NewGuideModal from './components/guide/NewGuideModal'
import AppRoutes from './router'
import { useUi, applyTheme } from './store/useUi'

export default function App() {
  const dark = useUi((s) => s.dark)
  const [loading, setLoading] = useState(true)

  // 暗色模式：同步 body.dark class
  useEffect(() => {
    applyTheme(dark)
  }, [dark])

  // 首屏 Loading（PRD §9.1：≤2s）
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="stage">
      <div className="phone">
        <StatusBar />
        <AppBar />
        <div className="screen">
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </div>
        <TabBar />
        <NewGuideModal />
        {loading && <Loading />}
      </div>
    </div>
  )
}
