import { createRouter, createWebHistory } from 'vue-router'
import { PORTALS } from '@/config/portals'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: `/${PORTALS[0].id}`,
    },
    {
      path: '/:portalId(mch|aqua|electrica)',
      name: 'portal',
      component: () => import('@/views/PortalView.vue'),
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: `/${PORTALS[0].id}`,
    },
  ],
})

export default router
