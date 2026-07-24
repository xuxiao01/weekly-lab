<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import logoUrl from '@/assets/images/weekly-lab-logo.png'
import ArrowRightIcon from '@/assets/svgs/ArrowRightIcon.vue'
import { presentations } from '@/data/presentations'
import '@/styles/workbench.css'

const router = useRouter()
const message = useMessage()
const sharingPresentationId = ref('')

function formatUpdatedAt(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function publicPresentationUrl(presentationId: string) {
  const path = router.resolve({
    name: 'PublicPptShowcase',
    params: { pptId: presentationId },
  }).href
  return new URL(`${import.meta.env.BASE_URL}${path}`, window.location.origin).toString()
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

async function sharePresentation(presentationId: string) {
  sharingPresentationId.value = presentationId
  try {
    await copyText(publicPresentationUrl(presentationId))
    message.success('公开分享链接已复制，获得链接的人无需登录即可查看')
  } catch {
    message.error('复制分享链接失败，请稍后重试')
  } finally {
    sharingPresentationId.value = ''
  }
}
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
        <h1 class="workbench-title">PPT 发布工具</h1>
        <p class="workbench-desc">查看已创建的 PPT，并进入演示页面</p>
      </div>

      <section class="workbench-section workbench-section--flush">
        <div class="workbench-sectionHead">
          <div>
            <h2 class="workbench-sectionTitle">我的 PPT</h2>
            <p class="workbench-sectionDesc">选择一份 PPT 进入展示页面</p>
          </div>
        </div>

        <div class="workbench-reportList">
          <article
            v-for="presentation in presentations"
            :key="presentation.id"
            class="workbench-reportRow"
          >
            <div class="workbench-reportMain">
              <div class="workbench-reportTitleLine">
                <h3>{{ presentation.title }}</h3>
                <span class="workbench-statusBadge workbench-statusBadge--ppt">
                  已创建
                </span>
              </div>
              <div class="workbench-reportMeta">
                <span>{{ presentation.slideCount }} 页</span>
                <span>更新于 {{ formatUpdatedAt(presentation.updatedAt) }}</span>
              </div>
            </div>
            <div class="workbench-reportActions">
              <button
                type="button"
                class="workbench-actionBtn"
                :disabled="sharingPresentationId === presentation.id"
                @click="sharePresentation(presentation.id)"
              >
                {{ sharingPresentationId === presentation.id ? '复制中' : '分享' }}
              </button>
              <router-link
                class="workbench-actionBtn workbench-actionBtn--primary"
                :to="`/workbench/ppts/${presentation.id}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                进入
              </router-link>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
