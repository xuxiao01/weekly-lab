import type { WeeklyReport } from '../data/weeklyReports'

export const REPORTS_STORAGE_KEY = 'weekly-showcase-reports'

function isWeeklyReport(value: unknown): value is WeeklyReport {
  if (!value || typeof value !== 'object') return false
  const r = value as WeeklyReport
  return (
    typeof r.id === 'number' &&
    typeof r.weekLabel === 'string' &&
    typeof r.dateRange === 'string' &&
    typeof r.shortDateRange === 'string' &&
    typeof r.partLabel === 'string' &&
    typeof r.title === 'string' &&
    Array.isArray(r.completed) &&
    Array.isArray(r.nextPlans)
  )
}

function normalizeReport(raw: WeeklyReport): WeeklyReport {
  return {
    id: raw.id,
    weekLabel: raw.weekLabel,
    dateRange: raw.dateRange,
    shortDateRange: raw.shortDateRange,
    partLabel: raw.partLabel,
    title: raw.title,
    completed: raw.completed.map((item) => ({
      title: item.title,
      description: item.description ?? '',
    })),
    nextPlans: raw.nextPlans.map((item) => ({
      title: item.title,
      description: item.description ?? '',
    })),
  }
}

export function loadReports(fallback: WeeklyReport[]): WeeklyReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY)
    if (!raw) return fallback

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback

    if (!parsed.every(isWeeklyReport)) return fallback

    return parsed.map(normalizeReport)
  } catch {
    return fallback
  }
}

export function saveReports(reports: WeeklyReport[]): void {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports))
}
