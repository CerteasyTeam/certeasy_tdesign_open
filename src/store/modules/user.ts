import { defineStore } from 'pinia';

import { signIn } from '@/api/auth';
import type { SignInData, SignInResult } from '@/api/model/authModel';
import { me } from '@/api/user';
import { usePermissionStore } from '@/store';
import type { UserInfo } from '@/types/interface';

const InitUserInfo: UserInfo = {
  id: '',
  userCode: '',
  nickName: '', // 用户名，用于展示在页面右上角头像处
  email: '',
  createTime: null,
  roles: [], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
};

export const useUserStore = defineStore('user', {
  state: () => ({
    token: 'main_token', // 默认token不走权限
    userInfo: { ...InitUserInfo },
    invitation: '',
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.roles;
    },
  },
  actions: {
    async login(data: SignInData) {
      const { user, token } = await signIn(data);
      this.userInfo = user;
      this.token = token;
      return user;
    },
    async oauthLogin({ user, token }: SignInResult) {
      this.userInfo = user;
      this.token = token;
      return user;
    },
    async getUserInfo() {
      if (!this.userInfo?.id || !this.token) {
        this.userInfo = await me();
      }
      return this.userInfo;
    },
    async logout() {
      this.token = '';
      this.userInfo = { ...InitUserInfo };
    },
    async setInvitationCode(value: string) {
      this.invitation = value;
    },
  },
  persist: {
    afterRestore: () => {
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes();
    },
    key: 'user',
    paths: ['token', 'invitation'],
  },
});
