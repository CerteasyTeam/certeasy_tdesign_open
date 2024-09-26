<template>
  <t-drawer
    v-model:visible="visible"
    size="800"
    header="证书信息"
    :close-btn="false"
    :cancel-btn="null"
    :on-confirm="close"
    :on-close="close"
  >
    <div class="certificate-detail">
      <t-divider align="left">基础信息</t-divider>
      <div class="certificate-column">
        <t-row v-for="item in BASE_KEY_VALUE" :key="item.field">
          <t-col :span="2" class="column-label">{{ item.name }}:</t-col>
          <t-col :span="3">
            <span v-if="item.field === 'certificate.domains'">
              {{ renderDataFieldValue(certificateVersionInfo, item.field)?.join(', ') }}
            </span>
            <span v-else> {{ renderDataFieldValue(certificateVersionInfo, item.field) }}</span>
          </t-col>
        </t-row>
      </div>
      <t-divider align="left">证书信息</t-divider>
      <div class="certificate-column">
        <t-row v-for="item in CERTIFICATE_KEY_VALUE" :key="item.field">
          <t-col :span="2" class="column-label">{{ item.name }}:</t-col>
          <t-col :span="9">
            <span> {{ renderDataFieldValue(certificateDetail, item.field) }}</span>
          </t-col>
        </t-row>
      </div>
      <t-divider align="left">证书文件</t-divider>
      <div class="certificate-column">
        <t-row v-for="item in DETAIL_KEY_VALUE" :key="item.field">
          <t-col :span="2" class="column-label">{{ item.name }}:</t-col>
          <t-col :span="9">
            <pre class="pre-content"> {{ renderDataFieldValue(certificateDetail, item.field) }}</pre>
          </t-col>
        </t-row>
        <t-row class="mt-[12px]">
          <t-col :span="2" class="column-label"></t-col>
          <t-col :span="9">
            <t-button theme="primary" @click="handleDownload">下载证书</t-button>
          </t-col></t-row
        >
      </div>
    </div>
  </t-drawer>
</template>

<script lang="ts">
export default {
  name: 'CertificateInfo',
};
</script>

<script setup lang="ts">
import get from 'lodash/get';
import { computed, ref, toRefs, watch } from 'vue';

import { downloadCertificateVersionCert, getCertificateVersionInfo } from '@/api/certificate';
import { download } from '@/utils/common';

const props = defineProps({
  modelValue: Boolean,
  certificate: Object,
  certificateVersionId: Number,
});

const { certificate, certificateVersionId } = toRefs(props);
const visible = ref(props.modelValue);

console.log('certificate', certificate.value);

const emit = defineEmits(['update:modelValue', 'done']);

const certificateVersionInfo = ref({
  certificate: {
    domains: [],
  },
  detail: {},
});

const certificateDetail = computed(() => {
  return certificateVersionInfo.value?.detail;
});

const BASE_KEY_VALUE = [
  {
    field: 'certificate.name',
    name: '证书名称',
  },
  {
    field: 'certificate.domains',
    name: '证书域名',
  },
  {
    field: 'createTime',
    name: '申请时间',
  },
  {
    field: 'expiredTime',
    name: '到期时间',
  },
  {
    field: 'revokedTime',
    name: '吊销时间',
  },
];

const DETAIL_KEY_VALUE = [
  {
    field: 'certificate',
    name: '证书内容',
  },
  {
    field: 'key',
    name: '密钥内容',
  },
];

const CERTIFICATE_KEY_VALUE = [
  {
    field: 'subject.CN',
    name: '通用名称',
  },
  {
    field: 'subjectaltname',
    name: 'DNS名称',
  },
  {
    field: 'issuer.O',
    name: '签发机构',
  },
  {
    field: 'serialNumber',
    name: '序列号',
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
];

const renderDataFieldValue = (data: any, field: string) => {
  return get(data, field, '--');
};

const reloadCertificateInfo = async () => {
  try {
    // 加载详情
    certificateVersionInfo.value = await getCertificateVersionInfo(certificate.value.id, certificateVersionId.value);
  } catch (err) {
    console.log(err);
  }
};

const certificateName = computed(() => certificate.value?.alias || certificate.value?.name);

const handleDownload = () => {
  downloadCertificateVersionCert(certificate.value?.id, certificateVersionId.value).then((data) => {
    const downName = `${certificateName.value}_${Math.round(Date.now() / 1e3)}.zip`;
    download(data, downName);
  });
};

const close = () => {
  emit('update:modelValue', false);
};

// 监听 props.modelValue 的变化，更新 visible
watch(
  () => props.modelValue,
  (value) => {
    console.log('modelValue.value', value);
    visible.value = value;
    // reloadCertificateInfo
    reloadCertificateInfo();
  },
);
</script>
<style lang="less" scoped>
.certificate-detail {
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
  box-sizing: border-box;
  overflow-y: auto;
  font-family: monospace;
  white-space: pre-wrap;
  height: 30vh;
}
</style>
