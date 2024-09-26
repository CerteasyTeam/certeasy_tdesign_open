<template>
  <div>
    <edit-label
      title="编辑渠道名称"
      :value="channelAlias"
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

import { updateNotificationChannelFieldInfo } from '@/api/notification';
import EditLabel from '@/components/edit-label/index.vue';

const props = defineProps({
  showIcon: Boolean,
  channelId: Number,
  channelAlias: String,
  onComplete: Function,
});

const { showIcon, channelId, channelAlias, onComplete } = toRefs(props);

const onDispatch = async (value: string) => {
  try {
    await updateNotificationChannelFieldInfo(channelId.value, 'alias', { alias: value });
    MessagePlugin.success('更新成功');
    if (onComplete.value) onComplete.value();
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};
</script>
