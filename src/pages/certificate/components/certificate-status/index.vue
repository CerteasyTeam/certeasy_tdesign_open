<template>
  <div class="certificate-type-conn">
    <!-- 0 失败 1 申请中  2 已颁发 3 已过期 4 吊销 -->
    <t-tag :theme="CertificateStatusMapList[props.status].theme" variant="light">
      <div class="flex items-center">
        <t-icon v-if="props.status == 1" class="mr-[10px]" name="loading"></t-icon>
        {{ CertificateStatusMapList[props.status].label }}
      </div>
    </t-tag>
  </div>
</template>
<script setup lang="ts">
import { CertificateStatusMapList } from '@/constants';

const props = defineProps({
  status: Number,
});
</script>
<style lang="less" scoped></style>
