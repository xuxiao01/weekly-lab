import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './utils/http'

setUnauthorizedHandler(() => {
  void router.push({ path: '/' })
})

createApp(App).use(router).mount('#app')
