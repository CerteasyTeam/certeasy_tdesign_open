<template>
  <div class="certificate-latest-conn">
    <!-- 状态 0 失败 1 申请中  2 已颁发 3 已过期 4 吊销 -->
    <p v-if="props.status == 4" class="info-status error">已吊销</p>
    <template v-else>
      <p
        class="info-status"
        :class="{ error: [0, 3, 4].includes(props.status), loading: props.status == 1, success: props.status == 2 }"
      >
        {{ CertificateStatusMapList[props.status].label }}
        <t-icon v-if="props.status == 1" name="loading"></t-icon>
      </p>
      <p>{{ props.time }}</p>
    </template>
  </div>
</template>
<script setup lang="ts">
import { CertificateStatusMapList } from '@/constants';

const props = defineProps({
  status: Number,
  time: String,
});
</script>
<style lang="less" scoped></style>
