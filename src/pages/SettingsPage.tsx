import { useRef, useState } from 'react'
import Page from '../components/layout/Page'
import { useStore } from '../store/useStore'
import { buildBackup, downloadBackup, readBackupFile } from '../lib/backup'
import type { BackupData } from '../lib/backup'

/** 设置页：数据备份 / 恢复 / 清空（纯前端本地方案） */
export default function SettingsPage() {
  const guides = useStore((s) => s.guides)
  const expenses = useStore((s) => s.expenses)
  const locations = useStore((s) => s.locations)
  const litCities = useStore((s) => s.litCities)
  const importData = useStore((s) => s.importData)
  const clearAll = useStore((s) => s.clearAll)

  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const flash = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleExport = async () => {
    try {
      await downloadBackup(buildBackup({ guides, expenses, locations, litCities }))
      flash('ok', '备份文件已导出')
    } catch (e) {
      flash('err', e instanceof Error ? e.message : '导出失败')
    }
  }

  const handleFile = async (file: File) => {
    try {
      const data = await readBackupFile(file)
      setPendingImport(data)
    } catch (e) {
      flash('err', e instanceof Error ? e.message : '导入失败')
    } finally {
      // 允许重复选择同一文件
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const doImport = () => {
    if (!pendingImport) return
    importData({
      guides: pendingImport.guides,
      expenses: pendingImport.expenses,
      locations: pendingImport.locations,
      litCities: pendingImport.litCities,
    })
    setPendingImport(null)
    flash('ok', '导入成功，数据已恢复')
  }

  const doClear = () => {
    clearAll()
    setConfirmClear(false)
    flash('ok', '已清空全部数据')
  }

  return (
    <Page>
      <div className="page-head">设置</div>
      <div className="page-sub">数据存在手机本地，记得定期备份</div>

      {msg && (
        <div className={`settings-toast ${msg.type}`} role="status">
          {msg.type === 'ok' ? '✓' : '⚠'} {msg.text}
        </div>
      )}

      <div className="section-title">数据备份</div>
      <div className="settings-card">
        <button className="btn-primary" onClick={handleExport}>
          ⬇️ 导出备份
        </button>
        <button className="btn-ghost settings-btn" onClick={() => fileRef.current?.click()}>
          ⬆️ 导入备份
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />

        <button
          className="settings-danger"
          onClick={() => setConfirmClear(true)}
        >
          清空全部数据
        </button>
      </div>

      <div className="section-title">关于</div>
      <div className="settings-card">
        <div className="settings-about">
          <div className="settings-about-row">
            <span>应用</span>
            <b>旅行足迹</b>
          </div>
          <div className="settings-about-row">
            <span>数据存储</span>
            <b>本地（此设备）</b>
          </div>
          <div className="settings-about-row">
            <span>提示</span>
            <span className="settings-note">
              换机或卸载前，请先「导出备份」，之后在新设备「导入备份」即可找回全部数据。
            </span>
          </div>
        </div>
      </div>

      {/* 导入确认 */}
      {pendingImport && (
        <div className="modal-mask" onClick={() => setPendingImport(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>导入备份？</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.6 }}>
              将用备份文件覆盖当前数据（{pendingImport.guides.length} 份攻略、
              {pendingImport.expenses.length} 笔账单、{pendingImport.locations.length} 个地点、
              {pendingImport.litCities.length} 座城市），当前数据会被替换。
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setPendingImport(null)}>
                取消
              </button>
              <button className="btn-primary" onClick={doImport}>
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 清空确认 */}
      {confirmClear && (
        <div className="modal-mask" onClick={() => setConfirmClear(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>清空全部数据？</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.6 }}>
              所有攻略、账单、地点和点亮城市都会被删除，无法撤销。建议先「导出备份」再操作。
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmClear(false)}>
                取消
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--c-ticket)' }}
                onClick={doClear}
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
