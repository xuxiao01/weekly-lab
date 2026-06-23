import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null

  const sync = () => {
    matches.value = mediaQuery?.matches ?? false
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    sync()
    mediaQuery.addEventListener('change', sync)
  })

  onBeforeUnmount(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', sync)
    }
  })

  return matches
}
