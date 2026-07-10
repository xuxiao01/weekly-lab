<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import logoUrl from '@/assets/images/weekly-lab-logo.png'
import MarkdownPastePanel from '@/components/MarkdownPastePanel.vue'
import { useWeeklyReportImport } from '@/composables/useWeeklyReportImport'
import ArrowRightIcon from '@/assets/svgs/ArrowRightIcon.vue'
import '@/styles/workbench.css'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const submitting = ref(false)
const editWeekKey = computed(() =>
  typeof route.query.week === 'string' ? route.query.week : '',
)
const isEditMode = computed(() => Boolean(editWeekKey.value))

const {
  markdownDraft,
  parseError,
  editLoading,
  editLoadError,
  importYear,
  importWeekNumber,
  importStartDate,
  importEndDate,
  isPublished,
  handleSubmit,
} = useWeeklyReportImport({ editWeekKey })

const visibleError = computed(() => editLoadError.value || parseError.value)

async function onSubmit() {
  if (submitting.value) return

  submitting.value = true
  try {
    const result = await handleSubmit()
    if (!result.ok) return

    message.success(isEditMode.value ? '周报已更新' : '周报发布成功')
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
        <div v-if="editLoading" class="workbench-inlineStatus">加载周报中...</div>
        <MarkdownPastePanel
          v-else
          v-model="markdownDraft"
          v-model:year="importYear"
          v-model:week-number="importWeekNumber"
          v-model:start-date="importStartDate"
          v-model:end-date="importEndDate"
          v-model:is-published="isPublished"
          :title="isEditMode ? '编辑 Markdown 周报' : '粘贴 Markdown'"
          :hint="isEditMode ? '已从当前周报生成 Markdown，修改后会覆盖保存这一周。' : undefined"
          :submit-label="isEditMode ? '保存修改' : '确认导入'"
          :submitting-label="isEditMode ? '保存中...' : '发布中...'"
          :meta-readonly="isEditMode"
          :error="visibleError"
          :submitting="submitting"
          @cancel="onCancel"
          @submit="onSubmit"
        />
      </div>
    </main>
  </div>
</template>
