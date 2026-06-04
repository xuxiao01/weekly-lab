import type { WeeklyReport } from '../data/weeklyReports'

export interface ReportMetaDefaults {
  weekLabel: string
  dateRange: string
  shortDateRange: string
}

export type ParseWeeklyMdResult =
  | { ok: true; data: WeeklyReport[] }
  | { ok: false; message: string }

const PART_LABELS = [
  '第一部分',
  '第二部分',
  '第三部分',
  '第四部分',
  '第五部分',
  '第六部分',
  '第七部分',
  '第八部分',
  '第九部分',
  '第十部分',
]

function partLabelForIndex(index: number): string {
  return PART_LABELS[index] ?? `第 ${index + 1} 部分`
}

type SectionKey = 'completed' | 'nextPlans'

interface PageDraft {
  title: string
  completed: WeeklyReport['completed']
  nextPlans: WeeklyReport['nextPlans']
}

export function parseWeeklyMd(
  markdown: string,
  meta: ReportMetaDefaults,
): ParseWeeklyMdResult {
  const trimmed = markdown.trim()
  if (!trimmed) {
    return { ok: false, message: '内容为空，请粘贴 Markdown 后再提交。' }
  }

  const pages: PageDraft[] = []
  let currentPage: PageDraft | null = null
  let currentSection: SectionKey | null = null

  for (const rawLine of trimmed.split(/\r?\n/)) {
    const line = rawLine.trimEnd()

    const h1Match = line.match(/^#\s+(.+)$/)
    if (h1Match && !line.startsWith('##')) {
      currentPage = {
        title: h1Match[1]!.trim(),
        completed: [],
        nextPlans: [],
      }
      pages.push(currentPage)
      currentSection = null
      continue
    }

    if (/^##\s*本周完成\s*$/.test(line)) {
      currentSection = 'completed'
      continue
    }

    if (/^##\s*(未来展望|下周计划)\s*$/.test(line)) {
      currentSection = 'nextPlans'
      continue
    }

    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/)
    if (bulletMatch && currentPage && currentSection) {
      currentPage[currentSection].push({
        title: bulletMatch[1]!.trim(),
        description: '',
      })
    }
  }

  if (pages.length === 0) {
    return {
      ok: false,
      message: '未找到任何页面，请使用「# 标题」作为每一页的开头。',
    }
  }

  const data: WeeklyReport[] = pages.map((page, index) => ({
    id: index + 1,
    weekLabel: meta.weekLabel,
    dateRange: meta.dateRange,
    shortDateRange: meta.shortDateRange,
    partLabel: partLabelForIndex(index),
    title: page.title,
    completed: page.completed,
    nextPlans: page.nextPlans,
  }))

  return { ok: true, data }
}

export function metaFromReports(
  reports: WeeklyReport[],
  fallback: ReportMetaDefaults,
): ReportMetaDefaults {
  const first = reports[0]
  if (!first) return fallback
  return {
    weekLabel: first.weekLabel,
    dateRange: first.dateRange,
    shortDateRange: first.shortDateRange,
  }
}
