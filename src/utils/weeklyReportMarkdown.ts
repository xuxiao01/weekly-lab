import type { WeeklyReport } from '@/data/weeklyReports'
import type { WeeklyReportDetail, WeeklyReportPutPayload } from '@/types/weeklyReport'

function imageLines(images?: string[]) {
  return (images ?? []).filter(Boolean).map((src) => `![](${src})`)
}

function listLines(items: WeeklyReport['completed']) {
  if (items.length === 0) return ['']

  return items.flatMap((item, index) => {
    const lines = [`${index + 1}. ${item.title}`]
    lines.push(...imageLines(item.images))
    return lines
  })
}

export function reportsToMarkdown(reports: WeeklyReport[]): string {
  return reports
    .map((report) => {
      const heading = report.partLabel
        ? `# ${report.partLabel}｜${report.title}`
        : `# ${report.title}`

      return [
        heading,
        '',
        `${report.weekLabel} · ${report.shortDateRange}`,
        '',
        '## 本周完成',
        ...listLines(report.completed),
        '',
        '## 未来展望',
        ...listLines(report.nextPlans),
      ].join('\n')
    })
    .join('\n\n')
}

export function detailToPutPayload(
  detail: WeeklyReportDetail,
  isPublished = detail.isPublished,
): WeeklyReportPutPayload {
  return {
    isPublished,
    reports: detail.reports.map((report) => ({
      partLabel: report.partLabel,
      title: report.title,
      completed: report.completed.map((item) => ({
        title: item.title,
        description: item.description ?? '',
        images: item.images?.filter(Boolean) ?? [],
      })),
      nextPlans: report.nextPlans.map((item) => ({
        title: item.title,
        description: item.description ?? '',
        images: item.images?.filter(Boolean) ?? [],
      })),
    })),
  }
}
