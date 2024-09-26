import { MenuRoute } from '@/types/interface';

export const prefix = 'tdesign-starter';

export const PASSWD_REGE_RULE = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/;

// 侧边栏有两部分
// 1.默认的
// - 概览
// - 证书管理
// - DNS授权
// - 资源管理
// - 证书监控
export const defaultMenu: MenuRoute[] = [
  {
    name: 'overview',
    path: '/overview',
    meta: {
      title: { zh_CN: '概览', en_US: 'Overview' },
      icon: 'dashboard',
    },
    children: [],
  },
  {
    name: 'certificate',
    path: '/certificate',
    meta: {
      title: { zh_CN: '证书管理', en_US: 'Certificates' },
      icon: 'certificate',
    },
    children: [],
  },
  {
    name: 'dns',
    path: '/dns',
    meta: {
      title: { zh_CN: 'DNS授权', en_US: 'Dns' },
      icon: 'internet',
    },
    children: [],
  },
  {
    name: 'cloud',
    path: '/cloud',
    meta: {
      title: { zh_CN: '资源管理', en_US: 'Cloud' },
      icon: 'data',
    },
    children: [],
  },
  {
    name: 'watch',
    path: '/watch',
    meta: {
      title: { zh_CN: '证书监控', en_US: 'Watch Detail' },
      icon: 'chart-radial',
    },
    children: [],
  },
];
// 2.用户中心
// - 用户信息
// - 通知管理
// - 费用明细
// - 用户推广
export const userCenterMenu: MenuRoute[] = [
  {
    name: 'personal',
    path: '/personal',
    meta: {
      title: { zh_CN: '账号设置', en_US: 'Overview' },
      icon: 'user',
      hidden: true,
    },
    children: [],
  },
  {
    name: 'notification',
    path: '/notification',
    meta: {
      title: { zh_CN: '通知管理', en_US: 'Certificates' },
      icon: 'notification',
    },
    children: [],
  },
  {
    name: 'transaction',
    path: '/transaction',
    meta: {
      title: { zh_CN: '费用明细', en_US: 'Transaction' },
      icon: 'money',
    },
    children: [],
  },
  {
    name: 'invitation',
    path: '/invitation',
    meta: {
      title: { zh_CN: '推广激励', en_US: 'Invitation' },
      icon: 'share',
    },
    children: [],
  },
];
