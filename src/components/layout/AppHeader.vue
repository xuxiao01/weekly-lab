<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import logoUrl from '../../assets/images/weekly-lab-logo.png'
import { useClickOutside } from '@/composables/useClickOutside'
import { getStoredUser, isAuthenticated, logout } from '@/services/auth'
import type { UserInfo } from '@/types/user'

const route = useRoute()

const loggedIn = ref(isAuthenticated())
const currentUser = ref<UserInfo | null>(getStoredUser())
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const displayName = computed(() => currentUser.value?.username ?? '用户')

function syncAuthState() {
  loggedIn.value = isAuthenticated()
  currentUser.value = getStoredUser()
  if (!loggedIn.value) {
    userMenuOpen.value = false
  }
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function handleLogout() {
  userMenuOpen.value = false
  logout()
  window.location.assign(import.meta.env.BASE_URL)
}

useClickOutside(userMenuRef, () => {
  userMenuOpen.value = false
})

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
      <template v-else>
        <div ref="userMenuRef" class="header-user-menu">
          <button
            type="button"
            class="header-user-trigger"
            :aria-expanded="userMenuOpen"
            aria-haspopup="menu"
            @click="toggleUserMenu"
          >
            <span class="header-user-name">{{ displayName }}</span>
            <span
              class="header-user-chevron"
              :class="{ 'is-open': userMenuOpen }"
              aria-hidden="true"
            >▾</span>
          </button>
          <div v-show="userMenuOpen" class="header-user-dropdown" role="menu">
            <button type="button" role="menuitem" @click="handleLogout">
              退出登录
            </button>
          </div>
        </div>
        <router-link to="/workbench" class="header-workbench-btn">
          工作台
        </router-link>
      </template>
    </div>
  </header>
</template>
