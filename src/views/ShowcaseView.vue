<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  defaultWeeklyReportWeeks,
  type WeeklyReportWeek,
} from '../data/weeklyReports'
import WeeklyContent from '../components/WeeklyContent.vue'
import PageNavigation from '../components/PageNavigation.vue'
import AppHeader from '../components/layout/AppHeader.vue'
import ReportHero from '../components/layout/ReportHero.vue'
import ReportMetaBar from '../components/layout/ReportMetaBar.vue'
import { usePageTransition } from '../composables/usePageTransition'
import { yearFromDateRange } from '../composables/useWeeklyReportImport'
import { loadReportWeeks } from '../utils/weeklyReportStorage'

const route = useRoute()

const reportWeeks = ref<WeeklyReportWeek[]>(
  loadReportWeeks(defaultWeeklyReportWeeks),
)
const currentWeekId = ref(reportWeeks.value[0]?.id ?? defaultWeeklyReportWeeks[0]!.id)
const currentPageIndex = ref(0)
const contentRef = ref<HTMLElement | null>(null)

const currentWeek = computed(() => {
  return (
    reportWeeks.value.find((week) => week.id === currentWeekId.value) ??
    reportWeeks.value[0] ??
    defaultWeeklyReportWeeks[0]!
  )
})

const reports = computed(() => currentWeek.value.reports)
const totalPages = computed(() => reports.value.length)

const currentIndex = computed({
  get: () => Math.min(currentPageIndex.value, Math.max(0, totalPages.value - 1)),
  set: (index) => {
    currentPageIndex.value = index
  },
})

const currentReport = computed(() => reports.value[currentIndex.value]!)
const reportMeta = computed(
  () => `${yearFromDateRange(currentWeek.value.dateRange)} 年${currentWeek.value.weekLabel} · ${currentWeek.value.shortDateRange}`,
)
const sortedWeeks = computed(() =>
  [...reportWeeks.value].sort((a, b) => {
    const dateCompare = b.dateRange.localeCompare(a.dateRange)
    if (dateCompare !== 0) return dateCompare
    return b.id.localeCompare(a.id)
  }),
)

const { isAnimating, goNext, goPrev } = usePageTransition(
  contentRef,
  currentIndex,
  totalPages,
)

const canGoPrev = computed(() => currentIndex.value > 0 && !isAnimating.value)
const canGoNext = computed(
  () => currentIndex.value < totalPages.value - 1 && !isAnimating.value,
)

function refreshReportWeeks() {
  reportWeeks.value = loadReportWeeks(defaultWeeklyReportWeeks)
}

function applyWeekQuery(weekId: unknown) {
  if (typeof weekId !== 'string' || !weekId) return

  const matched = reportWeeks.value.find((week) => week.id === weekId)
  if (!matched) return

  currentWeekId.value = weekId
  currentPageIndex.value = 0
}

onMounted(() => {
  applyWeekQuery(route.query.week)
})

watch(
  () => route.query.week,
  (weekId) => {
    refreshReportWeeks()
    applyWeekQuery(weekId)
  },
)

watch(totalPages, (len) => {
  if (currentIndex.value >= len) {
    currentIndex.value = Math.max(0, len - 1)
  }
})

function selectWeek(weekId: WeeklyReportWeek['id']) {
  currentWeekId.value = weekId
  currentPageIndex.value = 0
}
</script>

<template>
  <div class="app showcase-page">
    <AppHeader />
    <div class="showcase-main">
      <div class="content-area">
        <ReportHero :title="currentReport.title" />
        <div class="report-content">
          <ReportMetaBar
            :meta="reportMeta"
            :weeks="sortedWeeks"
            :current-week-id="currentWeek.id"
            @select-week="selectWeek"
          />
          <div ref="contentRef" class="content-shell report-body">
            <WeeklyContent :report="currentReport" />
          </div>
          <PageNavigation
            :can-prev="canGoPrev"
            :can-next="canGoNext"
            @prev="goPrev"
            @next="goNext"
          />
        </div>
      </div>
    </div>
  </div>
</template>
