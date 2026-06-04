<script setup lang="ts">
defineProps<{
  error?: string
}>()

const model = defineModel<string>({ required: true })

const emit = defineEmits<{
  submit: []
}>()

const placeholder = `# 小程序开发

## 本周完成
- 条目一
- 条目二

## 未来展望
- 计划一

# 游戏试玩平台开发
...`
</script>

<template>
  <div class="markdown-paste">
    <p class="markdown-paste-hint">
      每个「# 标题」为一页，使用「## 本周完成」「## 未来展望」与列表项（- 开头）。
    </p>
    <textarea
      v-model="model"
      class="markdown-textarea"
      :placeholder="placeholder"
      spellcheck="false"
    />
    <div class="markdown-paste-actions">
      <p v-if="error" class="markdown-parse-error" role="alert">{{ error }}</p>
      <button type="button" class="markdown-submit-btn" @click="emit('submit')">
        提交
      </button>
    </div>
  </div>
</template>
