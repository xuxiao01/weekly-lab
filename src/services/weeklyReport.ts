import type { WeeklyReportWeek } from '@/data/weeklyReports'
import type {
  WeeklyPublicSettings,
  WeeklyReportDetail,
  WeeklyReportListItem,
  WeeklyReportPutPayload,
} from '@/types/weeklyReport'
import { apiDetailToWeek } from '@/utils/weeklyReportApiMapper'
import { http } from '@/utils/http'

export function listMyWeeklyReports() {
  return http.get<WeeklyReportListItem[]>('/api/weekly-reports')
}

export function getMyWeeklyReport(weekKey: string) {
  return http.get<WeeklyReportDetail>(`/api/weekly-reports/${encodeURIComponent(weekKey)}`)
}

export function saveMyWeeklyReport(weekKey: string, payload: WeeklyReportPutPayload) {
  return http.put<WeeklyReportDetail>(
    `/api/weekly-reports/${encodeURIComponent(weekKey)}`,
    payload,
  )
}

export function updateWeeklyPublicSettings(publicWeeklyReportsEnabled: boolean) {
  return http.patch<WeeklyPublicSettings>('/api/auth/me/weekly-settings', {
    publicWeeklyReportsEnabled,
  })
}

export async function fetchMyWeeklyReportWeeks(): Promise<WeeklyReportWeek[]> {
  const list = await listMyWeeklyReports()
  if (list.length === 0) return []

  const details = await Promise.all(
    list.map((item) => getMyWeeklyReport(item.id)),
  )

  return details
    .map(apiDetailToWeek)
    .sort((a, b) => {
      const dateCompare = b.dateRange.localeCompare(a.dateRange)
      if (dateCompare !== 0) return dateCompare
      return b.id.localeCompare(a.id)
    })
}
