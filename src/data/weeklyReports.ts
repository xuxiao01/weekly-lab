import { reportWeek2026W26 } from './reports/2026-W26'
import { reportWeek2026W24 } from './reports/2026-W24'
import { reportWeek2026W23 } from './reports/2026-W23'

export interface WeeklyReport {
  id: number
  weekLabel: string
  dateRange: string
  shortDateRange: string
  partLabel: string
  title: string
  completed: {
    title: string
    description: string
    images?: string[]
  }[]
  nextPlans: {
    title: string
    description: string
    images?: string[]
  }[]
}

export interface WeeklyReportWeek {
  id: string
  weekLabel: string
  dateRange: string
  shortDateRange: string
  reports: WeeklyReport[]
}

export const defaultWeeklyReportWeeks: WeeklyReportWeek[] = [
  reportWeek2026W26,
  reportWeek2026W24,
  reportWeek2026W23,
]

export const defaultMeta = {
  weekLabel: "第 26 周",
  dateRange: "2026.06.22 - 2026.06.26",
  shortDateRange: "06.22 - 06.26",
} as const

export const defaultWeeklyReports: WeeklyReport[] = reportWeek2026W26.reports

/** @deprecated 使用 defaultWeeklyReportWeeks */
export const weeklyReports = defaultWeeklyReports
