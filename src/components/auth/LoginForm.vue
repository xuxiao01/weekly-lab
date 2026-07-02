<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { login } from '@/services/auth'
import { HttpError } from '@/types/http'
import type { LoginParams } from '@/types/auth'

const emit = defineEmits<{
  switchMode: [mode: 'register']
}>()

const router = useRouter()
const route = useRoute()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formModel = ref<LoginParams>({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: ['blur', 'input'] },
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: ['blur', 'input'],
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'input'] },
    {
      min: 6,
      message: '密码至少 6 位',
      trigger: ['blur', 'input'],
    },
  ],
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await login(formModel.value)
    message.success('登录成功')
    const redirect = route.query.redirect
    if (typeof redirect === 'string' && redirect.startsWith('/')) {
      await router.push(redirect)
    } else {
      await router.push('/workbench')
    }
  } catch (error) {
    const fallback = '登录失败，请检查邮箱或密码'
    message.error(error instanceof HttpError ? error.message : fallback)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="authCardBody">
    <h2 class="authCardTitle">登录 Weekly Lab</h2>
    <p class="authCardSubtitle">欢迎回来，继续记录你的每周进展</p>

    <n-form
      ref="formRef"
      class="authForm"
      :model="formModel"
      :rules="rules"
      @keyup.enter="handleSubmit"
    >
      <n-form-item path="email" label="邮箱">
        <n-input
          v-model:value="formModel.email"
          placeholder="请输入邮箱"
          size="large"
        />
      </n-form-item>

      <n-form-item path="password" label="密码">
        <n-input
          v-model:value="formModel.password"
          type="password"
          show-password-on="click"
          placeholder="请输入密码"
          size="large"
        />
      </n-form-item>

      <n-button
        type="primary"
        block
        size="large"
        :loading="loading"
        @click="handleSubmit"
      >
        登录
      </n-button>
    </n-form>

    <p class="authSwitch">
      还没有账号？
      <button type="button" class="authFooterBtn" @click="emit('switchMode', 'register')">
        创建账号
      </button>
    </p>
  </div>
</template>
