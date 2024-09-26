<template>
  <div>
    <t-table
      hover
      :data="data"
      :columns="COLUMNS"
      :row-key="rowKey"
      cell-empty-content="--"
      :pagination="pagination"
      :loading="dataLoading"
      @page-change="rehandlePageChange"
    >
      <template #status="{ row }">
        <certificate-status :status="row.status" />
      </template>
      <template #expiredTime="{ row }">
        <certificate-expire :status="row.status" :time="row.expiredTime" />
      </template>

      <template #op="{ row }">
        <t-space v-if="row.status == 2">
          <t-link theme="primary" @click="handleClickDetail(row)"> 查看证书 </t-link>
          <t-link theme="danger" @click="handleClickRevoke(row)"> 吊销 </t-link>
        </t-space>
      </template>
    </t-table>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CertifiacateList',
};
</script>

<script setup lang="ts">
import type { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onUnmounted, reactive, ref, watch } from 'vue';

import { getCertificateVersionList, revokeCertificateVersionInfo } from '@/api/certificate';
import { defaultPageInfo } from '@/constants';
import { t } from '@/locales';

import CertificateExpire from '../certificate-expire/index.vue';
import CertificateStatus from '../certificate-status/index.vue';

const props = defineProps({
  certificate: Object,
});
const certificate = ref(props.certificate);

const emit = defineEmits(['view']);
// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  {
    title: '更新时间',
    width: 220,
    align: 'left',
    colKey: 'createTime',
    fixed: 'left',
  },
  {
    title: '任务状态',
    width: 150,
    colKey: 'status',
  },
  {
    title: '错误信息',
    width: 500,
    colKey: 'error',
  },
  {
    title: '过期时间',
    width: 200,
    colKey: 'expiredTime',
  },
  {
    title: t('pages.listBase.operation'),
    width: 150,
    align: 'right',
    fixed: 'right',
    colKey: 'op',
  },
];

const inProcessing = computed(() => {
  return data.value.some((item) => item.status === 1);
});

const rowKey = 'id';
const data = ref([]);
const dataLoading = ref(false);
const pagination = ref({
  defaultPageSize: 10,
  total: 0,
  defaultCurrent: 1,
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
  reloadVersionList();
};

const handleClickDetail = (item: any) => {
  emit('view', item);
};

const handleClickRevoke = (row: any) => {
  const dialog = DialogPlugin.confirm({
    theme: 'danger',
    header: '确认吊销?',
    body: '吊销证书会使在用该证书的网站无法使用HTTPS进行访问，请确认吊销！',
    closeOnOverlayClick: false,
    confirmBtn: {
      theme: 'danger',
    },
    onConfirm: async (e) => {
      try {
        dialog.setConfirmLoading(true);
        await revokeCertificateVersionInfo(certificate.value?.id, row.id);
        MessagePlugin.success('已吊销');
        rehandlePageChange(defaultPageInfo);
      } catch (err) {
        console.log('err', err.message);
        MessagePlugin.error('操作失败');
      }
      dialog.setConfirmLoading(false);
      return dialog.destroy();
    },
    onClose: () => {
      return dialog.destroy();
    },
  });
};

const reloadVersionList = async () => {
  dataLoading.value = true;
  try {
    const { records, total } = await getCertificateVersionList(certificate.value?.id, searchParams);
    data.value = records;
    pagination.value = {
      ...pagination.value,
      total,
    };
    // interval
    intervalReload();
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

const timer = ref();
const intervalReload = () => {
  clearInterval(timer.value);
  timer.value = setInterval(() => {
    if (inProcessing.value) {
      reloadVersionList();
    } else {
      clearInterval(timer.value);
    }
  }, 3e3);
};

onUnmounted(() => {
  clearInterval(timer.value);
});

watch(
  () => props.certificate,
  (value) => {
    console.log('value', value);
    certificate.value = value;
    reloadVersionList();
  },
  {
    immediate: true,
  },
);
// 导出重载
defineExpose({ rehandlePageChange });
</script>

<style lang="less" scoped></style>
