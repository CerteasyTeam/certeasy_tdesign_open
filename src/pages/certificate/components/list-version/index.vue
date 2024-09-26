<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-row class="mb-[15px]" justify="space-between">
        <div class="left-operation-container">
          <div class="search-input">
            <t-input v-model="searchParams.keyword" placeholder="输入证书 ID或关键词" clearable>
              <template #prefix-icon>
                <search-icon size="16px" />
              </template>
            </t-input>
            <t-button theme="primary" @click="reloadVersionList">搜索</t-button>
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
              <t-link theme="primary" @click="handleClickDetail(row?.certificate)">{{ row?.certificate.name }}</t-link>
            </div>
            <div class="name-col-alias">
              <certificate-alias
                :certificate-id="row?.certificate.id"
                :certificate-alias="row?.certificate.alias || row?.certificate.name"
                :show-icon="false"
                :on-complete="rehandlePageChange"
              />
            </div>
          </div>
        </template>
        <template #type="{ row }">
          <certificate-type :type="row?.certificate.type" />
        </template>
        <template #domains="{ row }">
          <certificate-domins :domains="row?.certificate.domains" :only-first="true" />
        </template>
        <template #status="{ row }">
          <certificate-status :status="row.status" />
        </template>
        <template #expiredTime="{ row }">
          <certificate-expire :status="row.status" :time="row.expiredTime" />
        </template>

        <template #op="{ row }">
          <t-space v-if="row.status == 2">
            <t-link theme="primary" @click="handleClickVersionDetail(row)"> 查看证书 </t-link>
            <t-link theme="danger" @click="handleClickRevoke(row)"> 吊销 </t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 查看证书 -->
    <certificate-info-comp
      v-model="certificateInfoDrawer.visible"
      :certificate="certificateInfoDrawer!.versionInfo.certificate"
      :certificate-version-id="certificateInfoDrawer!.versionInfo.id"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'ListVersion',
};
</script>

<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import type { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getVersionList, revokeCertificateVersionInfo } from '@/api/certificate';
import { defaultPageInfo } from '@/constants';
import { t } from '@/locales';

import CertificateAlias from '../certificate-alias/index.vue';
import CertificateDomins from '../certificate-domains/index.vue';
import CertificateExpire from '../certificate-expire/index.vue';
import CertificateInfoComp from '../certificate-info/index.vue';
import CertificateStatus from '../certificate-status/index.vue';
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
    title: '更新时间',
    width: 200,
    colKey: 'createTime',
  },
  {
    title: '任务状态',
    width: 150,
    colKey: 'status',
  },
  {
    title: '错误信息',
    width: 450,
    colKey: 'error',
  },
  {
    title: '过期时间',
    width: 220,
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
  router.push(`/certificate/${item.id}`);
};

// 证书信息
const certificateInfoDrawer = ref({
  visible: false,
  versionInfo: {
    id: null,
    certificate: {},
  },
});
const handleClickVersionDetail = (item: any) => {
  certificateInfoDrawer.value!.visible = true;
  certificateInfoDrawer.value!.versionInfo = item || {};
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
        await revokeCertificateVersionInfo(row.value?.certificateId, row.id);
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
    const { records, total } = await getVersionList(searchParams);
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

onMounted(() => {
  reloadVersionList();
});

// 导出重载
defineExpose({ rehandlePageChange });
</script>

<style lang="less" scoped></style>
