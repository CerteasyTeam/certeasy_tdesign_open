<template>
  <div>
    <edit-label
      title="编辑监控名称"
      :value="watchAlias"
      :show-icon="showIcon"
      :min-length="2"
      :max-length="140"
      :on-dispatch="onDispatch"
      :on-update="onComplete"
    />
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { toRefs } from 'vue';

import { updateWatchFieldInfo } from '@/api/watch';
import EditLabel from '@/components/edit-label/index.vue';

const props = defineProps({
  showIcon: Boolean,
  watchId: Number,
  watchAlias: String,
  onComplete: Function,
});

const { showIcon, watchId, watchAlias, onComplete } = toRefs(props);

const onDispatch = async (value: string) => {
  try {
    await updateWatchFieldInfo(watchId.value, 'alias', { alias: value });
    MessagePlugin.success('更新成功');
    if (onComplete.value) onComplete.value();
  } catch (err) {
    console.log(`err:${err.message}`);
    MessagePlugin.error(`错误：${err.message}`);
  }
};
</script>
