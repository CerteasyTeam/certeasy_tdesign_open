<template>
  <div class="certificate-type-conn">
    <!-- 1 单域名 2 多域名 3 泛域名 -->
    <t-tag :theme="CertificateTypesMapList[props.type].theme" variant="light">
      {{ CertificateTypesMapList[props.type].label }}
    </t-tag>
  </div>
</template>
<script setup lang="ts">
import { CertificateTypesMapList } from '@/constants';

const props = defineProps({
  type: Number,
});
</script>
<style lang="less" scoped></style>
