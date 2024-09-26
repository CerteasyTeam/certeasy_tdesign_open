<template>
  <t-dialog
    v-model:visible="visible"
    :width="500"
    :close-on-overlay-click="false"
    :close-btn="true"
    dialog-class-name="certificate-deploy"
    attach="body"
    header="部署证书"
    cancel-btn="取消"
    :on-confirm="submitConfig"
    :on-close="close"
  >
    <template #body>
      <t-table
        row-key="cloudId"
        height="200"
        hover
        :columns="[
          { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
          {
            title: '资源ID/名称',
            align: 'left',
            colKey: 'cloud',
          },
        ]"
        :data="dataList"
        :selected-row-keys="selectedIds"
        cell-empty-content="--"
        select-on-row-click
        :pagination="pagination"
        :loading="dataLoading"
        @page-change="rehandlePageChange"
        @select-change="(value: number[]) => rehandleSelectChange(value)"
      >
        <template #cloud="{ row }">
          <div class="name-col-style">
            <div class="name-col-text">
              <t-link :key="row.id" theme="primary" @click="() => router.push(`/cloud/${row.cloudId}`)">
                <template #prefix-icon>
                  <t-image
                    lazy
                    :style="{ width: '24px', height: '24px' }"
                    :src="row.providerLogo"
                    :alt="row.providerName"
                  ></t-image>
                </template>
                <span class="ml-[5px]">{{ row.providerName }} - {{ row.providerProductName }} - {{ row.name }}</span>
              </t-link>
            </div>
          </div>
        </template>
      </t-table>
    </template>
  </t-dialog>
</template>
<script lang="ts">
export default {
  name: 'CertificateDeploy',
};
</script>
<script lang="ts" setup>
import type { PageInfo } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';

import { createCertificateDeploy, getCertificateCloudList } from '@/api/certificate';

const router = useRouter();

const props = defineProps({
  modelValue: Boolean,
  certificate: Object,
});

const emit = defineEmits(['update:modelValue', 'done']);

const { certificate } = toRefs(props);

const visible = ref(props.modelValue);

// 监听 props.modelValue 的变化，更新 visible
watch(
  () => props.modelValue,
  (value) => {
    console.log('modelValue.value', value);
    visible.value = value;
    // reload
    reloadCertificateCloudList();
  },
);

const selectedIds = ref([]);
const dataLoading = ref(true);
const dataList = ref([]);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const searchParams = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 10,
  sortBy: 'createTime',
  sortOrder: 'DESC',
});

const rehandlePageChange = (curr: PageInfo) => {
  console.log('分页变化', curr);
  searchParams.pageNum = curr.current;
  searchParams.pageSize = curr.pageSize;
  reloadCertificateCloudList();
};

const rehandleSelectChange = (val: number[] = []) => {
  selectedIds.value = val;
};

// 选中部署
const submitConfig = async () => {
  try {
    const params = {
      associatedCloudIds: selectedIds.value,
    };
    console.log('params', params);

    await createCertificateDeploy(certificate.value.id, params);
    MessagePlugin.success('提交成功，请等待系统执行部署');
    // 清理选择
    rehandleSelectChange();
    emit('done', true);
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};

const close = () => {
  emit('update:modelValue', false);
};

const reloadCertificateCloudList = async () => {
  dataLoading.value = true;
  try {
    const { records, total } = await getCertificateCloudList(certificate.value?.id, searchParams);
    dataList.value = records;
    pagination.value = {
      ...pagination.value,
      total,
    };
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};
</script>
<style lang="less" scoped></style>
