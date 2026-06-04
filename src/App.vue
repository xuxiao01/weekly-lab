<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  defaultWeeklyReports,
  defaultMeta,
  type WeeklyReport,
} from './data/weeklyReports'
import WeeklyContent from './components/WeeklyContent.vue'
import PageNavigation from './components/PageNavigation.vue'
import AppToolbar from './components/AppToolbar.vue'
import MarkdownPastePanel from './components/MarkdownPastePanel.vue'
import { usePageTransition } from './composables/usePageTransition'
import { parseWeeklyMd, metaFromReports } from './utils/parseWeeklyMd'
import { loadReports, saveReports } from './utils/weeklyReportStorage'

const MARKDOWN_DRAFT_KEY = 'weekly-showcase-markdown-draft'

type ViewMode = 'showcase' | 'paste'

const viewMode = ref<ViewMode>('showcase')
const markdownDraft = ref('')
const parseError = ref('')
const reports = ref<WeeklyReport[]>(loadReports(defaultWeeklyReports))
const currentIndex = ref(0)
const contentRef = ref<HTMLElement | null>(null)

const totalPages = computed(() => reports.value.length)

const currentReport = computed(() => reports.value[currentIndex.value]!)
const reportMeta = computed(
  () => `2026 年${currentReport.value.weekLabel} · ${currentReport.value.shortDateRange}`,
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

onMounted(() => {
  const saved = sessionStorage.getItem(MARKDOWN_DRAFT_KEY)
  if (saved !== null) {
    markdownDraft.value = saved
  }

  if (currentIndex.value >= reports.value.length) {
    currentIndex.value = 0
  }
})

watch(markdownDraft, (value) => {
  sessionStorage.setItem(MARKDOWN_DRAFT_KEY, value)
})

watch(totalPages, (len) => {
  if (currentIndex.value >= len) {
    currentIndex.value = Math.max(0, len - 1)
  }
})

function toggleViewMode() {
  viewMode.value = viewMode.value === 'showcase' ? 'paste' : 'showcase'
  if (viewMode.value === 'paste') {
    parseError.value = ''
  }
}

function handleSubmit() {
  const meta = metaFromReports(reports.value, defaultMeta)
  const result = parseWeeklyMd(markdownDraft.value, meta)

  if (!result.ok) {
    parseError.value = result.message
    return
  }

  parseError.value = ''
  reports.value = result.data
  saveReports(result.data)
  currentIndex.value = 0
  viewMode.value = 'showcase'
}
</script>

<template>
  <div class="app">
    <AppToolbar :mode="viewMode" @toggle="toggleViewMode" />

    <header class="site-header">
      <template v-if="viewMode === 'showcase'">
        <h1 class="site-title">
          <span>{{ currentReport.partLabel }}｜</span>
          <span class="site-title-accent">{{ currentReport.title }}</span>
        </h1>
        <p class="site-meta">{{ reportMeta }}</p>
      </template>
      <template v-else>
        <h1 class="site-title">
          <span class="site-title-accent">粘贴 Markdown</span>
        </h1>
        <p class="site-meta">编辑草稿</p>
      </template>
    </header>

    <div v-if="viewMode === 'showcase'" ref="contentRef" class="content-area">
      <WeeklyContent :report="currentReport" />
    </div>
    <div v-else class="content-area">
      <MarkdownPastePanel
        v-model="markdownDraft"
        :error="parseError"
        @submit="handleSubmit"
      />
    </div>

    <PageNavigation
      v-if="viewMode === 'showcase'"
      :can-prev="canGoPrev"
      :can-next="canGoNext"
      @prev="goPrev"
      @next="goNext"
    />
  </div>
</template>
