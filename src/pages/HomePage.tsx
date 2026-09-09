import { useState } from 'react'
import Page from '../components/layout/Page'
import KpiCard from '../components/ui/KpiCard'
import EmptyState from '../components/ui/EmptyState'
import GuideCard from '../components/guide/GuideCard'
import { useStore } from '../store/useStore'
import { useUi } from '../store/useUi'
import { daysBetween } from '../lib/format'
import type { Guide } from '../types'

/** 首页（开发计划 Step 3）：KPI 概览 + 攻略列表 + 空状态 */
export default function HomePage() {
  const guides = useStore((s) => s.guides)
  const removeGuide = useStore((s) => s.removeGuide)
  const updateGuide = useStore((s) => s.updateGuide)
  const litCities = useStore((s) => s.litCities)
  const openNewGuide = useUi((s) => s.openNewGuide)

  const [confirmDelete, setConfirmDelete] = useState<Guide | null>(null)

  const cityCount = litCities.length
  // 旅行次数 / 旅行天数：仅统计已完成的旅程
  const completedGuides = guides.filter((g) => g.status === 'completed')
  const tripCount = completedGuides.length
  const totalDays = completedGuides.reduce((s, g) => s + daysBetween(g.startDate, g.endDate), 0)

  // 按出发时间从新到旧排列：越新的攻略越靠上，越早的越靠下
  const sortedGuides = [...guides].sort((a, b) =>
    (b.startDate || '').localeCompare(a.startDate || ''),
  )

  return (
    <Page>
      <div className="kpi-row">
        <KpiCard label="点亮城市" value={cityCount} />
        <KpiCard label="旅行次数" value={tripCount} />
        <KpiCard label="旅行天数" value={totalDays} />
      </div>

      <div className="section-title">我的攻略</div>

      {guides.length === 0 ? (
        <EmptyState
          emoji="🧭"
          title="你的下一段冒险，从这里开始"
          desc="创建你的第一份旅行攻略，规划行程、记录足迹、点亮地图。"
          action={
            <button className="btn-primary" onClick={openNewGuide}>
              ＋ 新建攻略
            </button>
          }
        />
      ) : (
        <>
          {sortedGuides.map((g) => (
            <GuideCard
              key={g.id}
              guide={g}
              onDelete={() => setConfirmDelete(g)}
              onToggleComplete={() =>
                updateGuide(g.id, {
                  status: g.status === 'completed' ? 'planning' : 'completed',
                })
              }
            />
          ))}
          <button
            className="btn-ghost"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 14,
              marginTop: 8,
              border: '2px solid var(--brown)',
              color: 'var(--brown)',
              fontWeight: 700,
              fontSize: 15,
            }}
            onClick={openNewGuide}
          >
            ＋ 新建攻略
          </button>
        </>
      )}

      {/* 删除攻略确认 */}
      {confirmDelete && (
        <div className="modal-mask" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>删除这份攻略？</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
              「{confirmDelete.title}」及其所有行程、账单都会被删除，无法撤销。
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>
                取消
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--c-ticket)' }}
                onClick={() => {
                  removeGuide(confirmDelete.id)
                  setConfirmDelete(null)
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
