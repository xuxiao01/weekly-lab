<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { WeeklyReportWeek } from '@/data/weeklyReports'
import PageNavigation from '@/components/PageNavigation.vue'
import ReportHero from '@/components/layout/ReportHero.vue'
import ReportMetaBar from '@/components/layout/ReportMetaBar.vue'
import WeeklyContent from '@/components/WeeklyContent.vue'
import { usePageTransition } from '@/composables/usePageTransition'
import { yearFromDateRange } from '@/composables/useWeeklyReportImport'
import { getPublicWeeklyReport } from '@/services/weeklyReport'
import { HttpError } from '@/types/http'
import { apiDetailToWeek } from '@/utils/weeklyReportApiMapper'

const route = useRoute()
const week = ref<WeeklyReportWeek | null>(null)
const loading = ref(true)
const loadError = ref('')
const currentPageIndex = ref(0)
const contentRef = ref<HTMLElement | null>(null)

const username = computed(() =>
  typeof route.params.username === 'string' ? route.params.username : '',
)
const weekKey = computed(() =>
  typeof route.params.weekKey === 'string' ? route.params.weekKey : '',
)
const reports = computed(() => week.value?.reports ?? [])
const totalPages = computed(() => reports.value.length)
const currentIndex = computed({
  get: () => Math.min(currentPageIndex.value, Math.max(0, totalPages.value - 1)),
  set: (index) => {
    currentPageIndex.value = index
  },
})
const currentReport = computed(() => reports.value[currentIndex.value] ?? null)
const reportMeta = computed(() => {
  if (!week.value) return ''
  return `${yearFromDateRange(week.value.dateRange)} 年${week.value.weekLabel} · ${week.value.shortDateRange}`
})

const { isAnimating, goNext, goPrev } = usePageTransition(
  contentRef,
  currentIndex,
  totalPages,
)

const canGoPrev = computed(() => currentIndex.value > 0 && !isAnimating.value)
const canGoNext = computed(
  () => currentIndex.value < totalPages.value - 1 && !isAnimating.value,
)

async function loadPublicReport() {
  loading.value = true
  loadError.value = ''
  try {
    const detail = await getPublicWeeklyReport(username.value, weekKey.value)
    week.value = apiDetailToWeek(detail)
  } catch (error) {
    loadError.value =
      error instanceof HttpError
        ? error.message
        : '这份周报暂时无法访问。'
    week.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadPublicReport()
})
</script>

<template>
  <div class="app showcase-page public-share-page">
    <div class="showcase-main">
      <div v-if="loading" class="showcase-status">加载周报中...</div>
      <div v-else-if="loadError" class="showcase-status showcase-status--error">
        {{ loadError }}
      </div>
      <div v-else-if="currentReport && week" class="content-area">
        <ReportHero :title="currentReport.title" />
        <div class="report-content">
          <ReportMetaBar
            :meta="reportMeta"
            :weeks="[week]"
            :current-week-id="week.id"
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
      <div v-else class="showcase-status">这份周报暂无内容。</div>
    </div>
  </div>
</template>
