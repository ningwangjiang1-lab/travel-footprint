// ============================================================
// 分享图导出（开发计划 Step 8）
// 浏览器：触发下载；App 内（Capacitor）：写入缓存并唤起系统分享
// ============================================================
import { toPng } from 'html-to-image'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { Media } from '@capacitor-community/media'

const ALBUM_NAME = '旅行足迹'

/** 保存图片到系统相册（App 内，写入「旅行足迹」相册文件夹） */
async function saveToAlbum(dataUrl: string): Promise<void> {
  try {
    let albumIdentifier: string | undefined
    // 1. 复用已存在的「旅行足迹」相册
    try {
      const { albums } = await Media.getAlbums()
      albumIdentifier = albums?.find((a) => a.name === ALBUM_NAME)?.identifier
    } catch {
      albumIdentifier = undefined
    }
    // 2. 没有则创建
    if (!albumIdentifier) {
      try {
        await Media.createAlbum({ name: ALBUM_NAME })
      } catch {
        // 相册已存在等情况，忽略
      }
      const { path } = await Media.getAlbumsPath()
      albumIdentifier = `${path}/${ALBUM_NAME}`
    }
    await Media.savePhoto({ path: dataUrl, albumIdentifier })
  } catch (e) {
    // 保存相册失败不影响后续分享
    console.error('保存到相册失败', e)
  }
}

/** 将 DOM 节点导出为 PNG，App 内保存到相册并唤起系统分享，浏览器触发下载 */
export async function exportNodeToPng(
  node: HTMLElement,
  filename: string,
): Promise<void> {
  if (!node) throw new Error('分享渲染区未就绪')

  // 等待字体与样式稳定
  await document.fonts?.ready

  const dataUrl = await toPng(node, {
    pixelRatio: 3,
    backgroundColor: '#F7F2EA',
    cacheBust: true,
  })

  if (Capacitor.isNativePlatform()) {
    // 1. 先保存到系统相册（解决分享面板里没有「保存到相册」的问题）
    await saveToAlbum(dataUrl)

    // 2. 再写入缓存文件并唤起系统分享面板（分享到微信等）
    const base64 = dataUrl.split(',')[1]
    const written = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    })
    try {
      await Share.share({
        title: '旅行足迹',
        text: '我的足迹地图',
        url: written.uri,
        dialogTitle: '分享我的足迹地图',
      })
    } catch {
      // 用户取消分享，静默处理
    }
  } else {
    // 浏览器：直接触发下载
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  }
}
