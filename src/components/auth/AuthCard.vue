<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const cardRef = ref<HTMLElement | null>(null)
const cardHeight = ref<number | null>(null)
const isAnimating = ref(false)

let lockedHeight = 0
let fallbackTimer: ReturnType<typeof setTimeout> | null = null
let stopHeightTransition: (() => void) | null = null

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const HEIGHT_TRANSITION_MS = 250

function releaseHeight() {
  cardHeight.value = null
  isAnimating.value = false
}

function clearFallbackTimer() {
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
    fallbackTimer = null
  }
}

function clearHeightTransition() {
  if (stopHeightTransition) {
    stopHeightTransition()
    stopHeightTransition = null
  }
}

function getTargetCardHeight(el: Element) {
  const card = cardRef.value
  if (!card) return 0

  const style = window.getComputedStyle(card)
  const verticalSpace =
    Number.parseFloat(style.paddingTop) +
    Number.parseFloat(style.paddingBottom) +
    Number.parseFloat(style.borderTopWidth) +
    Number.parseFloat(style.borderBottomWidth)

  return Math.ceil((el as HTMLElement).getBoundingClientRect().height + verticalSpace)
}

function finishEnter(done?: () => void) {
  clearFallbackTimer()
  clearHeightTransition()
  releaseHeight()
  lockedHeight = 0
  done?.()
}

function onBeforeLeave() {
  clearFallbackTimer()
  clearHeightTransition()

  const card = cardRef.value
  if (!card) return

  lockedHeight = card.offsetHeight
  cardHeight.value = lockedHeight
  isAnimating.value = !prefersReducedMotion
}

function onBeforeEnter() {
  const card = cardRef.value
  if (!card) return

  cardHeight.value = lockedHeight || card.offsetHeight
  isAnimating.value = !prefersReducedMotion
}

function onEnter(el: Element, done: () => void) {
  const card = cardRef.value
  if (!card || prefersReducedMotion) {
    finishEnter(done)
    return
  }

  requestAnimationFrame(() => {
    const targetHeight = getTargetCardHeight(el)

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === card && event.propertyName === 'height') {
        finishEnter(done)
      }
    }

    card.addEventListener('transitionend', onTransitionEnd)
    stopHeightTransition = () => {
      card.removeEventListener('transitionend', onTransitionEnd)
    }

    cardHeight.value = targetHeight

    fallbackTimer = setTimeout(() => {
      finishEnter(done)
    }, HEIGHT_TRANSITION_MS + 80)
  })
}

onBeforeUnmount(() => {
  clearFallbackTimer()
  clearHeightTransition()
})
</script>

<template>
  <div
    ref="cardRef"
    class="authCard"
    :class="{ 'authCard--animating': isAnimating }"
    :style="cardHeight != null ? { height: `${cardHeight}px` } : undefined"
  >
    <Transition
      name="auth-form"
      mode="out-in"
      @before-leave="onBeforeLeave"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
    >
      <slot />
    </Transition>
  </div>
</template>
