<template>
  <div class="watch-ocsp-conn">
    <t-tag :theme="CertificateOcspStatusMapList[props.status].theme">
      {{ CertificateOcspStatusMapList[props.status].label }}
    </t-tag>
  </div>
</template>
<script setup lang="ts">
import { CertificateOcspStatusMapList } from '@/constants';

const props = defineProps({
  status: String,
});
</script>
<style lang="less" scoped></style>
