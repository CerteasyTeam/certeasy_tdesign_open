import 'nprogress/nprogress.css'; // progress bar style

import NProgress from 'nprogress'; // progress bar
import { MessagePlugin } from 'tdesign-vue-next';
import { RouteRecordRaw } from 'vue-router';

import router from '@/router';
import { getPermissionStore, useUserStore } from '@/store';
import { PAGE_NOT_FOUND_ROUTE } from '@/utils/route/constant';

NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const permissionStore = getPermissionStore();
  const { whiteListRouters } = permissionStore;

  const userStore = useUserStore();

  // 检查是否有 `invitationCode` 参数
  const { invitationCode } = to.query;
  if (invitationCode) {
    // 存储 invitationCode
    userStore.setInvitationCode(invitationCode as string);
    next(`/`);
    return;
  }

  if (userStore.token) {
    if (to.path === '/signin') {
      next();
      return;
    }
    try {
      await userStore.getUserInfo();

      const { asyncRoutes } = permissionStore;

      if (asyncRoutes && asyncRoutes.length === 0) {
        const routeList = await permissionStore.buildAsyncRoutes();
        routeList.forEach((item: RouteRecordRaw) => {
          router.addRoute(item);
        });

        if (to.name === PAGE_NOT_FOUND_ROUTE.name) {
          // 动态添加路由后，此处应当重定向到fullPath，否则会加载404页面内容
          next({ path: to.fullPath, replace: true, query: to.query });
        } else {
          const redirect = decodeURIComponent((from.query.redirect || to.path) as string);
          next(to.path === redirect ? { ...to, replace: true } : { path: redirect, query: to.query });
          return;
        }
      }
      if (router.hasRoute(to.name)) {
        next();
      } else {
        next(`/`);
      }
    } catch (error) {
      MessagePlugin.error(error.message);
      next({
        path: '/signin',
        query: { redirect: encodeURIComponent(to.fullPath) },
      });
      NProgress.done();
    }
  } else {
    /* white list router */
    // if (whiteListRouters.indexOf(to.path) !== -1) {
    if (whiteListRouters.some((path: any) => to.path.startsWith(path))) {
      next();
    } else {
      next({
        path: '/signin',
        query: { redirect: encodeURIComponent(to.fullPath) },
      });
    }
    NProgress.done();
  }
});

router.afterEach((to) => {
  if (to.path === '/signin') {
    const userStore = useUserStore();
    const permissionStore = getPermissionStore();

    userStore.logout();
    permissionStore.restoreRoutes();
  }
  NProgress.done();
});
