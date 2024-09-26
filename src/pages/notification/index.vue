<template>
  <div>
    <!-- page-nav -->
    <page-nav title="通知管理" />
    <!-- tabs -->
    <div class="tabs-nav-wrapper">
      <t-tabs class="tabs-nav" :default-value="tabsValue" @change="handleTabsChange">
        <t-tab-panel value="config" label="通知设置"></t-tab-panel>
        <t-tab-panel value="channel" label="通知渠道"> </t-tab-panel>
      </t-tabs>
      <div class="tabs-nav-placeholder"></div>
    </div>
    <!-- tabs-content -->
    <notification-config v-if="tabsValue === 'config'" />
    <notification-channel v-if="tabsValue === 'channel'" />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import NotificationChannel from './components/notification-channel/index.vue';
import NotificationConfig from './components/notification-config/index.vue';

const route = useRoute();
const router = useRouter();

// config
const tabsValue = ref<any>((route.query?.activeTab as string) || 'config');

const handleTabsChange = (value: any) => {
  router.replace({
    query: {
      activeTab: value,
    },
  });
};

watch(
  () => route.query?.activeTab,
  (value) => {
    tabsValue.value = value as string;
  },
);
</script>

<style lang="less" scoped>
.tabs-nav {
  position: absolute;
  top: calc(var(--td-comp-paddingTB-m) * 4);
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0 var(--td-comp-paddingLR-xl);
  border-bottom: 1px solid var(--td-component-stroke);

  &-placeholder {
    height: var(--td-comp-paddingTB-xl);
  }

  :deep(.t-tabs__nav-item-wrapper) {
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);
  }

  :deep(.t-tabs__nav-wrap) {
    width: 100%;
  }

  :deep(.t-tabs__bar.t-is-top) {
    height: 2px;
  }
}
</style>
