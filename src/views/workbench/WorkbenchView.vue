<script setup lang="ts">
import logoUrl from '@/assets/images/weekly-lab-logo.png'
</script>

<template>
  <div class="workbench-page">
    <header class="workbench-header">
      <router-link to="/" class="workbench-logo">
        <img :src="logoUrl" alt="Weekly Lab" width="28" height="28" />
        <span>Weekly Lab</span>
      </router-link>
    </header>

    <main class="workbench-main">
      <h1 class="workbench-title">工作台</h1>
      <p class="workbench-desc">开发中，敬请期待。</p>
      <router-link to="/" class="workbench-back">返回展示页</router-link>
    </main>
  </div>
</template>

<style scoped>
.workbench-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6fffa 0%, #ffffff 100%);
}

.workbench-header {
  height: 64px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
}

.workbench-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #111827;
  font-weight: 700;
}

.workbench-main {
  max-width: 640px;
  margin: 80px auto 0;
  padding: 0 24px;
  text-align: center;
}

.workbench-title {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 12px;
}

.workbench-desc {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px;
}

.workbench-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  background: #0f766e;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s;
}

.workbench-back:hover {
  background: #047857;
}
</style>
