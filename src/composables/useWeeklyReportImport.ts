import { nextTick, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { parseWeeklyMd } from '@/utils/parseWeeklyMd'
import { isAuthenticated } from '@/services/auth'
import {
  fetchMyWeeklyReportList,
  getMyWeeklyReport,
  saveMyWeeklyReport,
  updateWeeklyPublicSettings,
} from '@/services/weeklyReport'
import { apiDetailToWeek, parsedReportsToPutPayload } from '@/utils/weeklyReportApiMapper'
import { reportsToMarkdown } from '@/utils/weeklyReportMarkdown'
import { HttpError } from '@/types/http'
import type { WeeklyReportWeek } from '@/data/weeklyReports'

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

function weekNumberFromKey(weekKey: string) {
  return weekKey.match(/W(\d{1,2})$/)?.[1] ?? ''
}

function inputDateFromFullDate(value: string) {
  const match = value.match(/(\d{4})\.(\d{2})\.(\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : ''
}

function inputDateRangeFromDateRange(dateRange: string) {
  const [start = '', end = ''] = dateRange.split(/\s*-\s*/)
  return {
    start: inputDateFromFullDate(start),
    end: inputDateFromFullDate(end),
  }
}

function currentIsoWeekNumber(date = new Date()) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export type ImportSubmitResult =
  | { ok: true; weekId: string }
  | { ok: false; partialSave?: boolean }

export function useWeeklyReportImport(options?: {
  editWeekKey?: MaybeRefOrGetter<string | undefined>
}) {
  const markdownDraft = ref('')
  const parseError = ref('')
  const isPublished = ref(false)
  const importYear = ref('')
  const importWeekNumber = ref('')
  const importStartDate = ref('')
  const importEndDate = ref('')
  const editLoading = ref(false)
  const editLoadError = ref('')
  const suppressMetaSync = ref(false)
  const initialized = ref(false)

  function currentEditWeekKey() {
    return toValue(options?.editWeekKey) || ''
  }

  async function setImportFields(fields: {
    year: string
    weekNumber: string
    startDate?: string
    endDate?: string
  }) {
    suppressMetaSync.value = true
    importYear.value = fields.year
    importWeekNumber.value = fields.weekNumber
    if (fields.startDate) importStartDate.value = fields.startDate
    if (fields.endDate) importEndDate.value = fields.endDate
    await nextTick()
    suppressMetaSync.value = false
  }

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

  async function syncImportMetaFromWeek(week: WeeklyReportWeek) {
    const range = inputDateRangeFromDateRange(week.dateRange)
    await setImportFields({
      year: yearFromDateRange(week.dateRange),
      weekNumber: weekNumberFromLabel(week.weekLabel),
      startDate: range.start,
      endDate: range.end,
    })
  }

  async function syncImportMetaDefaults() {
    const now = new Date()
    const year = now.getFullYear()
    const weekNumber = currentIsoWeekNumber(now)
    await setImportFields({
      year: String(year),
      weekNumber: String(weekNumber),
    })
    syncWeekdayRangeFromImportFields()
  }

  async function loadEditWeek(weekKey: string) {
    if (!isAuthenticated()) {
      editLoadError.value = '请先登录后再编辑。'
      return
    }

    editLoading.value = true
    editLoadError.value = ''
    parseError.value = ''

    try {
      const detail = await getMyWeeklyReport(weekKey)
      const week = apiDetailToWeek(detail)
      const range = inputDateRangeFromDateRange(week.dateRange)
      await setImportFields({
        year: yearFromDateRange(week.dateRange),
        weekNumber: weekNumberFromKey(weekKey) || weekNumberFromLabel(week.weekLabel),
        startDate: range.start,
        endDate: range.end,
      })
      markdownDraft.value = reportsToMarkdown(week.reports)
      isPublished.value = detail.isPublished
    } catch (error) {
      editLoadError.value =
        error instanceof HttpError ? error.message : '加载周报失败，请稍后重试。'
    } finally {
      editLoading.value = false
    }
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
    if (!isAuthenticated()) {
      parseError.value = '请先登录后再发布。'
      return { ok: false }
    }

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
    const weekId = currentEditWeekKey() || `${yearFromDateRange(meta.dateRange)}-W${pad2(importWeekNumber.value)}`
    const payload = parsedReportsToPutPayload(normalizedReports, {
      startDate: importStartDate.value,
      endDate: importEndDate.value,
      isPublished: isPublished.value,
    })

    try {
      if (isPublished.value) {
        await updateWeeklyPublicSettings(true)
      }
      await saveMyWeeklyReport(weekId, payload)
    } catch (error) {
      parseError.value =
        error instanceof HttpError ? error.message : '发布失败，请稍后重试。'
      return { ok: false }
    }

    return { ok: true, weekId }
  }

  async function initializeImport(editWeekKey = currentEditWeekKey()) {
    if (!isAuthenticated()) {
      await syncImportMetaDefaults()
      return
    }

    if (editWeekKey) {
      await loadEditWeek(editWeekKey)
      return
    }

    try {
      const weeks = await fetchMyWeeklyReportList()
      if (weeks[0]) {
        await syncImportMetaFromWeek(weeks[0])
      } else {
        await syncImportMetaDefaults()
      }
    } catch {
      await syncImportMetaDefaults()
    }
  }

  onMounted(async () => {
    const saved = sessionStorage.getItem(MARKDOWN_DRAFT_KEY)
    if (saved !== null) {
      markdownDraft.value = saved
    }

    await initializeImport()
    initialized.value = true
  })

  watch(markdownDraft, (value) => {
    sessionStorage.setItem(MARKDOWN_DRAFT_KEY, value)
  })

  watch([importYear, importWeekNumber], () => {
    if (suppressMetaSync.value) return
    syncWeekdayRangeFromImportFields()
  })

  watch(
    currentEditWeekKey,
    async (weekKey, previousWeekKey) => {
      if (!initialized.value || weekKey === previousWeekKey) return
      await initializeImport(weekKey)
    },
  )

  return {
    markdownDraft,
    parseError,
    editLoading,
    editLoadError,
    importYear,
    importWeekNumber,
    importStartDate,
    importEndDate,
    isPublished,
    syncImportMetaFromWeek,
    syncImportMetaDefaults,
    loadEditWeek,
    handleSubmit,
  }
}
