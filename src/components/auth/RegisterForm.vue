<script setup lang="ts">
import { ref } from 'vue'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { register } from '@/services/auth'
import { HttpError } from '@/types/http'

interface RegisterFormModel {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const emit = defineEmits<{
  switchMode: [mode: 'login']
}>()

const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formModel = ref<RegisterFormModel>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'input'] },
    {
      min: 2,
      max: 30,
      message: '用户名长度为 2 到 30 位',
      trigger: ['blur', 'input'],
    },
  ],
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
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: ['blur', 'input'] },
    {
      validator: (_rule, value: string) => {
        if (!value) return true
        return value === formModel.value.password
      },
      message: '两次输入的密码不一致',
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
    await register({
      username: formModel.value.username,
      email: formModel.value.email,
      password: formModel.value.password,
    })
    message.success('注册成功，请登录')
    emit('switchMode', 'login')
  } catch (error) {
    const fallback = '注册失败，请稍后重试'
    message.error(error instanceof HttpError ? error.message : fallback)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="authCardBody">
    <h2 class="authCardTitle">注册 Weekly Lab</h2>
    <p class="authCardSubtitle">创建账号，开始沉淀你的每周进展</p>

    <n-form
      ref="formRef"
      class="authForm"
      :model="formModel"
      :rules="rules"
      @keyup.enter="handleSubmit"
    >
      <n-form-item path="username" label="用户名">
        <n-input
          v-model:value="formModel.username"
          placeholder="请输入用户名"
          size="large"
        />
      </n-form-item>

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

      <n-form-item path="confirmPassword" label="确认密码">
        <n-input
          v-model:value="formModel.confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="请再次输入密码"
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
        创建账号
      </n-button>
    </n-form>

    <p class="authSwitch">
      已有账号？
      <button type="button" class="authFooterBtn" @click="emit('switchMode', 'login')">
        去登录
      </button>
    </p>
  </div>
</template>
