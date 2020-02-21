/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const logsRouter = {
  path: '/logs',
  component: Layout,
  redirect: '/logs/jobs',
  name: 'Logs',
  meta: {
    title: 'Logs',
    icon: 'tree'
  },
  children: [
    {
      path: 'list-jobs',
      component: () => import('@/views/logs/jobs/index'),
      name: 'Jobs',
      meta: { title: 'List Jobs' }
    },
    {
      path: 'list-logs',
      component: () => import('@/views/logs/logs/index'),
      name: 'Jobs',
      meta: { title: 'List logs' }
    },
    {
      path: 'list-memory',
      component: () => import('@/views/logs/memory/index'),
      name: 'Memory',
      meta: { title: 'List Memory' }
    },
    {
      path: 'list-tracking',
      component: () => import('@/views/logs/tracking/index'),
      name: 'Tracking',
      meta: { title: 'List tracking' }
    }
  ]
}
export default logsRouter
