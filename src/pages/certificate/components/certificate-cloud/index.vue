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
        <div class="deploy-status">
          <span v-if="row.status === 1" class="deploying">
            <t-icon class="ml-[5px]" name="loading"></t-icon>
            部署中
          </span>
          <span v-else-if="row.status === 2" class="success">
            <t-icon name="check-circle" />
            已部署
          </span>
          <span v-else-if="row.status === 0" class="danger">
            <t-icon name="error-circle" />
            错误
          </span>
          <span v-else>--</span>
        </div>
      </template>
      <template #cloud="{ row }">
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
      </template>
      <template #error="{ row }">
        <span v-if="row.error" class="info-status error">{{ row.error || '--' }}</span>
        <span v-else>--</span>
      </template>

      <template #op="{ row }">
        <t-space v-if="false">
          <t-tooltip content="重新部署">
            <t-link v-if="row.status === 0" theme="primary" :disabled="inProcessing" @click="handleClickReload(row)">
              重新部署
            </t-link>
          </t-tooltip>
        </t-space>
      </template>
    </t-table>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CertificateCloud',
};
</script>

<script setup lang="ts">
import { MessagePlugin, PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { computed, onUnmounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { createCertificateDeploy, getCertificateDeployList } from '@/api/certificate';
import { t } from '@/locales';

const router = useRouter();

const props = defineProps({
  certificate: Object,
});
const certificate = ref(props.certificate);

// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  {
    title: '创建时间',
    width: 220,
    align: 'left',
    colKey: 'createTime',
    fixed: 'left',
  },
  {
    title: '任务状态',
    width: 100,
    align: 'center',
    colKey: 'status',
  },
  {
    title: '部署资源',
    width: 450,
    colKey: 'cloud',
  },
  {
    title: '错误信息',
    width: 500,
    colKey: 'error',
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
  reloadDeployList();
};

const handleClickReload = async (item: any) => {
  try {
    const params = {
      associatedCloudIds: [item.cloudId],
    };
    console.log('params', params);

    await createCertificateDeploy(certificate.value.id, params);
    MessagePlugin.success('提交成功，请等待系统执行部署');
    reloadDeployList();
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};
const reloadDeployList = async () => {
  dataLoading.value = true;
  try {
    const { records, total } = await getCertificateDeployList(certificate.value?.id, searchParams);
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
      reloadDeployList();
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
    reloadDeployList();
  },
  {
    immediate: true,
  },
);
</script>

<style lang="less" scoped></style>
