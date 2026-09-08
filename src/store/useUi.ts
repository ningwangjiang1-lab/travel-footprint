// ============================================================
// UI 状态（暗色模式 / 弹窗 / 底部面板），暗色偏好持久化
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  dark: boolean
  toggleDark: () => void

  newGuideOpen: boolean
  openNewGuide: () => void
  closeNewGuide: () => void
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      dark: false,
      toggleDark: () => set((s) => ({ dark: !s.dark })),

      newGuideOpen: false,
      openNewGuide: () => set({ newGuideOpen: true }),
      closeNewGuide: () => set({ newGuideOpen: false }),
    }),
    {
      name: 'travel-footprint-ui',
      partialize: (s) => ({ dark: s.dark }),
    },
  ),
)

/** 在组件挂载时同步 body.dark class（供 App 调用） */
export function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('dark', dark)
}
