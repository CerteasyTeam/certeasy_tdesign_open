import { defineStore } from 'pinia';

import { commConfig } from '@/api/common';

const state: Record<string, any> = {
  appDomain: import.meta.env.VITE_APP_URL,
  billingConfig: {},
  customerService: {},
  // 激励
  invitationActivateCoins: 1000,
  invitationRechargeRewardRate: 20,
  invitationRechargeRewardCoins: 0,
  aliasCnameValue: `_acme-challenge.${import.meta.env.VITE_APP_URL}`,
};

export const useConfigStore = defineStore('config', {
  state: () => state,
  getters: {
    showSidebar: (state) => state.layout !== 'top',
  },
  actions: {
    async loadConfig() {
      const config = await commConfig();
      if (config) {
        this.$state = { ...config };
      }
    },
  },
});
