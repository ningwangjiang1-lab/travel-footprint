// 直接生成安卓 launcher 图标 + 启动图（替代默认 Capacitor 图标）
import sharp from 'sharp'

const BROWN = '#8B5E3C'
const WHITE = '#FFFDF8'
const BROWN_RGBA = { r: 139, g: 94, b: 60, alpha: 1 }
const res = 'android/app/src/main/res'

// 海上落日 标记（100x100 viewBox，米白元素）
const mark = `
  <path d="M29 26 q6 -6 12 0 q6 -6 12 0" stroke="${WHITE}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M57 33 q3.5 -3.5 7 0 q3.5 -3.5 7 0" stroke="${WHITE}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M32 58 A18 18 0 0 1 68 58 Z" fill="${WHITE}"/>
  <path d="M38 66 q6 -3 12 0 q6 3 12 0" stroke="${WHITE}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M26 78 q6 -3 12 0 q6 3 12 0 q6 -3 12 0 q6 3 12 0" stroke="${WHITE}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M14 90 q6 -3 12 0 q6 3 12 0 q6 -3 12 0 q6 3 12 0 q6 -3 12 0 q6 3 12 0" stroke="${WHITE}" stroke-width="3" fill="none" stroke-linecap="round"/>
`
const full = `<rect width="100" height="100" rx="24" fill="${BROWN}"/>${mark}`

function svg(inner, w, h) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${w}" height="${h}">${inner}</svg>`,
  )
}

// 1) 旧式图标 + 圆形图标（完整图标）
const legacy = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 }
for (const [dpi, size] of Object.entries(legacy)) {
  const buf = await sharp(svg(full, size, size)).png().toBuffer()
  await sharp(buf).toFile(`${res}/mipmap-${dpi}/ic_launcher.png`)
  await sharp(buf).toFile(`${res}/mipmap-${dpi}/ic_launcher_round.png`)
}

// 2) 自适应图标前景（透明底 + 白色标记，缩到中央安全区 62%）
const fg = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 }
const fgSafe = `<g transform="translate(19 19) scale(0.62)">${mark}</g>`
for (const [dpi, size] of Object.entries(fg)) {
  await sharp(svg(fgSafe, size, size)).png().toFile(`${res}/mipmap-${dpi}/ic_launcher_foreground.png`)
}

// 3) 启动图（纯棕底 + 居中标记，标记高度约为短边的 32%）
const splashes = {
  'drawable/splash.png': [480, 320],
  'drawable-port-mdpi/splash.png': [320, 480],
  'drawable-port-hdpi/splash.png': [480, 800],
  'drawable-port-xhdpi/splash.png': [720, 1280],
  'drawable-port-xxhdpi/splash.png': [960, 1600],
  'drawable-port-xxxhdpi/splash.png': [1280, 1920],
  'drawable-land-mdpi/splash.png': [480, 320],
  'drawable-land-hdpi/splash.png': [800, 480],
  'drawable-land-xhdpi/splash.png': [1280, 720],
  'drawable-land-xxhdpi/splash.png': [1600, 960],
  'drawable-land-xxxhdpi/splash.png': [1920, 1280],
}
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="14 20 72 70" width="720" height="700">${mark}</svg>`

for (const [file, [w, h]] of Object.entries(splashes)) {
  const markH = Math.round(Math.min(w, h) * 0.32)
  const markBuf = await sharp(Buffer.from(markSvg)).resize({ height: markH }).png().toBuffer()
  const meta = await sharp(markBuf).metadata()
  const out = await sharp({
    create: { width: w, height: h, channels: 4, background: BROWN_RGBA },
  })
    .composite([
      {
        input: markBuf,
        left: Math.round((w - meta.width) / 2),
        top: Math.round((h - meta.height) / 2),
      },
    ])
    .png()
    .toBuffer()
  await sharp(out).toFile(`${res}/${file}`)
}

console.log('安卓图标与启动图已生成')
