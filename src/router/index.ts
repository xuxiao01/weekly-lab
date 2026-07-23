import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/services/auth'

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
    {
      path: '/workbench/reports',
      name: 'WorkbenchReports',
      component: () => import('@/views/workbench/WeeklyReportManageView.vue'),
    },
    {
      path: '/workbench/ppts',
      name: 'WorkbenchPpts',
      component: () => import('@/views/workbench/PptListView.vue'),
    },
    {
      path: '/workbench/ppts/:pptId',
      name: 'WorkbenchPptShowcase',
      component: () => import('@/views/workbench/PptShowcaseView.vue'),
    },
    {
      path: '/share/ppts/:pptId',
      name: 'PublicPptShowcase',
      component: () => import('@/views/workbench/PptShowcaseView.vue'),
    },
    {
      path: '/share/:username/:weekKey',
      name: 'PublicShare',
      component: () => import('@/views/PublicShareView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.path.startsWith('/workbench') && !isAuthenticated()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export default router
