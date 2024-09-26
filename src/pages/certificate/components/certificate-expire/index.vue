<template>
  <div class="certificate-expire-conn">
    <template v-if="props.time">
      <p v-if="props.status == 4 || props.versionStatus == 4" class="info-status error">已吊销</p>
      <template v-else>
        <p class="info-status success" :class="{ error: props.status == 0 }">
          {{ renderExpiredTimeDay(props.time) }}
        </p>
        <p>过期时间：{{ props.time }}</p>
      </template>
    </template>
    <span v-else>--</span>
  </div>
</template>
<script lang="ts">
export default {
  name: 'CertifiacateExpire',
};
</script>
<script setup lang="ts">
import dayjs from 'dayjs';

const props = defineProps({
  status: Number,
  versionStatus: Number,
  time: String,
});

const renderExpiredTimeDay = (date: string) => {
  // 获取当前日期
  const currentDate = dayjs();
  // 设定目标日期
  const targetDate = dayjs(date); // 替换为你的目标日期
  // 计算两个日期之间的天数
  const diffDays = Math.round(targetDate.diff(currentDate, 'day', true));
  if (diffDays >= 0) {
    return `生效中 · ${diffDays}天后过期`;
  }
  return `已失效 · ${diffDays}天`;
};
</script>
<style lang="less" scoped></style>
