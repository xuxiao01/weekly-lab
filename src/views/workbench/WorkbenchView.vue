<script setup lang="ts">
import logoUrl from '@/assets/images/weekly-lab-logo.png'
import markdownIconUrl from '@/assets/images/line-Markdown.png'
import ArrowRightIcon from '@/assets/svgs/ArrowRightIcon.vue'
import WorkbenchToolCard from '@/components/workbench/WorkbenchToolCard.vue'
import '@/styles/workbench.css'
</script>

<template>
  <div class="workbench-page">
    <header class="workbench-header">
      <router-link to="/" class="workbench-logo">
        <img :src="logoUrl" alt="Weekly Lab" width="28" height="28" />
        <span>Weekly Lab</span>
      </router-link>
      <router-link to="/" class="workbench-headerLink">
        <ArrowRightIcon
          class="workbench-headerLink-icon"
          :size="14"
          color="currentColor"
          title="返回展示页"
        />
        <span>展示页</span>
      </router-link>
    </header>

    <main class="workbench-main">
      <div class="workbench-hero">
        <h1 class="workbench-title">工作台</h1>
        <p class="workbench-desc">使用 Markdown 发布你的周报</p>
      </div>

      <div class="workbench-grid workbench-grid--single">
        <WorkbenchToolCard
          title="Markdown 发布工具"
          description="粘贴 Markdown，解析为周报内容并发布"
          icon-tone="image"
          to="/workbench/publish"
          action-label="进入发布 →"
        >
          <template #icon>
            <img
              class="workbenchToolCardIconImg"
              :src="markdownIconUrl"
              alt=""
            />
          </template>
        </WorkbenchToolCard>
      </div>
    </main>
  </div>
</template>
