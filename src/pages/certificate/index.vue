<template>
  <div>
    <!-- page-nav -->
    <page-nav title="证书管理" />
    <!-- tabs -->
    <div class="tabs-nav-wrapper">
      <t-tabs class="tabs-nav" :default-value="tabsValue" @change="handleTabsChange">
        <t-tab-panel value="certificate" label="我的证书"></t-tab-panel>
        <t-tab-panel value="version" label="更新任务"> </t-tab-panel>
        <t-tab-panel value="deploy" label="部署任务"> </t-tab-panel>
      </t-tabs>
      <div class="tabs-nav-placeholder"></div>
    </div>
    <!-- 组件 -->
    <list-certificate v-if="tabsValue === 'certificate'" />
    <list-version v-if="tabsValue === 'version'" />
    <list-deploy v-if="tabsValue === 'deploy'" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'CertificateIndex',
};
</script>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ListCertificate from './components/list-certificate/index.vue';
import ListDeploy from './components/list-deploy/index.vue';
import ListVersion from './components/list-version/index.vue';

const route = useRoute();
const router = useRouter();

// certificate version depoly
const tabsValue = ref<any>((route.query?.activeTab as string) || 'certificate');

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
