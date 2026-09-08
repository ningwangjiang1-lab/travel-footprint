import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import EditorPage from './pages/EditorPage'
import GuideBillPage from './pages/GuideBillPage'

/** 路由（开发计划 Step 2）：旅行攻略 / 点亮地图 / 攻略详情 / 攻略账单 */
export default function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/guide/:id/bill" element={<GuideBillPage />} />
        <Route path="/guide/:id" element={<EditorPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </AnimatePresence>
  )
}
