<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

type AuthMode = 'login' | 'register'

const route = useRoute()
const router = useRouter()

const mode = computed<AuthMode>(() =>
  route.query.mode === 'register' ? 'register' : 'login',
)

function setMode(next: AuthMode) {
  if (next === 'register') {
    router.replace({ path: '/login', query: { mode: 'register' } })
    return
  }
  router.replace({ path: '/login' })
}

function switchToRegister() {
  setMode('register')
}

function switchToLogin() {
  setMode('login')
}
</script>

<template>
  <AuthLayout>
    <LoginForm
      v-if="mode === 'login'"
      key="login"
      @switch-mode="switchToRegister"
    />
    <RegisterForm v-else key="register" @switch-mode="switchToLogin" />
  </AuthLayout>
</template>
