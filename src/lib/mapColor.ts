// ============================================================
// 足迹地图省级着色色带（点亮比例越高颜色越深）
// ============================================================

export function lightColor(ratio: number): string {
  if (ratio <= 0) return '#EBE0CB'
  if (ratio < 0.25) return '#E2C39A'
  if (ratio < 0.5) return '#D0A06C'
  if (ratio < 0.75) return '#B1794A'
  if (ratio < 1) return '#8C5730'
  return '#6B3E1E'
}
