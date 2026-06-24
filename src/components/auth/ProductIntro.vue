<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'

const sceneTags = ['组会汇报', '实习周报', '项目进展', '轻量替代 PPT']

const markdownLines = [
  '## 本周完成',
  '1. 完成登录页设计',
  '2. 优化周报展示结构',
  '## 未来展望',
  '1. 完善 Markdown 发布工具',
]

const completedItems = ['登录页设计', '周报展示结构']
const planItems = ['Markdown 发布工具']

const rootRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  if (!rootRef.value || prefersReducedMotion()) return

  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out',
        duration: 0.6,
      },
    })

    tl.from('.auth-hero-title', {
      y: 24,
      opacity: 0,
    })
      .from(
        '.auth-hero-desc',
        {
          y: 20,
          opacity: 0,
        },
        '-=0.35',
      )
      .from(
        '.auth-scene-tag',
        {
          y: 12,
          opacity: 0,
          stagger: 0.08,
        },
        '-=0.25',
      )
      .from(
        '.markdown-card',
        {
          y: 24,
          opacity: 0,
        },
        '-=0.1',
      )
      .from(
        '.markdown-line',
        {
          x: -10,
          opacity: 0,
          stagger: 0.08,
        },
        '-=0.2',
      )
      .from(
        '.flow-arrow',
        {
          x: -8,
          opacity: 0,
        },
        '-=0.1',
      )
      .from(
        '.report-preview-card',
        {
          y: 20,
          opacity: 0,
          scale: 0.98,
        },
        '-=0.15',
      )
      .set(
        ['.flow-arrow', '.report-preview-card', '.markdown-card'],
        { clearProps: 'transform' },
      )
  }, rootRef.value)
})

onBeforeUnmount(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="rootRef" class="productIntro">
    <h1 class="auth-hero-title authBrandTitle">把周报变成一页汇报</h1>
    <p class="auth-hero-desc authBrandDesc">
      写给每周组会、实习复盘和项目进展记录。<br />
      不用每次重新做 PPT，把 Markdown 内容整理成清晰的展示页。
    </p>

    <div class="authSceneTags">
      <span
        v-for="tag in sceneTags"
        :key="tag"
        class="auth-scene-tag authBrandFeature"
      >
        {{ tag }}
      </span>
    </div>

    <div class="authIntroDemo">
      <div class="demo-preview">
        <div class="demo-card markdown-card">
          <p class="demo-card-label">Markdown Notes</p>
          <div class="markdown-body">
            <p
              v-for="(line, index) in markdownLines"
              :key="index"
              class="markdown-line"
            >
              {{ line }}
            </p>
          </div>
        </div>

        <div class="demo-arrow" aria-hidden="true">
          <span class="flow-arrow">→</span>
        </div>

        <div class="demo-card report-preview-card">
          <p class="demo-card-label">Report Preview</p>
          <div class="preview-body">
            <h3 class="preview-report-title">第三周周报</h3>

            <div class="preview-section preview-section--done">
              <p class="preview-section-title">本周完成</p>
              <ul class="preview-items">
                <li
                  v-for="(item, index) in completedItems"
                  :key="`done-${index}`"
                  class="preview-item"
                >
                  <span class="preview-item-index">{{ index + 1 }}</span>
                  <span class="preview-item-text">{{ item }}</span>
                </li>
              </ul>
            </div>

            <div class="preview-section preview-section--plan">
              <p class="preview-section-title">未来展望</p>
              <ul class="preview-items">
                <li
                  v-for="(item, index) in planItems"
                  :key="`plan-${index}`"
                  class="preview-item"
                >
                  <span class="preview-item-index">{{ index + 1 }}</span>
                  <span class="preview-item-text">{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
