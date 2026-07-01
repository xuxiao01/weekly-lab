<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  description: string
  iconTone: 'green' | 'blue' | 'orange' | 'purple' | 'image'
  to?: string
  disabled?: boolean
  actionLabel?: string
}>()
</script>

<template>
  <article class="workbenchToolCard">
    <div class="workbenchToolCardHead">
      <span
        class="workbenchToolCardIcon"
        :class="`workbenchToolCardIcon--${iconTone}`"
        aria-hidden="true"
      >
        <slot name="icon" />
      </span>
      <h2 class="workbenchToolCardTitle">{{ title }}</h2>
    </div>
    <p class="workbenchToolCardDesc">{{ description }}</p>
    <RouterLink
      v-if="to && !disabled"
      :to="to"
      class="workbenchToolCardAction"
    >
      {{ actionLabel ?? '进入 →' }}
    </RouterLink>
    <span v-else class="workbenchToolCardAction workbenchToolCardAction--disabled">
      即将开放 →
    </span>
  </article>
</template>
