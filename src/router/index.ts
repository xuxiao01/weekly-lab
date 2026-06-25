import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Showcase',
      component: () => import('@/views/ShowcaseView.vue'),
    },
    {
      path: '/login',
      name: 'Auth',
      component: () => import('@/views/auth/AuthView.vue'),
    },
    {
      path: '/register',
      redirect: { path: '/login', query: { mode: 'register' } },
    },
    {
      path: '/workbench',
      name: 'Workbench',
      component: () => import('@/views/workbench/WorkbenchView.vue'),
    },
    {
      path: '/workbench/publish',
      name: 'WorkbenchPublish',
      component: () => import('@/views/workbench/MarkdownPublishView.vue'),
    },
  ],
})

export default router
