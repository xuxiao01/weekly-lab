<script setup lang="ts">
import logoUrl from '@/assets/images/weekly-lab-logo.png'
import markdownIconUrl from '@/assets/images/line-Markdown.png'
import { EaselOutline } from '@vicons/ionicons5'
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
        <p class="workbench-desc">选择工具，发布和管理你的内容</p>
      </div>

      <div class="workbench-grid workbench-grid--tools">
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
        <WorkbenchToolCard
          title="周报管理工具"
          description="查看、编辑、删除周报，并生成公开分享链接"
          icon-tone="blue"
          to="/workbench/reports"
          action-label="进入管理 →"
        >
          <template #icon>
            <svg
              class="workbenchToolCardSvg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M8 3h8l4 4v14H4V3h4Z" />
              <path d="M16 3v5h5" />
              <path d="M8 13h8" />
              <path d="M8 17h5" />
            </svg>
          </template>
        </WorkbenchToolCard>
        <WorkbenchToolCard
          title="PPT 发布工具"
          description="查看已创建的 PPT，并进入演示页面"
          icon-tone="orange"
          to="/workbench/ppts"
          action-label="进入工具 →"
        >
          <template #icon>
            <EaselOutline class="workbenchToolCardSvg" />
          </template>
        </WorkbenchToolCard>
      </div>
    </main>
  </div>
</template>
