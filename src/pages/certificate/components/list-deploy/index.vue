<template>
  <t-card class="list-card-container" :bordered="false">
    <t-row class="mb-[15px]" justify="space-between">
      <div class="left-operation-container">
        <div class="search-input">
          <t-input v-model="searchParams.keyword" placeholder="输入证书 ID或关键词" clearable>
            <template #prefix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-button theme="primary" @click="reloadDeployList">搜索</t-button>
        </div>
      </div>
    </t-row>
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
      <template #name="{ row }">
        <div class="name-col-style">
          <div class="name-col-text">
            <t-link theme="primary" @click="handleClickDetail({ id: row.certificateId })">{{
              row?.certificateName
            }}</t-link>
          </div>
          <div class="name-col-alias">
            <certificate-alias
              :certificate-id="row?.certificateId"
              :certificate-alias="row?.certificateAlias || row?.certificateName"
              :show-icon="false"
              :on-complete="rehandlePageChange"
            />
          </div>
        </div>
      </template>
      <template #type="{ row }">
        <certificate-type :type="row?.certificateType" />
      </template>
      <template #domains="{ row }">
        <certificate-domins :domains="row?.certificateDomains" :only-first="true" />
      </template>
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
    </t-table>
  </t-card>
</template>

<script lang="ts">
export default {
  name: 'ListDeploy',
};
</script>

<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getDeployList } from '@/api/certificate';

import CertificateAlias from '../certificate-alias/index.vue';
import CertificateDomins from '../certificate-domains/index.vue';
import CertificateType from '../certificate-type/index.vue';

const router = useRouter();

// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  {
    title: '证书ID/名称',
    width: 220,
    align: 'left',
    colKey: 'name',
    fixed: 'left',
  },
  {
    title: '类型',
    width: 150,
    colKey: 'type',
  },
  {
    title: '证书域名',
    width: 200,
    colKey: 'domains',
  },
  {
    title: '创建时间',
    width: 220,
    colKey: 'createTime',
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
    width: 450,
    colKey: 'error',
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

const handleClickDetail = (item: any) => {
  router.push(`/certificate/${item.id}`);
};

const reloadDeployList = async () => {
  dataLoading.value = true;
  try {
    const { records, total } = await getDeployList(searchParams);
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

onMounted(() => {
  reloadDeployList();
});
</script>

<style lang="less" scoped></style>
