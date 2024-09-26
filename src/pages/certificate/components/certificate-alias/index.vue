<template>
  <div>
    <edit-label
      title="编辑证书名称"
      :value="certificateAlias"
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

import { updateCertificateFieldInfo } from '@/api/certificate';
import EditLabel from '@/components/edit-label/index.vue';

const props = defineProps({
  showIcon: Boolean,
  certificateId: Number,
  certificateAlias: String,
  onComplete: Function,
});

const { showIcon, certificateId, certificateAlias, onComplete } = toRefs(props);

const onDispatch = async (value: string) => {
  try {
    await updateCertificateFieldInfo(certificateId.value, 'alias', { alias: value });
    MessagePlugin.success('更新成功');
    if (onComplete.value) onComplete.value();
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};
</script>
