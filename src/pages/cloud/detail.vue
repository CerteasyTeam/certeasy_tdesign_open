<template>
  <div>
    <!-- page-nav -->
    <page-nav :show-back="true" :title="`${cloudInfo?.alias || cloudInfo?.name} 资源详情`" />

    <div class="cloud-detail">
      <t-card class="cloud-card" :bordered="false">
        <h2 class="cloud-detail-title">
          <t-icon name="data" size="24"></t-icon>
          <copy-label class="ml-[5px]" :value="cloudInfo?.name" />
        </h2>
        <t-row class="cloud-detail-row">
          <t-col :span="1">资源名称：</t-col>
          <t-col :span="3">
            <cloud-alias
              :cloud-id="cloudInfo?.id"
              :cloud-alias="cloudInfo?.alias || cloudInfo?.name"
              :show-icon="false"
              :on-complete="reloadCloudInfo"
            />
          </t-col>
          <t-col :span="1">创建时间：</t-col>
          <t-col :span="3">{{ cloudInfo?.createTime || '--' }}</t-col>
        </t-row>
        <t-row class="cloud-detail-row">
          <t-col :span="1">业务产品：</t-col>
          <t-col :span="3">
            <div class="provider-style">
              <t-image
                lazy
                :style="{ width: '24px', height: '24px' }"
                :src="cloudInfo.providerLogo"
                :aly="cloudInfo.providerName"
              ></t-image>
              {{ cloudInfo?.providerName || '--' }} -
              {{ cloudInfo?.providerProductName || cloudInfo?.providerProductAliasName }}
            </div>
          </t-col>
        </t-row>
        <t-row class="cloud-detail-row">
          <t-col :span="1">关联证书：</t-col>
          <t-col :span="10">
            <t-link v-if="!cloudInfo?.certificates.length" theme="primary">当前资源无证书关联</t-link>
            <template v-else>
              <t-space>
                <t-tooltip
                  v-for="(item, idx) in cloudInfo?.certificates"
                  :key="item.name"
                  placement="bottom"
                  :content="item.name"
                >
                  <t-divider v-if="!!idx" layout="vertical" />
                  <t-link theme="primary" @click="clickToCertificate(item)">{{
                    item.alias || item.name || '--'
                  }}</t-link>
                </t-tooltip>
              </t-space>
            </template>
          </t-col>
        </t-row>
        <t-row>
          <t-col :span="6"><t-divider>资源配置</t-divider></t-col>
        </t-row>
        <t-row class="cloud-detail-row">
          <t-form :label-width="150" label-align="left">
            <t-form-item v-for="(item, idx) in configJson!.fields" :key="idx" :label="item.name">
              <t-select
                v-if="item.type === 'select'"
                v-model:value="accessJson[item.field]"
                readonly
                :placeholder="`请选择 ${item.name}`"
              >
                <t-option v-for="(op, odx) in item.options" :key="odx" :value="op.value">{{ op.label }}</t-option>
              </t-select>
              <t-input
                v-else
                readonly
                :type="item.type"
                :placeholder="item.name"
                :value="accessJson[item.field]"
                style="width: 360px"
              ></t-input>
            </t-form-item>
          </t-form>
        </t-row>
      </t-card>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'WatchDetail',
};
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getCloudInfo } from '@/api/cloud';

import CloudAlias from './components/cloud-alias/index.vue';

const route = useRoute();
const router = useRouter();
const cloudId = computed(() => route.params.id as unknown as number);
const accessJson = computed(() => cloudInfo.value?.accessJson);
const configJson = computed(() => cloudInfo.value?.providerProductConfigJson);
// 详情
const cloudInfo = ref<any>({
  name: '',
  alias: '',
  certificates: [],
  providerLogo: '',
  providerName: '',
  providerProductName: '',
  providerProductAliasName: '',
  providerProductConfigJson: [],
  accessJson: {},
  createTime: '',
});

const clickToCertificate = (item: any) => {
  router.push(`/certificate/${item.id}`);
};

const reloadCloudInfo = async () => {
  try {
    // 加载详情
    cloudInfo.value = await getCloudInfo(cloudId.value);
  } catch (err) {
    console.log(err);
  }
};

onMounted(async () => {
  // 加载详情
  reloadCloudInfo();
});
</script>

<style lang="less" scoped>
.cloud-card:not(:last-child) {
  margin-bottom: 16px;
}

.cloud-detail {
  &-title {
    margin-bottom: var(--td-comp-margin-l);
    font: 500 var(--td-font-size-title-large) / var(--td-line-height-title-large) var(--td-font-family);
    line-height: 26px;
  }

  &-row {
    margin-bottom: var(--td-comp-margin-s);
  }
}

.provider-style {
  display: flex;
  align-items: center;
  gap: 5px;

  :deep(.t-image__wrapper) {
    background: none;
  }
}
</style>
