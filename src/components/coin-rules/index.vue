<template>
  <t-drawer
    v-model:visible="visible"
    size="450"
    header="金币消费规则"
    :footer="null"
    :on-close="close"
    :close-btn="true"
  >
    <div v-for="item in billingConfig" :key="item.name" class="coin-rules">
      <h2 class="service">· {{ item.description }}</h2>
      <template v-for="rule in item.rules" :key="rule.name">
        <p class="service">{{ rule.description }}</p>
        <ul>
          <li v-for="method in rule.methods" :key="method.name" class="rule-item">
            {{ method.description }}：<strong>{{ method.config?.price }} 金币 / 次</strong>
          </li>
        </ul>
        <t-divider />
      </template>
    </div>
    <div v-if="false" class="coin-rules">
      <p class="service">证书申请</p>
      <ul>
        <li class="rule-item">单域名证书：<strong>3 金币 / 次</strong></li>
        <li class="rule-item">多域名证书：<strong>6 金币 / 次</strong></li>
        <li class="rule-item">泛域名证书：<strong>10 金币 / 次</strong></li>
      </ul>
      <t-divider />
      <p class="service">证书更新服务</p>
      <ul>
        <li class="rule-item">更新任务（主动更新）：<strong>20 金币 / 次</strong></li>
        <li class="rule-item">更新任务（自动更新）：<strong>40 金币 / 次</strong></li>
      </ul>
      <t-divider />
      <p class="service">证书部署服务</p>
      <ul>
        <li class="rule-item">部署任务（手动部署）：<strong>50 金币 / 节点 / 次</strong></li>
        <li class="rule-item">部署任务（自动部署）：<strong>100 金币 / 节点 / 次</strong></li>
      </ul>
      <t-divider />
      <p class="service">证书监控服务</p>
      <ul>
        <li class="rule-item">监控任务（手动添加）：<strong>2 金币 / 次</strong></li>
        <li class="rule-item">监控任务（系统监控）：<strong>4 金币 / 次</strong></li>
      </ul>
    </div>
  </t-drawer>
</template>
<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue';

import { useConfigStore } from '@/store';

const configStore = useConfigStore();
const { billingConfig } = toRefs(configStore);

// 入参
const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue', 'done']);

const visible = ref(props.modelValue);

const close = () => {
  emit('update:modelValue', false);
};

// 监听 props.modelValue 的变化，更新 visible
watch(
  () => props.modelValue,
  async (value) => {
    console.log('modelValue.value', value);
    visible.value = value;
  },
);
</script>
<style lang="less" scoped>
.coin-rules {
  .service {
    font: var(--td-font-title-medium);
    margin-bottom: var(--td-comp-margin-s);
  }

  .rule-item {
    margin-left: var(--td-comp-margin-l);
    font-size: var(--td-font-size-body-medium);
    line-height: var(--td-line-height-title-medium);

    &::before {
      content: '·';
      font: var(--td-font-title-medium);
      color: var(--td-brand-color);
      margin-right: var(--td-comp-margin-s);
    }
  }

  :deep(.t-divider) {
    margin: var(--td-comp-margin-l) 0;
  }
}
</style>
