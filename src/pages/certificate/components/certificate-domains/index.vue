<template>
  <div class="certificate-domains-conn" :style="{ display: inlineStyle ? 'inline-block' : 'block' }">
    <t-space>
      <t-tooltip v-for="(item, idx) in listDomains" :key="idx" placement="bottom" :content="item">
        <t-link underline :href="`https://${item.replace('*.', '')}`" target="_blank" hover="color" theme="primary">{{
          item
        }}</t-link>
      </t-tooltip>
      <t-tag v-if="onlyFirst" size="small" theme="warning" variant="outline">{{ props.domains.length }}</t-tag>
    </t-space>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  domains: Array<any>,
  onlyFirst: Boolean,
  inlineStyle: Boolean,
});

const listDomains = computed(() => {
  if (props.onlyFirst) {
    return props.domains.filter((_: unknown, idx: number) => idx === 0);
  }
  return props.domains;
});
</script>
<style lang="less" scoped></style>
