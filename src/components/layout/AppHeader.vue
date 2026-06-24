<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import logoUrl from '../../assets/images/weekly-lab-logo.png'
import { isAuthenticated } from '@/services/auth'

const route = useRoute()
const loggedIn = ref(isAuthenticated())

function syncAuthState() {
  loggedIn.value = isAuthenticated()
}

onMounted(() => {
  syncAuthState()
  window.addEventListener('storage', syncAuthState)
})

onUnmounted(() => {
  window.removeEventListener('storage', syncAuthState)
})

watch(() => route.fullPath, syncAuthState)
</script>

<template>
  <header class="app-header">
    <div class="logo">
      <img class="logo-icon" :src="logoUrl" alt="Weekly Lab" width="28" height="28" />
      <span class="logo-text">Weekly Lab</span>
    </div>
    <div class="app-header-actions">
      <router-link v-if="!loggedIn" to="/login" class="header-login-btn">
        登录
      </router-link>
      <router-link v-else to="/workbench" class="header-workbench-btn">
        工作台
      </router-link>
    </div>
  </header>
</template>
