// 条目序号显示：景点用带圈数字，小景点用罗马数字

const CIRCLED = [
  '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
  '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳',
]

export function toCircled(n: number): string {
  return n >= 1 && n <= CIRCLED.length ? CIRCLED[n - 1] : `${n}`
}

// 罗马数字（普通小写字母 i ii iii iv …），支持 1..3999
const ROMAN: [number, string][] = [
  [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'],
  [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'],
  [5, 'v'], [4, 'iv'], [1, 'i'],
]

export function toRoman(n: number): string {
  if (n < 1) return ''
  let out = ''
  let v = Math.floor(n)
  for (const [val, sym] of ROMAN) {
    while (v >= val) {
      out += sym
      v -= val
    }
  }
  return out
}
