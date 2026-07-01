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
import { isAuthenticated } from '../services/auth'
import { fetchMyWeeklyReportWeeks } from '../services/weeklyReport'
import { HttpError } from '../types/http'

const route = useRoute()

const reportWeeks = ref<WeeklyReportWeek[]>(
  isAuthenticated() ? [] : defaultWeeklyReportWeeks,
)
const loading = ref(isAuthenticated())
const loadError = ref('')
const loggedIn = ref(isAuthenticated())
const currentWeekId = ref(
  isAuthenticated() ? '' : (defaultWeeklyReportWeeks[0]?.id ?? ''),
)
const currentPageIndex = ref(0)
const contentRef = ref<HTMLElement | null>(null)

const hasWeeks = computed(() => reportWeeks.value.length > 0)

const currentWeek = computed(() => {
  if (!hasWeeks.value) return null
  return (
    reportWeeks.value.find((week) => week.id === currentWeekId.value) ??
    reportWeeks.value[0] ??
    null
  )
})

const reports = computed(() => currentWeek.value?.reports ?? [])
const totalPages = computed(() => reports.value.length)

const currentIndex = computed({
  get: () => Math.min(currentPageIndex.value, Math.max(0, totalPages.value - 1)),
  set: (index) => {
    currentPageIndex.value = index
  },
})

const currentReport = computed(() => reports.value[currentIndex.value] ?? null)
const reportMeta = computed(() => {
  if (!currentWeek.value) return ''
  return `${yearFromDateRange(currentWeek.value.dateRange)} 年${currentWeek.value.weekLabel} · ${currentWeek.value.shortDateRange}`
})
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

function applyWeekQuery(weekId: unknown) {
  if (typeof weekId !== 'string' || !weekId || !hasWeeks.value) return

  const matched = reportWeeks.value.find((week) => week.id === weekId)
  if (!matched) return

  currentWeekId.value = weekId
  currentPageIndex.value = 0
}

function ensureCurrentWeekId() {
  if (!hasWeeks.value) {
    currentWeekId.value = ''
    return
  }
  if (!reportWeeks.value.some((week) => week.id === currentWeekId.value)) {
    currentWeekId.value = reportWeeks.value[0]!.id
  }
}

async function loadWeeks() {
  loggedIn.value = isAuthenticated()
  loadError.value = ''

  if (!loggedIn.value) {
    reportWeeks.value = defaultWeeklyReportWeeks
    ensureCurrentWeekId()
    applyWeekQuery(route.query.week)
    return
  }

  loading.value = true
  try {
    reportWeeks.value = await fetchMyWeeklyReportWeeks()
    ensureCurrentWeekId()
    applyWeekQuery(route.query.week)
  } catch (error) {
    loadError.value =
      error instanceof HttpError ? error.message : '加载周报失败，请稍后重试。'
    reportWeeks.value = []
    currentWeekId.value = ''
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadWeeks()
})

watch(
  () => route.query.week,
  (weekId) => {
    void loadWeeks().then(() => applyWeekQuery(weekId))
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
      <div v-if="loading" class="showcase-status">加载周报中...</div>
      <div v-else-if="loadError" class="showcase-status showcase-status--error">
        {{ loadError }}
      </div>
      <div
        v-else-if="loggedIn && !hasWeeks"
        class="showcase-status"
      >
        暂无周报，
        <router-link to="/workbench/publish">去工作台发布</router-link>
      </div>
      <div v-else-if="currentReport && currentWeek" class="content-area">
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
