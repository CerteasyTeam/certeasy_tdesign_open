<template>
  <t-drawer
    v-model:visible="visible"
    size="800"
    header="证书配置"
    :close-btn="false"
    :on-close="close"
    :on-confirm="submitConfig"
  >
    <div class="certificate-config">
      <t-row align="middle">
        <t-col :span="2">证书到期自动通知：</t-col>
        <t-col :span="1" align="center"
          ><t-switch v-model:value="formData!.autoNotify">
            <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
          </t-switch></t-col
        >
        <t-col :span="5">
          <div class="config-flex">
            <div class="text">提前</div>
            <t-input v-model:value="formData!.notifyDaysInAdvance" align="center" style="width: 50px"></t-input>
            <div class="text">天</div>
          </div>
        </t-col>
      </t-row>
      <t-row align="middle">
        <t-col :span="2">证书到期自动更新：</t-col>
        <t-col :span="1" align="center"
          ><t-switch v-model:value="formData!.autoUpdate">
            <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
          </t-switch></t-col
        >
        <t-col :span="5">
          <div class="config-flex">
            <div class="text">提前</div>
            <t-input v-model:value="formData!.updateDaysInAdvance" align="center" style="width: 50px"></t-input>
            <div class="text">天</div>
          </div>
        </t-col>
      </t-row>
      <t-row align="middle">
        <t-col :span="2">证书到期自动部署：</t-col>
        <t-col :span="1" align="center"
          ><t-switch v-model:value="formData!.autoPush">
            <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
          </t-switch></t-col
        >
      </t-row>
      <t-row>
        <t-col :span="12"><t-divider>云资源配置</t-divider></t-col>
        <t-col :span="12">
          <t-transfer
            v-model="formData!.associatedCloudIds"
            :title="['云资源列表', '关联资源列表']"
            :operation="['删除', '关联']"
            :data="associatedCloudList"
            :search="true"
            :keys="{ label: 'name', value: 'id' }"
          >
            <template #title="{ type }">
              <div class="">{{ type == 'source' ? '云资源列表' : '关联资源列表' }}</div>
            </template>
            <template #transferItem="{ data }">
              <div class="flex items-center ml-[8px]">
                <t-image
                  lazy
                  :style="{ width: '24px', height: '24px' }"
                  :src="data.providerLogo"
                  :alt="data.providerName"
                ></t-image>
                <span class="ml-[5px]"
                  >{{ data.providerName }} - {{ data.providerProductName }} - {{ data.alias || data.name }}</span
                >
              </div>
            </template>
          </t-transfer>
        </t-col>
      </t-row>
    </div>
  </t-drawer>
</template>
<script lang="ts">
export default {
  name: 'CertificateConfig',
};
</script>
<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, toRefs, watch } from 'vue';

import { configCertificate } from '@/api/certificate';
import { getCloudList } from '@/api/cloud';

const props = defineProps({
  modelValue: Boolean,
  certificate: Object,
});

const emit = defineEmits(['update:modelValue', 'done']);

const { certificate } = toRefs(props);

console.log('certificate', certificate.value);

const visible = ref(props.modelValue);

const INIT_DATA: any = {
  autoNotify: false,
  autoUpdate: false,
  autoPush: false,
  notifyDaysInAdvance: 7,
  updateDaysInAdvance: 1,
  associatedCloudIds: [],
};

const formData = ref<Record<string, any>>({ ...INIT_DATA });
// 初始化数据
formData.value = cloneDeep({
  autoNotify: !!certificate.value?.autoNotify,
  autoUpdate: !!certificate.value?.autoUpdate,
  autoPush: !!certificate.value?.autoPush,
  notifyDaysInAdvance: certificate.value?.notifyDaysInAdvance,
  updateDaysInAdvance: certificate.value?.updateDaysInAdvance,
  associatedCloudIds: certificate.value?.associatedClouds.map((item: any) => item.cloudId) || [],
});

const associatedCloudList = ref([]);

const reloadCloudList = async () => {
  try {
    const { records } = await getCloudList({
      page: 1,
      pageSize: 100,
    });
    associatedCloudList.value = records;
  } catch (err) {
    MessagePlugin.error(err.message);
  }
};

// 提交更新
const submitConfig = async () => {
  try {
    const params = {
      ...formData.value,
      autoNotify: !!formData.value?.autoNotify,
      autoUpdate: !!formData.value?.autoUpdate,
      autoPush: !!formData.value?.autoPush,
    };
    console.log('params', params);

    await configCertificate(certificate.value.id, params);
    MessagePlugin.success('配置成功');
    emit('done', true);
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};

const close = () => {
  emit('update:modelValue', false);
};

// 监听 props.modelValue 的变化，更新 visible
watch(
  () => props.modelValue,
  (value) => {
    console.log('modelValue.value', value);
    visible.value = value;
    // reload
    reloadCloudList();
  },
);
watch(
  () => props.certificate,
  (value) => {
    console.log('certificate.value', value);
    formData.value = cloneDeep({
      autoNotify: !!value?.autoNotify,
      autoUpdate: !!value?.autoUpdate,
      autoPush: !!value?.autoPush,
      notifyDaysInAdvance: value?.notifyDaysInAdvance,
      updateDaysInAdvance: value?.updateDaysInAdvance,
      associatedCloudIds: value?.associatedClouds.map((item: any) => item.cloudId) || [],
    });
  },
);
</script>
<style lang="less" scoped>
.certificate-config {
  &-title {
    margin-bottom: var(--td-comp-margin-s);
  }

  :deep(.t-row) {
    margin-bottom: var(--td-comp-margin-s);
  }

  :deep(.t-transfer) {
    .t-transfer__list {
      height: 420px;
      width: 320px;
    }

    .t-transfer__list-header {
      width: 100%;
    }
  }

  .config-flex {
    display: flex;
    align-items: center;

    .text {
      margin: 0 var(--td-comp-margin-s);
    }
  }
}
</style>
