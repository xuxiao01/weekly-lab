<script setup lang="ts">
import type { WeeklyReportWeek } from '../../data/weeklyReports'
import WeekPicker from './WeekPicker.vue'

defineProps<{
  meta: string
  weeks: WeeklyReportWeek[]
  currentWeekId: string
}>()

const emit = defineEmits<{
  selectWeek: [weekId: string]
}>()
</script>

<template>
  <WeekPicker
    :weeks="weeks"
    :current-week-id="currentWeekId"
    @select-week="emit('selectWeek', $event)"
  >
    <template #meta>
      <div class="report-meta-info">
        <svg
          class="report-meta-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{{ meta }}</span>
      </div>
    </template>
  </WeekPicker>
</template>
