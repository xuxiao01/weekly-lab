import type { WeeklyReport, WeeklyReportWeek } from '@/data/weeklyReports'
import type {
  WeeklyReportDetail,
  WeeklyReportListItem,
  WeeklyReportPagePayload,
  WeeklyReportPutPayload,
} from '@/types/weeklyReport'

function normalizeItem(
  item: { title: string; description?: string; images?: string[] },
) {
  return {
    title: item.title,
    description: item.description ?? '',
    images: item.images?.filter(Boolean) ?? [],
  }
}

export function normalizeWeekLabel(weekLabel: string): string {
  const match = weekLabel.match(/第\s*\d+\s*周/)
  return match ? match[0].replace(/\s+/g, ' ') : weekLabel
}

export function apiListItemToWeekSummary(item: WeeklyReportListItem): WeeklyReportWeek {
  return {
    id: item.id,
    weekLabel: normalizeWeekLabel(item.weekLabel),
    dateRange: item.dateRange,
    shortDateRange: item.shortDateRange,
    reports: [],
  }
}

export function apiDetailToWeek(detail: WeeklyReportDetail): WeeklyReportWeek {
  const weekLabel = normalizeWeekLabel(detail.weekLabel)

  const reports: WeeklyReport[] = detail.reports.map((report, index) => ({
    id: report.id ?? index + 1,
    weekLabel: normalizeWeekLabel(report.weekLabel || detail.weekLabel),
    dateRange: report.dateRange || detail.dateRange,
    shortDateRange: report.shortDateRange || detail.shortDateRange,
    partLabel: report.partLabel,
    title: report.title,
    completed: report.completed.map(normalizeItem),
    nextPlans: report.nextPlans.map(normalizeItem),
  }))

  return {
    id: detail.id,
    weekLabel,
    dateRange: detail.dateRange,
    shortDateRange: detail.shortDateRange,
    reports,
  }
}

export function parsedReportsToPutPayload(
  reports: WeeklyReport[],
  options: {
    startDate: string
    endDate: string
    isPublished: boolean
  },
): WeeklyReportPutPayload {
  const pages: WeeklyReportPagePayload[] = reports.map((report) => ({
    partLabel: report.partLabel,
    title: report.title,
    completed: report.completed.map(normalizeItem),
    nextPlans: report.nextPlans.map(normalizeItem),
  }))

  return {
    startDate: options.startDate,
    endDate: options.endDate,
    isPublished: options.isPublished,
    reports: pages,
  }
}
