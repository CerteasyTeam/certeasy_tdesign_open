<template>
  <div class="copy-label">
    <t-link v-if="link" theme="primary">{{ value }}</t-link>
    <span v-else>{{ value }}</span>
    <t-tooltip class="ml-[5px]" theme="light" placement="top" content="复制">
      <t-icon name="file-copy" class="icon" @click="copyText(value)"></t-icon>
    </t-tooltip>
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';

import { useCopy } from '@/hooks';

defineProps({
  value: String,
  link: Boolean,
});

const { copyText } = useCopy({
  successDuration: 2e3,
  onSuccess: () => MessagePlugin.success('复制成功'),
  onError: (error: Error) => console.error('Failed to copy text:', error),
});
</script>
<style lang="less" scoped>
.copy-label {
  display: inline-block;

  :deep(.t-icon) {
    cursor: pointer;
  }
}
</style>
