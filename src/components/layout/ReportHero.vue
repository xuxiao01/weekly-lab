<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <header class="report-hero">
    <h1 class="report-title">{{ title }}</h1>
    <div class="hero-divider" aria-hidden="true" />
  </header>
</template>
