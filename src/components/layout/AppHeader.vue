<script setup lang="ts">
import logoUrl from '../../assets/images/weekly-lab-logo.png'

function showComingSoon() {
  window.alert('即将开放')
}
</script>

<template>
  <header class="app-header">
    <div class="logo">
      <img class="logo-icon" :src="logoUrl" alt="Weekly Lab" width="28" height="28" />
      <span class="logo-text">Weekly Lab</span>
    </div>
    <div class="app-header-actions">
      <button
        type="button"
        class="header-login-btn"
        title="即将开放"
        @click="showComingSoon"
      >
        登录
      </button>
      <button
        type="button"
        class="header-workbench-btn"
        title="即将开放"
        @click="showComingSoon"
      >
        工作台
      </button>
    </div>
  </header>
</template>
