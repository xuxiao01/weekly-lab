export type InlineSegment =
  | { type: 'text'; content: string }
  | { type: 'link'; label: string; href: string }

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g

function isSafeHttpUrl(href: string): boolean {
  try {
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function parseInlineMarkdown(input: string): InlineSegment[] {
  if (!input) return []

  const segments: InlineSegment[] = []
  let lastIndex = 0

  for (const match of input.matchAll(LINK_PATTERN)) {
    const fullMatch = match[0]
    const label = match[1]?.trim() ?? ''
    const href = match[2]?.trim() ?? ''
    const start = match.index ?? 0

    if (start > lastIndex) {
      segments.push({ type: 'text', content: input.slice(lastIndex, start) })
    }

    if (label && href && isSafeHttpUrl(href)) {
      segments.push({ type: 'link', label, href })
    } else {
      segments.push({ type: 'text', content: fullMatch })
    }

    lastIndex = start + fullMatch.length
  }

  if (lastIndex < input.length) {
    segments.push({ type: 'text', content: input.slice(lastIndex) })
  }

  return segments
}
