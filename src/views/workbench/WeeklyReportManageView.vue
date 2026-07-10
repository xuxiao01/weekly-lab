<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDialog, useMessage } from 'naive-ui'
import logoUrl from '@/assets/images/weekly-lab-logo.png'
import ArrowRightIcon from '@/assets/svgs/ArrowRightIcon.vue'
import { getStoredUser } from '@/services/auth'
import { getCurrentUser } from '@/services/user'
import {
  deleteMyWeeklyReport,
  getMyWeeklyReport,
  listMyWeeklyReports,
  saveMyWeeklyReport,
  updateWeeklyPublicSettings,
} from '@/services/weeklyReport'
import type { WeeklyReportListItem } from '@/types/weeklyReport'
import { HttpError } from '@/types/http'
import { detailToPutPayload } from '@/utils/weeklyReportMarkdown'
import '@/styles/workbench.css'

const dialog = useDialog()
const message = useMessage()

const reports = ref<WeeklyReportListItem[]>([])
const loading = ref(true)
const loadError = ref('')
const sharingWeekKey = ref('')
const deletingWeekKey = ref('')

const hasReports = computed(() => reports.value.length > 0)

function formatUpdatedAt(value: string) {
  if (!value) return '未知'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function shareUrl(username: string, weekKey: string) {
  const base = import.meta.env.BASE_URL
  return `${window.location.origin}${base}share/${encodeURIComponent(username)}/${encodeURIComponent(weekKey)}`
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

async function ensureUsername() {
  const stored = getStoredUser()
  if (stored?.username) return stored.username
  const user = await getCurrentUser()
  return user.username
}

async function loadReports() {
  loading.value = true
  loadError.value = ''
  try {
    reports.value = await listMyWeeklyReports()
  } catch (error) {
    loadError.value =
      error instanceof HttpError ? error.message : '加载周报失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

function confirmDelete(report: WeeklyReportListItem) {
  dialog.warning({
    title: '删除周报',
    content: `确定删除「${report.weekLabel}」吗？删除后无法在工作台恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      deletingWeekKey.value = report.id
      try {
        await deleteMyWeeklyReport(report.id)
        reports.value = reports.value.filter((item) => item.id !== report.id)
        message.success('周报已删除')
      } catch (error) {
        message.error(
          error instanceof HttpError ? error.message : '删除失败，请稍后重试。',
        )
      } finally {
        deletingWeekKey.value = ''
      }
    },
  })
}

async function generateShareLink(report: WeeklyReportListItem) {
  sharingWeekKey.value = report.id
  try {
    const username = await ensureUsername()
    await updateWeeklyPublicSettings(true)

    if (!report.isPublished) {
      const detail = await getMyWeeklyReport(report.id)
      await saveMyWeeklyReport(report.id, detailToPutPayload(detail, true))
      reports.value = reports.value.map((item) =>
        item.id === report.id ? { ...item, isPublished: true } : item,
      )
    }

    await copyText(shareUrl(username, report.id))
    message.success('分享链接已复制')
  } catch (error) {
    message.error(
      error instanceof HttpError ? error.message : '生成分享链接失败，请稍后重试。',
    )
  } finally {
    sharingWeekKey.value = ''
  }
}

function confirmShare(report: WeeklyReportListItem) {
  if (report.isPublished) {
    void generateShareLink(report)
    return
  }

  dialog.info({
    title: '生成分享链接',
    content: '生成链接会开启个人周报公开开关，并公开当前这一周。获得链接的人无需登录即可查看。',
    positiveText: '公开并复制',
    negativeText: '取消',
    onPositiveClick: () => generateShareLink(report),
  })
}

onMounted(() => {
  void loadReports()
})
</script>

<template>
  <div class="workbench-page">
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
      <div class="workbench-hero">
        <h1 class="workbench-title">周报管理工具</h1>
        <p class="workbench-desc">查看、编辑、删除周报，并生成公开分享链接</p>
      </div>

      <section class="workbench-section workbench-section--flush">
        <div class="workbench-sectionHead">
          <div>
            <h2 class="workbench-sectionTitle">我的周报</h2>
            <p class="workbench-sectionDesc">管理已发布的周报，或复制分享链接</p>
          </div>
          <button
            type="button"
            class="workbench-secondaryBtn"
            :disabled="loading"
            @click="loadReports"
          >
            刷新
          </button>
        </div>

        <div v-if="loading" class="workbench-inlineStatus">加载周报中...</div>
        <div v-else-if="loadError" class="workbench-inlineStatus workbench-inlineStatus--error">
          <span>{{ loadError }}</span>
          <button type="button" class="workbench-textBtn" @click="loadReports">重试</button>
        </div>
        <div v-else-if="!hasReports" class="workbench-empty">
          <h3>还没有周报</h3>
          <p>先用 Markdown 发布一份周报，它会出现在这里。</p>
          <router-link to="/workbench/publish" class="workbench-primaryBtn">
            去发布
          </router-link>
        </div>
        <div v-else class="workbench-reportList">
          <article
            v-for="report in reports"
            :key="report.id"
            class="workbench-reportRow"
          >
            <div class="workbench-reportMain">
              <div class="workbench-reportTitleLine">
                <h3>{{ report.weekLabel }}</h3>
                <span
                  class="workbench-statusBadge"
                  :class="{ 'workbench-statusBadge--public': report.isPublished }"
                >
                  {{ report.isPublished ? '已公开' : '未公开' }}
                </span>
              </div>
              <p>{{ report.dateRange }}</p>
              <div class="workbench-reportMeta">
                <span>{{ report.reportCount }} 页</span>
                <span>更新于 {{ formatUpdatedAt(report.updatedAt) }}</span>
              </div>
            </div>
            <div class="workbench-reportActions">
              <router-link
                class="workbench-actionBtn"
                :to="{ path: '/', query: { week: report.id } }"
              >
                预览
              </router-link>
              <router-link
                class="workbench-actionBtn"
                :to="{ path: '/workbench/publish', query: { week: report.id } }"
              >
                编辑
              </router-link>
              <button
                type="button"
                class="workbench-actionBtn"
                :disabled="sharingWeekKey === report.id"
                @click="confirmShare(report)"
              >
                {{ sharingWeekKey === report.id ? '生成中' : '分享' }}
              </button>
              <button
                type="button"
                class="workbench-actionBtn workbench-actionBtn--danger"
                :disabled="deletingWeekKey === report.id"
                @click="confirmDelete(report)"
              >
                {{ deletingWeekKey === report.id ? '删除中' : '删除' }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
