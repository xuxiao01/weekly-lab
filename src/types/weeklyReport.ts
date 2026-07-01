export interface WeeklyReportItemPayload {
  title: string
  description?: string
  images?: string[]
}

export interface WeeklyReportPagePayload {
  partLabel: string
  title: string
  completed?: WeeklyReportItemPayload[]
  nextPlans?: WeeklyReportItemPayload[]
}

export interface WeeklyReportPutPayload {
  startDate?: string
  endDate?: string
  isPublished?: boolean
  reports: WeeklyReportPagePayload[]
}

export interface WeeklyReportListItem {
  id: string
  weekLabel: string
  dateRange: string
  shortDateRange: string
  reportCount: number
  isPublished: boolean
  updatedAt: string
}

export interface WeeklyReportDetailReport {
  id: number
  weekLabel: string
  dateRange: string
  shortDateRange: string
  partLabel: string
  title: string
  completed: WeeklyReportItemPayload[]
  nextPlans: WeeklyReportItemPayload[]
}

export interface WeeklyReportDetail {
  id: string
  weekLabel: string
  dateRange: string
  shortDateRange: string
  isPublished: boolean
  reports: WeeklyReportDetailReport[]
}

export interface WeeklyPublicSettings {
  publicWeeklyReportsEnabled: boolean
}
