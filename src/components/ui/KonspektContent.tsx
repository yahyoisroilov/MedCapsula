/* Konspekt content rendering — light module, safe to import on student pages.
   New content is stored as HTML (from the TipTap admin editor); older content
   is markdown and goes through renderMarkdown. */

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Inline formatting: images, links, bold, italic, highlight. Order matters —
// images before links (image syntax contains link syntax).
function inline(raw: string) {
  let s = esc(raw)
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_m, alt, url) => `<img src="${url}" alt="${alt}" loading="lazy" class="mc-k-inline-img" />`,
  )
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, text, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`,
  )
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  s = s.replace(/==([^=\n]+)==/g, '<mark>$1</mark>')
  return s
}

const IMG_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/
const BLOCK_START = /^(#{2,4}\s|[-*]\s|\d+\.\s|>\s?|---+\s*$)/

export function renderMarkdown(src: string) {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const t = lines[i].trim()

    if (!t) {
      i++
      continue
    }

    // Intentional blank row marker (from the previous WYSIWYG editor).
    if (t === '\\') {
      out.push('<p><br/></p>')
      i++
      continue
    }

    // Block image (own line) → figure with optional caption from alt text.
    const img = t.match(IMG_LINE)
    if (img) {
      const alt = esc(img[1])
      out.push(
        `<figure class="mc-k-figure"><img src="${img[2]}" alt="${alt}" loading="lazy" />` +
          (img[1] ? `<figcaption>${alt}</figcaption>` : '') +
          `</figure>`,
      )
      i++
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(t)) {
      out.push('<hr />')
      i++
      continue
    }

    // Headings (##, ###, ####)
    const h = t.match(/^(#{2,4})\s+(.+)$/)
    if (h) {
      const level = h[1].length
      out.push(`<h${level}>${inline(h[2])}</h${level}>`)
      i++
      continue
    }

    // Blockquote
    if (/^>\s?/.test(t)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(inline(lines[i].trim().replace(/^>\s?/, '')))
        i++
      }
      out.push(`<blockquote>${buf.join('<br/>')}</blockquote>`)
      continue
    }

    // Unordered list
    if (/^[-*]\s+/.test(t)) {
      const buf: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        buf.push(`<li>${inline(lines[i].trim().replace(/^[-*]\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ul>${buf.join('')}</ul>`)
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(t)) {
      const buf: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        buf.push(`<li>${inline(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ol>${buf.join('')}</ol>`)
      continue
    }

    // Paragraph — gather consecutive plain lines.
    const buf: string[] = []
    while (i < lines.length) {
      const l = lines[i].trim()
      if (!l || l === '\\' || BLOCK_START.test(l) || IMG_LINE.test(l)) break
      buf.push(inline(l))
      i++
    }
    if (buf.length) out.push(`<p>${buf.join('<br/>')}</p>`)
  }

  return out.join('\n')
}

export function isHtmlContent(content: string) {
  return /^\s*</.test(content)
}

/** Stored content → display HTML, whichever format it is in. */
export function contentToHtml(content: string) {
  if (!content || !content.trim()) return ''
  return isHtmlContent(content) ? content : renderMarkdown(content)
}

export function MarkdownRenderer({ content }: { content: string }) {
  const html = contentToHtml(content)
  if (!html) {
    return <p className="text-sm italic text-ink-faint">Konspekt mavjud emas</p>
  }
  return <div className="mc-konspekt" dangerouslySetInnerHTML={{ __html: html }} />
}
