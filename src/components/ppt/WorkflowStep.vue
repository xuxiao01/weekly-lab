<script setup lang="ts">
import type {
  WorkflowStep as WorkflowStepData,
  WorkflowVariant,
} from './workflow'

defineProps<{
  step: WorkflowStepData
  variant: WorkflowVariant
  isLast: boolean
}>()
</script>

<template>
  <div class="workflow-step" :class="`workflow-step--${variant}`">
    <article class="workflow-node">
      <h4>{{ step.title }}</h4>
      <p>{{ step.description }}</p>
      <small>{{ step.tag }}</small>
    </article>

    <div class="workflow-arrow" aria-hidden="true">
      <span v-if="!isLast"><i></i><b>›</b></span>
    </div>
  </div>
</template>

<style scoped>
.workflow-step {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--workflow-arrow-width);
  align-items: stretch;
}

.workflow-node {
  min-width: 0;
  height: 100%;
  min-height: clamp(132px, 8.6cqw, 166px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-content: stretch;
  gap: clamp(7px, 0.48cqw, 9px);
  padding: clamp(16px, 1.08cqw, 21px) clamp(12px, 0.8cqw, 16px);
  border: 1px solid rgba(112, 133, 128, 0.48);
  border-radius: clamp(9px, 0.62cqw, 12px);
  background: rgba(255, 255, 255, 0.72);
}

.workflow-node h4 {
  min-width: 0;
  overflow: hidden;
  margin: 0;
  color: #294743;
  font-size: clamp(16px, 1.05cqw, 20px);
  font-weight: 850;
  line-height: 1.22;
  text-align: left;
  text-overflow: clip;
  white-space: nowrap;
}

.workflow-node p {
  min-width: 0;
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #667a76;
  font-size: clamp(14px, 0.92cqw, 18px);
  font-weight: 650;
  line-height: 1.4;
  text-align: left;
  text-overflow: clip;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.workflow-node small {
  display: flex;
  align-items: center;
  gap: clamp(5px, 0.34cqw, 7px);
  color: #bd5b38;
  font-size: clamp(11px, 0.7cqw, 14px);
  font-weight: 800;
  line-height: 1.25;
  white-space: nowrap;
}

.workflow-node small::before {
  content: '';
  width: clamp(5px, 0.34cqw, 7px);
  height: clamp(5px, 0.34cqw, 7px);
  flex: 0 0 auto;
  border-radius: 50%;
  background: #ee764d;
}

.workflow-arrow {
  display: grid;
  place-items: center;
}

.workflow-arrow span {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(4px, 1fr) auto;
  align-items: center;
  color: #93a29e;
}

.workflow-arrow i {
  border-top: 1px solid currentColor;
}

.workflow-arrow b {
  margin-top: -0.08em;
  font-size: clamp(14px, 0.92cqw, 18px);
  font-weight: 800;
  line-height: 1;
}

.workflow-step--new .workflow-node h4 {
  color: #123f39;
}

.workflow-step--new .workflow-node {
  border-color: rgba(20, 92, 83, 0.72);
  background: rgba(234, 247, 238, 0.92);
  box-shadow: 0 0.35cqw 0.9cqw rgba(20, 92, 83, 0.06);
}

.workflow-step--new .workflow-node p {
  color: #4d6b67;
}

.workflow-step--new .workflow-node small {
  color: #145c53;
}

.workflow-step--new .workflow-node small::before {
  background: #145c53;
}

.workflow-step--new .workflow-arrow span {
  color: #145c53;
}
</style>
