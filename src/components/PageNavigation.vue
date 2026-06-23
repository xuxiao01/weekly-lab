<script setup lang="ts">
import ArrowRightIcon from '../assets/svgs/ArrowRightIcon.vue'

defineProps<{
  canPrev: boolean
  canNext: boolean
}>()

const emit = defineEmits<{
  prev: []
  next: []
}>()
</script>

<template>
  <nav class="report-pager">
    <button
      type="button"
      class="report-pager-btn report-pager-btn--prev"
      :disabled="!canPrev"
      @click="emit('prev')"
    >
      <ArrowRightIcon
        class="report-pager-icon report-pager-icon--prev"
        :size="15"
        color="currentColor"
        title="上一页"
      />
      <span>上一页</span>
    </button>
    <button
      type="button"
      class="report-pager-btn report-pager-btn--next"
      :disabled="!canNext"
      @click="emit('next')"
    >
      <span>下一页</span>
      <ArrowRightIcon
        class="report-pager-icon"
        :size="15"
        color="currentColor"
        title="下一页"
      />
    </button>
  </nav>
</template>
