<script setup lang="ts">
import { ref } from 'vue'
import type { WeeklyReportWeek } from '../../data/weeklyReports'
import { useClickOutside } from '../../composables/useClickOutside'

defineProps<{
  weeks: WeeklyReportWeek[]
  currentWeekId: string
}>()

const emit = defineEmits<{
  selectWeek: [weekId: string]
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function select(weekId: string) {
  emit('selectWeek', weekId)
  close()
}

useClickOutside(rootRef, () => {
  if (isOpen.value) close()
})
</script>

<template>
  <div ref="rootRef" class="report-meta-wrapper">
    <div class="report-meta-bar">
      <slot name="meta" />
      <button
        type="button"
        class="week-switch-button"
        :aria-expanded="isOpen"
        aria-label="选择周次"
        @click="toggle"
      >
        <svg
          v-if="!isOpen"
          class="week-switch-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        <svg
          v-else
          class="week-switch-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>

    <div
      v-if="isOpen"
      class="week-dropdown-panel"
      role="listbox"
      aria-label="周次列表"
    >
      <button
        v-for="week in weeks"
        :key="week.id"
        type="button"
        class="week-dropdown-item"
        :class="{ 'is-active': week.id === currentWeekId }"
        role="option"
        :aria-selected="week.id === currentWeekId"
        @click="select(week.id)"
      >
        <span class="week-dropdown-week">{{ week.weekLabel }}</span>
        <span class="week-dropdown-date">{{ week.shortDateRange }}</span>
        <span v-if="week.id === currentWeekId" class="week-dropdown-current">当前</span>
      </button>
    </div>
  </div>
</template>
