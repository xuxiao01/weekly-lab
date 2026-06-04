<script setup lang="ts">
defineProps<{
  mode: 'showcase' | 'paste'
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div class="app-toolbar">
    <button type="button" class="toolbar-btn" @click="emit('toggle')">
      {{ mode === 'showcase' ? '粘贴 Markdown' : '返回展示' }}
    </button>
  </div>
</template>
