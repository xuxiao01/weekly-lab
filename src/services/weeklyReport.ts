import type { WeeklyReportWeek } from '@/data/weeklyReports'
import type {
  WeeklyPublicSettings,
  WeeklyReportDetail,
  WeeklyReportListItem,
  WeeklyReportPutPayload,
} from '@/types/weeklyReport'
import {
  apiDetailToWeek,
  apiListItemToWeekSummary,
} from '@/utils/weeklyReportApiMapper'
import { http } from '@/utils/http'

const weekDetailCache = new Map<string, WeeklyReportWeek>()
const inflightDetailRequests = new Map<string, Promise<WeeklyReportWeek>>()

function sortWeekSummaries(weeks: WeeklyReportWeek[]): WeeklyReportWeek[] {
  return [...weeks].sort((a, b) => {
    const dateCompare = b.dateRange.localeCompare(a.dateRange)
    if (dateCompare !== 0) return dateCompare
    return b.id.localeCompare(a.id)
  })
}

export function listMyWeeklyReports() {
  return http.get<WeeklyReportListItem[]>('/api/weekly-reports')
}

export function getMyWeeklyReport(weekKey: string) {
  return http.get<WeeklyReportDetail>(`/api/weekly-reports/${encodeURIComponent(weekKey)}`)
}

export async function saveMyWeeklyReport(weekKey: string, payload: WeeklyReportPutPayload) {
  const detail = await http.put<WeeklyReportDetail>(
    `/api/weekly-reports/${encodeURIComponent(weekKey)}`,
    payload,
  )
  weekDetailCache.set(weekKey, apiDetailToWeek(detail))
  return detail
}

export function updateWeeklyPublicSettings(publicWeeklyReportsEnabled: boolean) {
  return http.patch<WeeklyPublicSettings>('/api/auth/me/weekly-settings', {
    publicWeeklyReportsEnabled,
  })
}

export async function fetchMyWeeklyReportList(): Promise<WeeklyReportWeek[]> {
  const list = await listMyWeeklyReports()
  return sortWeekSummaries(list.map(apiListItemToWeekSummary))
}

export function getCachedWeekDetail(weekKey: string): WeeklyReportWeek | undefined {
  return weekDetailCache.get(weekKey)
}

export function invalidateWeekDetailCache(weekKey: string) {
  weekDetailCache.delete(weekKey)
  inflightDetailRequests.delete(weekKey)
}

export function clearWeekDetailCache() {
  weekDetailCache.clear()
  inflightDetailRequests.clear()
}

export async function fetchWeekDetail(
  weekKey: string,
  options?: { force?: boolean },
): Promise<WeeklyReportWeek> {
  if (!options?.force) {
    const cached = weekDetailCache.get(weekKey)
    if (cached) return cached

    const inflight = inflightDetailRequests.get(weekKey)
    if (inflight) return inflight
  } else {
    invalidateWeekDetailCache(weekKey)
  }

  const request = getMyWeeklyReport(weekKey)
    .then((detail) => {
      const week = apiDetailToWeek(detail)
      weekDetailCache.set(weekKey, week)
      return week
    })
    .finally(() => {
      inflightDetailRequests.delete(weekKey)
    })

  inflightDetailRequests.set(weekKey, request)
  return request
}
