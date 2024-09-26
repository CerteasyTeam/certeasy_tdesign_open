// 导入静态路由
import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';

import router from '@/router';
import { systemRouter } from '@/router/modules/staticRouter';
import { store } from '@/store';
import { transformObjectToRoute } from '@/utils/route';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    whiteListRouters: ['/signin', '/signup', '/reset-passwd', '/redirect', '/oauth'],
    routers: [],
    removeRoutes: [],
    asyncRoutes: [],
  }),
  actions: {
    async initRoutes() {
      const accessedRouters = this.asyncRoutes;

      // 在菜单展示全部路由
      this.routers = [...systemRouter, ...accessedRouters];
    },
    async buildAsyncRoutes() {
      try {
        this.asyncRoutes = transformObjectToRoute([]);
        await this.initRoutes();
        return this.asyncRoutes;
      } catch (error) {
        throw new Error("Can't build routes");
      }
    },
    async restoreRoutes() {
      // 不需要在此额外调用initRoutes更新侧边导肮内容，在登录后asyncRoutes为空会调用
      this.asyncRoutes.forEach((item: RouteRecordRaw) => {
        if (item.name) {
          router.removeRoute(item.name);
        }
      });
      this.asyncRoutes = [];
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
