<script setup lang="ts">
import WorkflowStep from './WorkflowStep.vue'
import type {
  WorkflowStep as WorkflowStepData,
  WorkflowVariant,
} from './workflow'

defineProps<{
  title: string
  variant: WorkflowVariant
  steps: WorkflowStepData[]
}>()
</script>

<template>
  <section class="workflow-lane" :class="`workflow-lane--${variant}`">
    <header class="workflow-laneHead">
      <strong>{{ title }}</strong>
    </header>

    <div class="workflow-grid">
      <WorkflowStep
        v-for="(step, index) in steps"
        :key="`${variant}-${step.stage}`"
        :step="step"
        :variant="variant"
        :is-last="index === steps.length - 1"
      />
    </div>
  </section>
</template>

<style scoped>
.workflow-lane {
  min-width: 0;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: clamp(7px, 0.5cqw, 10px);
}

.workflow-laneHead {
  min-height: clamp(24px, 1.6cqw, 31px);
  display: flex;
  align-items: center;
  gap: clamp(8px, 0.55cqw, 11px);
  padding-left: clamp(2px, 0.18cqw, 4px);
}

.workflow-laneHead::after {
  content: '';
  width: clamp(34px, 2.5cqw, 48px);
  border-top: 2px solid #aebbb6;
}

.workflow-laneHead strong {
  color: #5d716d;
  font-size: clamp(16px, 1.05cqw, 20px);
  font-weight: 880;
}

.workflow-lane--new .workflow-laneHead strong {
  color: #145c53;
}

.workflow-lane--new .workflow-laneHead::after {
  border-top-color: #145c53;
}

.workflow-grid {
  min-width: 0;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}
</style>
