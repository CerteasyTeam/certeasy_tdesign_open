import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/personal',
    name: 'personal',
    component: Layout,
    redirect: '/personal',
    meta: { hidden: true, title: { zh_CN: '个人中心', en_US: 'User Center' }, icon: 'user-circle' },
    children: [
      {
        path: '',
        name: 'UserIndex',
        component: () => import('@/pages/user/index.vue'),
        meta: { title: { zh_CN: '个人中心', en_US: 'User Center' } },
      },
    ],
  },
];
