// ============================================================
// 分享图导出（开发计划 Step 8）
// ============================================================
import { toPng } from 'html-to-image'

/** 将 DOM 节点导出为 PNG 并触发下载 */
export async function exportNodeToPng(
  node: HTMLElement,
  filename: string,
): Promise<void> {
  if (!node) throw new Error('分享渲染区未就绪')

  // 等待字体与样式稳定
  await document.fonts?.ready

  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: '#F7F2EA',
    cacheBust: true,
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
