<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import logoUrl from '@/assets/images/weekly-lab-logo.png'
import MarkdownPastePanel from '@/components/MarkdownPastePanel.vue'
import { useWeeklyReportImport } from '@/composables/useWeeklyReportImport'
import ArrowRightIcon from '@/assets/svgs/ArrowRightIcon.vue'
import '@/styles/workbench.css'

const router = useRouter()
const message = useMessage()
const submitting = ref(false)

const {
  markdownDraft,
  parseError,
  importYear,
  importWeekNumber,
  importStartDate,
  importEndDate,
  isPublished,
  handleSubmit,
} = useWeeklyReportImport()

async function onSubmit() {
  if (submitting.value) return

  submitting.value = true
  try {
    const result = await handleSubmit()
    if (!result.ok) return

    message.success('周报发布成功')
    await router.push({ path: '/', query: { week: result.weekId } })
  } finally {
    submitting.value = false
  }
}

function onCancel() {
  router.push('/workbench')
}
</script>

<template>
  <div class="workbench-page workbench-publish-page">
    <header class="workbench-header">
      <router-link to="/" class="workbench-logo">
        <img :src="logoUrl" alt="Weekly Lab" width="28" height="28" />
        <span>Weekly Lab</span>
      </router-link>
      <router-link to="/workbench" class="workbench-headerLink">
        <ArrowRightIcon
          class="workbench-headerLink-icon"
          :size="14"
          color="currentColor"
          title="返回工作台"
        />
        <span>工作台</span>
      </router-link>
    </header>

    <main class="workbench-main">
      <div class="workbench-publishCard">
        <MarkdownPastePanel
          v-model="markdownDraft"
          v-model:year="importYear"
          v-model:week-number="importWeekNumber"
          v-model:start-date="importStartDate"
          v-model:end-date="importEndDate"
          v-model:is-published="isPublished"
          :error="parseError"
          :submitting="submitting"
          @cancel="onCancel"
          @submit="onSubmit"
        />
      </div>
    </main>
  </div>
</template>
