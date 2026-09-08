import { useLayoutEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'

/** 页面切换动画（UI 规范 §8：opacity + translateY(8px)，0.4s ease） */
export default function Page({ children }: { children: ReactNode }) {
  // 进入新页面时从顶部开始显示，且不改变上一页的滚动位置
  useLayoutEffect(() => {
    document.querySelector('.screen')?.scrollTo({ top: 0 })
  }, [])
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
