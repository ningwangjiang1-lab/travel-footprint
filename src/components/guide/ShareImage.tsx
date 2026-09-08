import { forwardRef } from 'react'
import type { Guide, Item } from '../../types'
import { formatDateCn, formatFullDate } from '../../lib/format'

function itemIcon(item: Item): string {
  if (item.type === 'transport') return item.metadata?.transportEmoji || '🚞'
  if (item.type === 'location') return '📍'
  if (item.type === 'food') return '🍜'
  return '🏨'
}

interface ShareImageProps {
  guide: Guide
}

/**
 * 分享图渲染区（开发计划 Step 8）。
 * 使用固定暖色值（分享海报始终为亮色），隐藏于屏幕外，
 * 由 lib/share.ts 的 html-to-image 导出为 PNG。
 */
const ShareImage = forwardRef<HTMLDivElement, ShareImageProps>(({ guide }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: 390,
        background: '#F7F2EA',
        color: '#3A2C1F',
        padding: 20,
        fontFamily: 'system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      {/* 封面 */}
      <div
        style={{
          background: 'linear-gradient(135deg,#E88D4B,#8B5E3C)',
          borderRadius: 18,
          padding: 22,
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 40, lineHeight: 1 }}>{guide.coverImage || '🏔️'}</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 12 }}>{guide.title}</div>
        <div style={{ fontSize: 12, opacity: 0.92, marginTop: 6 }}>
          {formatFullDate(guide.startDate)} – {formatFullDate(guide.endDate)}
          {guide.destination ? ` · ${guide.destination}` : ''}
        </div>
      </div>

      {/* 时间轴摘要 */}
      <div style={{ marginTop: 18 }}>
        {guide.days.map((day) => (
          <div key={day.id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {formatDateCn(day.date)}
              {day.route ? ` ｜ ${day.route}` : ''}
            </div>
            <div style={{ marginTop: 5 }}>
              {day.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 8,
                    fontSize: 12,
                    color: '#8A7A68',
                    padding: '2px 0',
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ flexShrink: 0 }}>{itemIcon(item)}</span>
                  <span>
                    {item.checked ? '✓ ' : ''}
                    {item.content}
                    {item.note ? `（${item.note}）` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          fontSize: 11,
          color: '#B4A893',
          textAlign: 'center',
          letterSpacing: 1,
        }}
      >
        旅行足迹 · 我的旅行手账
      </div>
    </div>
  )
})

ShareImage.displayName = 'ShareImage'

export default ShareImage
