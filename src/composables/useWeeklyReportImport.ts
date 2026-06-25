import { onMounted, ref, watch, type Ref } from 'vue'
import type { WeeklyReportWeek } from '@/data/weeklyReports'
import { parseWeeklyMd } from '@/utils/parseWeeklyMd'
import { saveReportWeeks } from '@/utils/weeklyReportStorage'

const MARKDOWN_DRAFT_KEY = 'weekly-showcase-markdown-draft'

function pad2(value: string | number) {
  return String(value).padStart(2, '0')
}

function shortDateFromInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `${match[2]}.${match[3]}` : ''
}

function fullDateFromInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `${match[1]}.${match[2]}.${match[3]}` : ''
}

export function yearFromDateRange(dateRange: string) {
  return dateRange.match(/\d{4}/)?.[0] ?? '2026'
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  return `${year}-${month}-${day}`
}

function weekdayRangeForIsoWeek(year: number, weekNumber: number) {
  const jan4 = new Date(year, 0, 4)
  const jan4Day = jan4.getDay() || 7
  const weekOneMonday = new Date(year, 0, 4 - jan4Day + 1)
  const start = new Date(weekOneMonday)
  start.setDate(weekOneMonday.getDate() + (weekNumber - 1) * 7)

  const end = new Date(start)
  end.setDate(start.getDate() + 4)

  return {
    start: formatDateInput(start),
    end: formatDateInput(end),
  }
}

function weekNumberFromLabel(weekLabel: string) {
  return weekLabel.match(/\d+/)?.[0] ?? ''
}

async function persistReportWeeks(nextWeeks: WeeklyReportWeek[]) {
  saveReportWeeks(nextWeeks)

  if (!import.meta.env.DEV) {
    return
  }

  const response = await fetch('/__weekly-dev/report-weeks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ weeks: nextWeeks }),
  })

  if (!response.ok) {
    throw new Error('dev write failed')
  }
}

export type ImportSubmitResult =
  | { ok: true; weekId: string }
  | { ok: false; partialSave?: boolean }

export function useWeeklyReportImport(
  reportWeeks: Ref<WeeklyReportWeek[]>,
  options?: {
    defaultWeek?: () => WeeklyReportWeek
  },
) {
  const markdownDraft = ref('')
  const parseError = ref('')
  const importYear = ref('')
  const importWeekNumber = ref('')
  const importStartDate = ref('')
  const importEndDate = ref('')

  function syncWeekdayRangeFromImportFields() {
    const year = Number(importYear.value)
    const weekNumber = Number(importWeekNumber.value)
    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100 ||
      !Number.isInteger(weekNumber) ||
      weekNumber < 1 ||
      weekNumber > 53
    ) {
      return
    }

    const range = weekdayRangeForIsoWeek(year, weekNumber)
    importStartDate.value = range.start
    importEndDate.value = range.end
  }

  function syncImportMeta() {
    const week = options?.defaultWeek?.() ?? reportWeeks.value[0]
    if (!week) return

    importYear.value = yearFromDateRange(week.dateRange)
    importWeekNumber.value = weekNumberFromLabel(week.weekLabel)
    syncWeekdayRangeFromImportFields()
  }

  function buildImportMeta() {
    const year = Number(importYear.value)
    const weekNumber = Number(importWeekNumber.value)
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return { ok: false as const, message: '请输入 2000-2100 之间的年份。' }
    }

    if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 53) {
      return { ok: false as const, message: '请选择 1-53 之间的周数。' }
    }

    if (!importStartDate.value || !importEndDate.value) {
      return { ok: false as const, message: '请选择开始日期和结束日期。' }
    }

    if (importStartDate.value > importEndDate.value) {
      return { ok: false as const, message: '开始日期不能晚于结束日期。' }
    }

    const startShort = shortDateFromInput(importStartDate.value)
    const endShort = shortDateFromInput(importEndDate.value)
    const startFull = fullDateFromInput(importStartDate.value)
    const endFull = fullDateFromInput(importEndDate.value)

    return {
      ok: true as const,
      data: {
        year,
        weekLabel: `第 ${weekNumber} 周`,
        dateRange: `${startFull} - ${endFull}`,
        shortDateRange: `${startShort} - ${endShort}`,
      },
    }
  }

  async function handleSubmit(): Promise<ImportSubmitResult> {
    const metaResult = buildImportMeta()
    if (!metaResult.ok) {
      parseError.value = metaResult.message
      return { ok: false }
    }

    const meta = metaResult.data
    const result = parseWeeklyMd(markdownDraft.value, meta)

    if (!result.ok) {
      parseError.value = result.message
      return { ok: false }
    }

    parseError.value = ''
    const normalizedReports = result.data.map((report, index) => ({
      ...report,
      id: index + 1,
      weekLabel: meta.weekLabel,
      dateRange: meta.dateRange,
      shortDateRange: meta.shortDateRange,
    }))
    const weekId = `${yearFromDateRange(meta.dateRange)}-W${pad2(importWeekNumber.value)}`
    const nextWeek: WeeklyReportWeek = {
      id: weekId,
      weekLabel: meta.weekLabel,
      dateRange: meta.dateRange,
      shortDateRange: meta.shortDateRange,
      reports: normalizedReports,
    }
    const existingIndex = reportWeeks.value.findIndex((week) => week.id === weekId)
    const nextWeeks =
      existingIndex >= 0
        ? reportWeeks.value.map((week) => (week.id === weekId ? nextWeek : week))
        : [nextWeek, ...reportWeeks.value]

    reportWeeks.value = nextWeeks
    try {
      await persistReportWeeks(nextWeeks)
    } catch {
      saveReportWeeks(nextWeeks)
      parseError.value = '已保存到浏览器本地，但写入源码文件失败，请检查开发服务。'
      return { ok: false, partialSave: true }
    }

    return { ok: true, weekId }
  }

  onMounted(() => {
    const saved = sessionStorage.getItem(MARKDOWN_DRAFT_KEY)
    if (saved !== null) {
      markdownDraft.value = saved
    }
    syncImportMeta()
  })

  watch(markdownDraft, (value) => {
    sessionStorage.setItem(MARKDOWN_DRAFT_KEY, value)
  })

  watch([importYear, importWeekNumber], syncWeekdayRangeFromImportFields)

  return {
    markdownDraft,
    parseError,
    importYear,
    importWeekNumber,
    importStartDate,
    importEndDate,
    syncImportMeta,
    handleSubmit,
  }
}
