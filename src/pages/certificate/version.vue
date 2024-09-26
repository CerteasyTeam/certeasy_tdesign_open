<template>
  <div>
    <t-card>
      <t-row :gutter="16">
        <t-col :span="6">
          <div class="cert-label">证书密钥：</div>
          <pre class="result cert-content pre-content">{{ versionInfo.detail.certKey }}</pre>
        </t-col>
        <t-col :span="6">
          <div class="cert-label">证书密钥：</div>
          <pre class="result cert-content pre-content">{{ versionInfo.detail.cert }}</pre>
        </t-col>
      </t-row>
      <t-row class="mt-[12px]"> <t-button @click="handleDownload">下载证书</t-button></t-row>
    </t-card>
  </div>
</template>
<script lang="ts">
export default {
  name: 'CertificateVersion',
};
</script>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { downloadCertificateVersionCert, getCertificateVersionInfo } from '@/api/certificate';
import { download } from '@/utils/common';

const route = useRoute();

const certificateId = computed(() => route.params.id as unknown as number);
const versionId = computed(() => route.params.vid as unknown as number);

const versionInfo = ref({
  name: '',
  certificate: {
    name: '',
    alias: '',
  },
  detail: {
    cert: '',
    certKey: '',
  },
});
const certificateName = computed(() => versionInfo.value?.certificate!.alias || versionInfo.value?.certificate!.name);

const reloadCertificateVersionInfo = async () => {
  try {
    versionInfo.value = await getCertificateVersionInfo(certificateId.value, versionId.value);
  } catch (err) {
    console.log(err);
  }
};

const handleDownload = () => {
  downloadCertificateVersionCert(certificateId.value, versionId.value).then((data) => {
    const downName = `${certificateName.value}_${Math.round(Date.now() / 1e3)}.zip`;
    download(data, downName);
  });
};

onMounted(() => {
  // 加载详情
  reloadCertificateVersionInfo();
});
</script>
<style lang="less" scoped>
.result {
  display: block;
  width: auto;
  height: 75vh;
}

.cert-label {
  position: relative;
  margin-bottom: var(--td-comp-margin-m);
}

.cert-content {
  padding: var(--td-comp-margin-xl);
  justify-content: start;
  box-sizing: border-box;
  overflow-y: auto;
  font-family: monospace;
  white-space: pre-wrap;
}
</style>
