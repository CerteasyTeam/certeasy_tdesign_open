<template>
  <div>
    <!-- page-nav -->
    <page-nav :show-back="true" :title="`${watch!.name} 证书信息`" />
    <t-card class="certificate-info">
      <h2 class="certificate-title"></h2>
      <t-divider align="left">主题信息</t-divider>
      <div class="certificate-column">
        <t-row v-for="item in SUBJECT_KEY_VALUE" :key="item.field">
          <t-col :span="1" class="column-label">{{ item.name }}:</t-col>
          <t-col :span="3">{{ renderObjFieldData(item.field) }}</t-col>
        </t-row>
      </div>
      <t-divider align="left">签发者信息</t-divider>
      <div class="certificate-column">
        <t-row v-for="item in ISSUER_KEY_VALUE" :key="item.field">
          <t-col :span="1" class="column-label">{{ item.name }}:</t-col>
          <t-col :span="3">{{ renderObjFieldData(item.field) }}</t-col>
        </t-row>
      </div>
      <t-divider align="left">证书信息</t-divider>
      <div class="certificate-column">
        <t-row>
          <t-col :span="1" class="column-label">在线状态:</t-col>
          <t-col :span="6">
            <watch-ocsp-status :status="recordInfo.ocspStatus" />
          </t-col>
        </t-row>
        <t-row v-for="item in CERT_KEY_VALUE" :key="item.field">
          <t-col :span="1" class="column-label">{{ item.name }}:</t-col>
          <t-col :span="6">
            <pre v-if="['pubkey', 'certificateInPem'].includes(item.field)" class="pre-content">{{
              renderObjFieldData(item.field)
            }}</pre>
            <template v-else>
              {{ renderObjFieldData(item.field) }}
            </template>
          </t-col>
        </t-row>
      </div>
    </t-card>
  </div>
</template>

<script lang="ts">
export default {
  name: 'WatchDetail',
};
</script>

<script setup lang="ts">
import get from 'lodash/get';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getWatchRecordInfo } from '@/api/watch';

import WatchOcspStatus from './components/watch-ocsp-status/index.vue';

const route = useRoute();
const watchId = computed(() => route.params.id as unknown as number);
const recordId = computed(() => route.params.rid as unknown as number);
// 详情
const recordInfo = ref({
  name: '',
  domain: '',
  retryTimes: '',
  ocspStatus: 'GOOD', // 'good' | 'revoked' | 'unknown'
  error: '',
  createTime: '',
  watch: {
    name: '',
    alias: '',
  },
  certificate: {},
});

const watch = computed(() => recordInfo.value.watch);
const certificate = computed(() => recordInfo.value.certificate);
const SUBJECT_KEY_VALUE = [
  {
    field: 'subject.CN',
    name: '通用名称(CN)',
  },
];
const ISSUER_KEY_VALUE = [
  {
    field: 'issuer.CN',
    name: '通用名称(CN)',
  },
  {
    field: 'issuer.O',
    name: '组织(O)',
  },
  {
    field: 'issuer.C',
    name: '国家(C)',
  },
];
const CERT_KEY_VALUE = [
  {
    field: 'serialNumber',
    name: '序列号',
  },
  {
    field: 'type',
    name: '加密算法',
  },
  {
    field: 'bits',
    name: '密钥长度',
  },
  {
    field: 'modulus',
    name: 'modulus',
  },
  {
    field: 'pubkey',
    name: '公钥',
  },
  {
    field: 'exponent',
    name: 'exponent',
  },
  {
    field: 'fingerprint',
    name: 'SHA1指纹',
  },
  {
    field: 'fingerprint256',
    name: 'SHA256指纹',
  },
  {
    field: 'validFrom',
    name: '签发日期',
  },
  {
    field: 'validTo',
    name: '截止日期',
  },
  {
    field: 'subjectaltname',
    name: 'DNS名称',
  },
  {
    field: 'certificateInPem',
    name: '证书文件',
  },
];

const renderObjFieldData = (field: string) => {
  console.log('certificate.value, field', certificate.value, field);

  return get(certificate.value, field, '--');
};

onMounted(async () => {
  try {
    // 加载详情
    recordInfo.value = await getWatchRecordInfo(watchId.value, recordId.value);
  } catch (err) {
    console.log(err);
  }
});
</script>
<style lang="less" scoped>
.certificate-info {
  :deep(.t-divider) {
    margin: var(--td-comp-margin-s) 0;
  }
}

.certificate-column {
  display: flex;
  flex-direction: column;

  .column-label {
    text-align: right;
    margin-right: var(--td-comp-margin-s);
  }

  :deep(.t-row) {
    margin-bottom: var(--td-comp-margin-s);
  }

  :deep(.t-col) {
    word-break: break-all;
  }
}

.pre-content {
  position: relative;
  padding: var(--td-comp-margin-xl);
  background: #eee;
  overflow: hidden;
}
</style>
