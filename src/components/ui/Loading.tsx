/** 首屏加载动画（PRD §9.1：飞机飞过，≤2s） */
export default function Loading() {
  return (
    <div className="loading-screen" role="status" aria-label="加载中">
      <div className="plane">✈️</div>
      <div className="track">
        <span />
      </div>
    </div>
  )
}
