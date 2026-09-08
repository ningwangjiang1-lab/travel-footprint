import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { toISODate } from '../../lib/format'
import DateRangePicker from '../ui/DateRangePicker'

/** 新建攻略弹窗（开发计划 Step 3）：标题 + 起止日期（无需目的地） */
export default function NewGuideModal() {
  const open = useUi((s) => s.newGuideOpen)
  const close = useUi((s) => s.closeNewGuide)
  const addGuide = useStore((s) => s.addGuide)
  const navigate = useNavigate()

  const today = toISODate(new Date())
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)

  if (!open) return null

  const save = () => {
    if (!title.trim()) return
    const start = startDate || today
    const end = endDate && endDate >= start ? endDate : start
    const guide = addGuide({
      title: title.trim(),
      destination: '',
      startDate: start,
      endDate: end,
    })
    setTitle('')
    setStartDate(today)
    setEndDate(today)
    close()
    navigate(`/guide/${guide.id}`)
  }

  return (
    <div className="modal-mask" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>新建攻略</h3>

        <div className="field">
          <label>标题</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：西北丝路自由行"
          />
        </div>

        <div className="field">
          <label>旅行日期</label>
          <DateRangePicker
            start={startDate}
            end={endDate}
            onChange={(s, e) => {
              setStartDate(s)
              setEndDate(e)
            }}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={close}>
            取消
          </button>
          <button className="btn-primary" onClick={save} disabled={!title.trim()}>
            创建攻略
          </button>
        </div>
      </div>
    </div>
  )
}
