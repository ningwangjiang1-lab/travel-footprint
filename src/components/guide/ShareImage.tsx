import { forwardRef } from 'react'
import type { Guide, Item } from '../../types'
import { formatDateCn, formatFullDate, daysBetween } from '../../lib/format'
import { toRoman } from '../../lib/seq'

function itemIcon(item: Item): string {
  if (item.type === 'transport') return item.metadata?.transportEmoji || '🚞'
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
  const days = daysBetween(guide.startDate, guide.endDate)
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
      {/* 顶部：标题 + 日期（天数），普通背景，无图标 */}
      <div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{guide.title}</div>
        <div style={{ fontSize: 12, color: '#8A7A68', marginTop: 6 }}>
          {formatFullDate(guide.startDate)} – {formatFullDate(guide.endDate)}（{days}天）
        </div>
      </div>

      {/* 时间轴摘要 */}
      <div style={{ marginTop: 18 }}>
        {guide.days.map((day) => {
          let locSeq = 0
          const subSeq = new Map<string, number>()
          const seqInfo = new Map<string, { seq?: number; roman?: number }>()
          for (const item of day.items) {
            if (item.type === 'location' && !item.parentId) {
              locSeq += 1
              seqInfo.set(item.id, { seq: locSeq })
            } else if (item.type === 'location' && item.parentId) {
              const n = (subSeq.get(item.parentId) || 0) + 1
              subSeq.set(item.parentId, n)
              seqInfo.set(item.id, { roman: n })
            }
          }
          return (
            <div key={day.id} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {formatDateCn(day.date)}
                {day.route ? ` ｜ ${day.route}` : ''}
              </div>
              <div style={{ marginTop: 5 }}>
                {day.items.map((item) => {
                  const info = seqInfo.get(item.id)
                  const isSub = !!item.parentId
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: 8,
                        fontSize: 12,
                        color: '#8A7A68',
                        padding: '2px 0',
                        paddingLeft: isSub ? 24 : 0,
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          flexShrink: 0,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {isSub ? (
                          <span
                            style={{
                              lineHeight: 1.5,
                              fontWeight: 700,
                              color: '#C4643F',
                            }}
                          >
                            {toRoman(info?.roman ?? 0)}
                          </span>
                        ) : item.type === 'location' ? (
                          <span
                            style={{
                              width: 13,
                              height: 13,
                              marginTop: 2,
                              borderRadius: '50%',
                              border: '1px solid #C4643F',
                              color: '#C4643F',
                              fontSize: 9,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: 1,
                              transform: 'translate(-1px, 1px)',
                            }}
                          >
                            <span style={{ transform: 'translateX(0.5px)' }}>
                              {info?.seq ?? 0}
                            </span>
                          </span>
                        ) : (
                          <span style={{ lineHeight: 1.5 }}>{itemIcon(item)}</span>
                        )}
                      </span>
                      <span style={{ lineHeight: 1.5 }}>
                        {item.content}
                        {item.note ? `（${item.note}）` : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
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
        旅行足迹 · 记录每一段旅程
      </div>
    </div>
  )
})

ShareImage.displayName = 'ShareImage'

export default ShareImage
