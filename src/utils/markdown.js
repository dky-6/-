import { marked } from 'marked'

/**
 * 解析 Markdown 文本，分离 frontmatter 与正文
 * @param {string} raw 原始 Markdown 文本
 * @returns {{ frontmatter: object, body: string }}
 */
export function parseMarkdown(raw) {
  const frontmatter = {}
  let body = raw

  // 匹配 --- 开头的 frontmatter 块
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (fmMatch) {
    const fmText = fmMatch[1]
    body = raw.slice(fmMatch[0].length)
    // 简易 YAML 解析：支持 key: value 与数组
    let currentKey = null
    for (const line of fmText.split(/\r?\n/)) {
      const arrayItemMatch = line.match(/^\s+-\s+(.*)$/)
      if (arrayItemMatch && currentKey) {
        if (!Array.isArray(frontmatter[currentKey])) {
          frontmatter[currentKey] = []
        }
        frontmatter[currentKey].push(arrayItemMatch[1].trim().replace(/^["']|["']$/g, ''))
        continue
      }
      const kvMatch = line.match(/^([\w-]+)\s*:\s*(.*)$/)
      if (kvMatch) {
        const key = kvMatch[1].trim()
        const val = kvMatch[2].trim().replace(/^["']|["']$/g, '')
        frontmatter[key] = val
        currentKey = key
      }
    }
  }

  return { frontmatter, body }
}

/**
 * 将 Markdown 正文渲染为 HTML
 * @param {string} body Markdown 正文
 * @returns {string} HTML
 */
export function renderMarkdown(body) {
  marked.setOptions({
    breaks: true,
    gfm: true
  })
  return marked.parse(body)
}

/**
 * 解析并渲染 Markdown
 * @param {string} raw 原始文本
 * @returns {{ frontmatter: object, html: string }}
 */
export function parseAndRender(raw) {
  const { frontmatter, body } = parseMarkdown(raw)
  return { frontmatter, html: renderMarkdown(body) }
}
