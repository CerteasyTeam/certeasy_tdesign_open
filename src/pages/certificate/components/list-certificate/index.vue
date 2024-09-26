<template>
  <t-card class="list-card-container" :bordered="false">
    <t-row justify="space-between">
      <div class="left-operation-container">
        <t-button @click="guideToCreateCertificate"> 申请证书 </t-button>
      </div>
      <div class="search-input">
        <t-input v-model="searchParams.keyword" placeholder="输入证书 ID或关键词" clearable>
          <template #prefix-icon>
            <search-icon size="16px" />
          </template>
        </t-input>
        <t-button theme="primary" @click="reloadCertificateList">搜索</t-button>
      </div>
    </t-row>
    <t-table
      hover
      row-key="id"
      :data="data"
      :columns="COLUMNS"
      cell-empty-content="--"
      :pagination="pagination"
      :loading="dataLoading"
      :header-affixed-top="headerAffixedTop"
      @page-change="rehandlePageChange"
    >
      <template #name="{ row }">
        <div class="name-col-style">
          <div class="name-col-text">
            <t-link theme="primary" @click="handleClickDetail(row)">{{ row.name }}</t-link>
            <t-tooltip theme="light" placement="top" content="复制">
              <t-icon name="copy" class="icon" @click="copyText(row.name)"></t-icon>
            </t-tooltip>
          </div>
          <div class="name-col-alias">
            <certificate-alias
              :certificate-id="row?.id"
              :certificate-alias="row?.alias || row?.name"
              :show-icon="false"
              :on-complete="HandleCertificateAliasChange"
            />
          </div>
        </div>
      </template>
      <template #type="{ row }">
        <certificate-type :type="row.type" />
      </template>
      <template #certAgency="{ row }">
        <certificate-agency :agency="row.certAgency" />
      </template>
      <template #domains="{ row }">
        <certificate-domins :domains="row.domains" :only-first="true" />
      </template>
      <template #authMode="{ row }">
        <!--  1 HTTP验证 2 HTTP代理验证 3 DNS授权验证 4 DNS代理验证   -->
        {{ CertificateAuthModeMapList[row.authMode].label }}
      </template>
      <template #createTime="{ row }">
        {{ row.createTime }}
      </template>
      <template #latestVersion="{ row }">
        <certificate-latest :status="row.latestVersionStatus" :time="row.latestVersionTime" />
      </template>
      <template #expiredTime="{ row }">
        <certificate-expire :status="row.status" :version-status="row.latestVersionStatus" :time="row.expiredTime" />
      </template>

      <template #op="{ row }">
        <t-space>
          <t-link theme="primary" @click="handleClickDetail(row)"> 查看 </t-link>
          <t-link theme="danger" @click="handleClickDelete(row)"> 删除 </t-link>
        </t-space>
      </template>
    </t-table>
  </t-card>
</template>

<script lang="ts">
export default {
  name: 'ListCertifiacate',
};
</script>

<script lang="ts" setup>
import { SearchIcon } from 'tdesign-icons-vue-next';
import type { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { deleteCertificateInfo, getCertificateList } from '@/api/certificate';
import { prefix } from '@/config/global';
import { CertificateAuthModeMapList, defaultPageInfo } from '@/constants';
import { useCopy } from '@/hooks';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

import CertificateAgency from '../certificate-agency/index.vue';
import CertificateAlias from '../certificate-alias/index.vue';
import CertificateDomins from '../certificate-domains/index.vue';
import CertificateExpire from '../certificate-expire/index.vue';
import CertificateLatest from '../certificate-latest/index.vue';
import CertificateType from '../certificate-type/index.vue';

const { copyText } = useCopy({
  successDuration: 2e3,
  onSuccess: () => MessagePlugin.success('复制成功'),
  onError: (error: Error) => console.error('Failed to copy text:', error),
});

const store = useSettingStore();
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
    title: '证书品牌',
    width: 200,
    colKey: 'certAgency',
  },
  {
    title: '验证模式',
    width: 150,
    colKey: 'authMode',
  },
  {
    title: '创建时间',
    width: 200,
    colKey: 'createTime',
  },
  {
    title: '更新次数',
    width: 100,
    colKey: 'versionsCount',
  },
  {
    title: '最近更新',
    width: 200,
    colKey: 'latestVersion',
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
  searchParams.pageNum = curr.current;
  searchParams.pageSize = curr.pageSize;
  reloadCertificateList();
};

const handleClickDetail = (item: any) => {
  router.push(`/certificate/${item.id}`);
};

// 删除证书
const handleClickDelete = (item: any) => {
  const dialog = DialogPlugin.confirm({
    theme: 'danger',
    header: '确认删除?',
    body: '证书一经删除无法恢复，请您确认删除！',
    closeOnOverlayClick: false,
    confirmBtn: {
      theme: 'danger',
    },
    onConfirm: async () => {
      try {
        await deleteCertificateInfo(item.id);
        MessagePlugin.success('已删除');
        rehandlePageChange(defaultPageInfo);
      } catch (err) {
        console.log('err', err.message);
        MessagePlugin.error('操作失败');
      }
      return dialog.destroy();
    },
    onClose: () => {
      return dialog.destroy();
    },
  });
};

const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const HandleCertificateAliasChange = () => {
  rehandlePageChange({ current: 1, previous: 1, pageSize: 10 });
};

const reloadCertificateList = async () => {
  dataLoading.value = true;
  try {
    const { records, total } = await getCertificateList(searchParams);
    data.value = records;
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

const guideToCreateCertificate = () => {
  router.push(`/certificate/guide`);
};

onMounted(() => {
  reloadCertificateList();
});
</script>

<style lang="less" scoped></style>
