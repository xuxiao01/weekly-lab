import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useClickOutside(
  target: Ref<HTMLElement | null>,
  onOutside: () => void,
) {
  function handlePointerDown(event: PointerEvent) {
    const el = target.value
    if (!el || el.contains(event.target as Node)) return
    onOutside()
  }

  onMounted(() => {
    document.addEventListener('pointerdown', handlePointerDown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', handlePointerDown)
  })
}
