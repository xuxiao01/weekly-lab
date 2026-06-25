<script setup lang="ts">
import { computed } from 'vue'
import { parseInlineMarkdown } from '@/utils/parseInlineMarkdown'

const props = defineProps<{
  text: string
}>()

const segments = computed(() => parseInlineMarkdown(props.text))
</script>

<template>
  <template v-for="(segment, index) in segments" :key="index">
    <span v-if="segment.type === 'text'">{{ segment.content }}</span>
    <a
      v-else
      :href="segment.href"
      target="_blank"
      rel="noopener noreferrer"
    >{{ segment.label }}</a>
  </template>
</template>
