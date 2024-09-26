import { RouteRecordRaw } from 'vue-router';

import Layout from '@/layouts/index.vue';

/**
 * staticRouter (静态路由)
 */
export const staticRouter: RouteRecordRaw[] = [
  {
    path: '/redirect',
    name: 'redirect',
    component: Layout,
    redirect: '/overview',
    children: [],
  },
  {
    path: '/oauth/:app',
    name: 'oauth',
    component: () => import('@/pages/redirect/index.vue'),
    meta: { title: { zh_CN: '跳转中', en_US: 'redirect' } },
  },
  {
    path: '/signin',
    name: 'signin',
    meta: {
      title: { zh_CN: '登录', en_US: 'Sign in' },
    },
    component: () => import('@/pages/signin/index.vue'),
  },
  {
    path: '/signup',
    name: 'signup',
    meta: {
      title: { zh_CN: '注册', en_US: 'Sign up' },
    },
    component: () => import('@/pages/signup/index.vue'),
  },
  {
    path: '/reset-passwd',
    name: 'reset passwd',
    meta: {
      title: { zh_CN: '重置密码', en_US: 'Reset passwd' },
    },
    component: () => import('@/pages/reset-passwd/index.vue'),
  },
];
/**
 * systemRouter (业务路由)
 */
export const systemRouter: RouteRecordRaw[] = [
  {
    path: '/overview',
    name: 'overview',
    component: () => import('@/pages/overview/index.vue'),
    meta: { title: { zh_CN: '概览', en_US: 'Overview' }, icon: 'dashboard' },
  },
  {
    path: '/certificate',
    name: 'certificate',
    component: () => import('@/pages/certificate/index.vue'),
    meta: { title: { zh_CN: '证书管理', en_US: 'Certificates' }, icon: 'certificate' },
  },
  {
    path: '/certificate/guide',
    name: 'certificate guide',
    component: () => import('@/pages/certificate/guide.vue'),
    meta: { hidden: true, title: { zh_CN: '证书申请', en_US: 'Certificate Guide' } },
  },
  {
    path: '/certificate/:id',
    name: 'certificate detail',
    component: () => import('@/pages/certificate/detail.vue'),
    props: true,
    meta: { hidden: true, title: { zh_CN: '证书详情', en_US: 'Certificate Detail' } },
  },
  {
    path: '/certificate/:id/version/:vid',
    name: 'certificate version',
    component: () => import('@/pages/certificate/version.vue'),
    props: true,
    meta: { hidden: true, title: { zh_CN: '证书信息', en_US: 'Watch Certificate' } },
  },
  {
    path: '/dns',
    name: 'dns',
    component: () => import('@/pages/dns/index.vue'),
    meta: { title: { zh_CN: 'DNS授权', en_US: 'Dns' }, icon: 'internet' },
  },
  {
    path: '/dns/:id',
    name: 'dns detail',
    component: () => import('@/pages/dns/detail.vue'),
    props: true,
    meta: { hidden: true, title: { zh_CN: 'DNS详情', en_US: 'Dns Detail' } },
  },
  {
    path: '/cloud',
    name: 'cloud',
    component: () => import('@/pages/cloud/index.vue'),
    meta: { title: { zh_CN: '资源管理', en_US: 'Cloud' }, icon: 'data' },
  },
  {
    path: '/cloud/guide',
    name: 'cloud guide',
    component: () => import('@/pages/cloud/guide.vue'),
    meta: { hidden: true, title: { zh_CN: '资源部署', en_US: 'Cloud Guide' } },
  },
  {
    path: '/cloud/:id',
    name: 'cloud detail',
    component: () => import('@/pages/cloud/detail.vue'),
    props: true,
    meta: { hidden: true, title: { zh_CN: '资源详情', en_US: 'Cloud Detail' } },
  },
  {
    path: '/watch',
    name: 'watch',
    component: () => import('@/pages/watch/index.vue'),
    meta: { title: { zh_CN: '证书监控', en_US: 'Watch' }, icon: 'chart-radial' },
  },
  {
    path: '/watch/:id',
    name: 'watch detail',
    component: () => import('@/pages/watch/detail.vue'),
    props: true,
    meta: { hidden: true, title: { zh_CN: '监控详情', en_US: 'Watch Detail' } },
  },
  {
    path: '/watch/:id',
    name: 'watch detail',
    component: () => import('@/pages/watch/detail.vue'),
    props: true,
    meta: { hidden: true, title: { zh_CN: '监控详情', en_US: 'Watch Detail' } },
  },
  {
    path: '/watch/:id/record/:rid',
    name: 'watch certificate',
    component: () => import('@/pages/watch/certificate.vue'),
    props: true,
    meta: { hidden: true, title: { zh_CN: '证书信息', en_US: 'Watch Certificate' } },
  },
  {
    path: '/notification',
    name: 'notification',
    component: () => import('@/pages/notification/index.vue'),
    meta: { hidden: true, title: { zh_CN: '通知管理', en_US: 'Notification' }, icon: 'notification' },
  },
  {
    path: '/transaction',
    name: 'transaction',
    component: () => import('@/pages/transaction/index.vue'),
    meta: { hidden: true, title: { zh_CN: '费用明细', en_US: 'User Center' }, icon: 'money' },
  },
  {
    path: '/invitation',
    name: 'invitation',
    component: () => import('@/pages/invitation/index.vue'),
    meta: { hidden: true, title: { zh_CN: '用户推广', en_US: 'Invitation' }, icon: 'share' },
  },
  {
    path: '/personal',
    name: 'personal',
    component: () => import('@/pages/user/index.vue'),
    meta: { hidden: true, title: { zh_CN: '个人中心', en_US: 'User Center' }, icon: 'user-circle' },
  },
];
/**
 * layoutRouter (业务路由)
 */
export const layoutRouter: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/overview',
    children: systemRouter,
  },
];

/**
 * errorRouter (错误页面路由)
 */
export const errorRouter: RouteRecordRaw[] = [
  {
    path: '/403',
    name: '403',
    meta: {
      title: '403 Forbidden',
    },
    component: () => import('@/pages/exception/403/index.vue'),
  },
  {
    path: '/404',
    name: '404',
    meta: {
      title: '404 Not Found',
    },
    component: () => import('@/pages/exception/404/index.vue'),
  },
  {
    path: '/500',
    name: '500',
    meta: {
      title: '500 Exception',
    },
    component: () => import('@/pages/exception/500/index.vue'),
  },
  // Resolve refresh page, route warnings
  {
    path: '/:pathMatch(.*)*', // /:path(.*)* /:pathMatch(.*)*
    redirect: '/404',
  },
];
