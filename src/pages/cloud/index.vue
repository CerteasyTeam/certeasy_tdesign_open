<template>
  <div>
    <!-- page-nav -->
    <page-nav title="资源管理" />

    <t-card class="list-card-container" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-button @click="handleClickGuide"> 新增资源 </t-button>
        </div>
        <div class="search-input">
          <t-input v-model="searchParams.keyword" placeholder="输入资源ID或域名关键词" clearable>
            <template #prefix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-button theme="primary" @click="HandleCloudAliasChange">搜索</t-button>
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
              <cloud-alias
                :cloud-id="row?.id"
                :cloud-alias="row?.alias || row?.name"
                :show-icon="false"
                :on-complete="HandleCloudAliasChange"
              />
            </div>
          </div>
        </template>
        <template #provider="{ row }">
          <div class="provider-col-style">
            <t-image
              lazy
              :style="{ width: '24px', height: '24px' }"
              :src="row.providerLogo"
              :aly="row.providerName"
            ></t-image>
            {{ row.providerName || '未知' }}
          </div>
        </template>
        <template #providerProduct="{ row }">
          <div class="provider-col-style">
            {{ row.providerProductAliasName || row.providerProductName }}
          </div>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status == 1 ? 'primary' : 'warning'" variant="light">{{
            row.status == 1 ? '正常' : '错误'
          }}</t-tag>
        </template>
        <template #createTime="{ row }">
          {{ row.createTime }}
        </template>

        <template #op="{ row }">
          <t-space>
            <t-link theme="primary" @click="handleClickDetail(row)"> 查看 </t-link>
            <t-link theme="primary" @click="handleClickDrawer(row)"> 修改 </t-link>
            <t-link theme="danger" @click="handleClickDelete(row)"> 删除 </t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 编辑新增弹出 -->
    <cloud-edit v-model="drawer.visible" :title="drawer.title" :data="drawer!.data" @done="editChangeReloadData" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'CloudIndex',
};
</script>

<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import type { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { deleteCloudInfo, getCloudInfo, getCloudList } from '@/api/cloud';
import { prefix } from '@/config/global';
import { defaultPageInfo } from '@/constants';
import { useCopy } from '@/hooks';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

import CloudAlias from './components/cloud-alias/index.vue';
import CloudEdit from './components/cloud-edit/index.vue';

const { copyText } = useCopy({
  successDuration: 2e3,
  onSuccess: () => MessagePlugin.success('复制成功'),
  onError: (error: Error) => console.error('Failed to copy text:', error),
});

const store = useSettingStore();

// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  {
    title: '资源ID/名称',
    minWidth: 220,
    align: 'left',
    colKey: 'name',
    fixed: 'left',
  },
  {
    title: '服务商',
    width: 180,
    colKey: 'provider',
  },
  {
    title: '产品',
    width: 150,
    colKey: 'providerProduct',
  },
  {
    title: '关联证书',
    width: 100,
    colKey: 'certificatesCount',
  },
  // {
  //   title: '状态',
  //   width: 80,
  //   colKey: 'status',
  // },
  {
    title: '创建时间',
    width: 200,
    colKey: 'createTime',
  },
  {
    title: t('pages.listBase.operation'),
    align: 'right',
    fixed: 'right',
    colKey: 'op',
  },
];

const data = ref([]);
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

const dataLoading = ref(false);
const fetchData = async () => {
  dataLoading.value = true;
  try {
    const { records, total } = await getCloudList(searchParams);
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

// 编辑新增
const drawer = ref({
  visible: false,
  title: '新增资源',
  data: {},
});

const handleClickDrawer = async (row: any) => {
  // 含有证书管理
  if (row?.certificatesCount) {
    const dialog = DialogPlugin.confirm({
      theme: 'warning',
      header: '确认修改?',
      body: '多个证书部署到云资源，修改云资源配置可能会导致证书自动化部署失败，请确认修改！',
      confirmBtn: {
        theme: 'warning',
      },
      onConfirm: async () => {
        try {
          drawer.value!.data = await getCloudInfo(row?.id);
          drawer.value!.visible = true;
        } catch (err) {
          console.log(`err:${err.message}`);
        }
        return dialog.destroy();
      },
      onClose: () => {
        return dialog.destroy();
      },
    });
  } else {
    drawer.value!.data = await getCloudInfo(row?.id);
    drawer.value!.visible = true;
  }
};

// 编辑成功重载页面
const editChangeReloadData = () => {
  drawer.value!.visible = false;
  rehandlePageChange({ current: 1, pageSize: 10, previous: 1 });
};

onMounted(() => {
  fetchData();
});

const router = useRouter();

const rowKey = 'id';

const HandleCloudAliasChange = () => {
  rehandlePageChange({ current: 1, previous: 1, pageSize: 10 });
};

const rehandlePageChange = (curr: PageInfo) => {
  console.log('分页变化', curr);
  searchParams.pageNum = curr.current;
  searchParams.pageSize = curr.pageSize;
  fetchData();
};

const handleClickDetail = (item: any) => {
  router.push(`/cloud/${item.id}`);
};

const handleClickDelete = (row: { id: any; rowIndex: any }) => {
  const dialog = DialogPlugin.confirm({
    theme: 'danger',
    header: '确认删除?',
    body: '删除后，所关联的证书后续更新将无法自动部署，请确认删除！',
    closeOnOverlayClick: false,
    confirmBtn: {
      theme: 'danger',
    },
    onConfirm: async () => {
      try {
        await deleteCloudInfo(row.id);
        MessagePlugin.success('已删除');
        // 刷新页面
        rehandlePageChange(defaultPageInfo);
      } catch (err) {
        console.log('err', err.message);
        MessagePlugin.error('操作失败');
      }
      dialog.destroy();
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

const handleClickGuide = () => {
  router.push('/cloud/guide');
};
</script>

<style lang="less" scoped>
.list-card-container {
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}

.list-page-title {
  margin-bottom: var(--td-comp-margin-xl);
}

.left-operation-container {
  display: flex;
  align-items: center;
  margin-bottom: var(--td-comp-margin-s);

  .selected-count {
    display: inline-block;
    margin-left: var(--td-comp-margin-l);
    color: var(--td-text-color-secondary);
  }
}

.search-input {
  width: 360px;
}

.name-col-style {
  display: flex;
  flex-direction: column;

  .icon {
    margin-left: var(--td-comp-margin-xs);
    color: var(--td-gray-color-14);
  }

  .name-col-alias {
    color: var(--td-font-gray-1);

    .icon {
      display: none;
    }

    &:hover {
      .icon {
        display: inline-block;
      }
    }
  }
}

.provider-col-style {
  display: flex;
  align-items: center;
  gap: 5px;

  :deep(.t-image__wrapper) {
    background: none;
  }
}

.certificate-info {
  p {
    line-height: 20px;
  }
}

.latest-record-info {
  p {
    line-height: 20px;
  }
}
</style>
