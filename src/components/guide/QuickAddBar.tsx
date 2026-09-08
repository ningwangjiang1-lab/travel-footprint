/** 天块底部快捷插入条（UI 规范 §7.3 虚线快捷插入） */
export default function QuickAddBar({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="quickbar">
      <button onClick={onAdd}>＋ 添加条目</button>
    </div>
  )
}
