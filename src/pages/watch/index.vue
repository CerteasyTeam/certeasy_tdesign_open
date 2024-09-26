<template>
  <div>
    <!-- page-nav -->
    <page-nav title="证书监控" />
    <t-card class="list-card-container" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-button @click="handleAddWatch"> 新增监控 </t-button>
        </div>
        <div class="search-input">
          <t-input v-model="searchParams.keyword" placeholder="输入监控ID或域名关键词" clearable>
            <template #prefix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-button theme="primary" @click="HandleWatchAliasChange">搜索</t-button>
        </div>
      </t-row>
      <t-table
        hover
        :data="data"
        :columns="COLUMNS"
        row-key="id"
        cell-empty-content="--"
        :pagination="pagination"
        :loading="dataLoading"
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
              <watch-alias
                :watch-id="row?.id"
                :watch-alias="row?.alias || row?.name"
                :show-icon="false"
                :on-complete="HandleWatchAliasChange"
              />
            </div>
          </div>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status == 1 ? 'primary' : 'warning'" variant="light">{{
            row.status == 1 ? '正常' : '错误'
          }}</t-tag>
        </template>
        <template #certificate="{ row }">
          <div v-if="row.latestRecordId && row.expiredTime" class="certificate-info">
            <p class="info-status success" :class="{ error: row.status == 0 }">
              {{ renderExpiredTimeDay(row.expiredTime) }}
            </p>
            <p>过期时间：{{ row.expiredTime }}</p>
          </div>
          <span v-else>--</span>
        </template>
        <template #lastRecord="{ row }">
          <div class="latest-record-info">
            <p
              class="info-status loading"
              :class="{ error: row.latestRecordStatus == 0, success: row.latestRecordStatus == 2 }"
            >
              {{ row.latestRecordStatus == 1 ? '检测中' : row.latestRecordStatus == 2 ? '已检测' : '检测失败' }}
              <t-icon v-if="row.latestRecordStatus == 1" name="loading"></t-icon>
            </p>
            <p>监测时间：{{ row.latestRecordTime }}</p>
          </div>
        </template>
        <template #createTime="{ row }">
          {{ row.createTime }}
        </template>

        <template #op="{ row }">
          <t-space>
            <t-link theme="primary" @click="handleClickDetail(row)"> 查看 </t-link>
            <t-link theme="danger" @click="handleClickDelete(row)"> 删除 </t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 新增弹窗 -->
    <t-drawer
      v-model:visible="drawerVisible"
      size="360"
      header="新增监控"
      :on-confirm="onClickConfirm"
      :close-btn="true"
    >
      <t-form ref="formRef" :data="formData" :rules="formRules" label-align="top" :label-width="100">
        <t-form-item name="domain" label="监控域名">
          <t-input v-model="formData.domain" placeholder="请输入监控域名: certeasy.cn" />
        </t-form-item>
        <t-form-item name="ip" label="监控IP">
          <t-input v-model="formData.ip" placeholder="请输入监控IP: 1.1.1.1" />
        </t-form-item>
        <t-form-item name="port" label="监控端口">
          <t-input v-model="formData.port" placeholder="请输入监控端口: 443" />
        </t-form-item>
      </t-form>
    </t-drawer>
  </div>
</template>

<script lang="ts">
export default {
  name: 'WatchIndex',
};
</script>

<script setup lang="ts">
import dayjs from 'dayjs';
import * as psl from 'psl';
import { SearchIcon } from 'tdesign-icons-vue-next';
import type {
  ButtonProps,
  DrawerProps,
  FormInstanceFunctions,
  FormRule,
  PageInfo,
  PrimaryTableCol,
  TableRowData,
} from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { addWatch, deleteWatch, getWatchList } from '@/api/watch';
import { defaultPageInfo } from '@/constants';
import { useCopy } from '@/hooks';
import { t } from '@/locales';

import WatchAlias from './components/watch-alias/index.vue';

const { copyText } = useCopy({
  successDuration: 2e3,
  onSuccess: () => MessagePlugin.success('复制成功'),
  onError: (error: Error) => console.error('Failed to copy text:', error),
});

const router = useRouter();

// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  {
    title: '监控ID',
    align: 'left',
    width: 220,
    colKey: 'name',
    fixed: 'left',
  },
  {
    title: '域名',
    width: 180,
    colKey: 'domain',
  },
  {
    title: 'IP',
    width: 200,
    colKey: 'ip',
  },
  {
    title: '端口',
    width: 80,
    colKey: 'port',
  },
  {
    title: '状态',
    width: 80,
    colKey: 'status',
  },
  {
    title: '创建时间',
    width: 200,
    colKey: 'createTime',
  },
  {
    title: '检测历史',
    width: 100,
    colKey: 'recordsCount',
  },
  {
    title: '颁发机构',
    width: 200,
    colKey: 'issuer',
  },
  {
    title: '证书状态',
    width: 200,
    colKey: 'certificate',
  },
  {
    title: '最近监测',
    width: 200,
    colKey: 'lastRecord',
  },
  {
    title: t('pages.listBase.operation'),
    align: 'right',
    fixed: 'right',
    colKey: 'op',
  },
];

const renderExpiredTimeDay = (date: string) => {
  // 获取当前日期
  const currentDate = dayjs();
  // 设定目标日期
  const targetDate = dayjs(date); // 替换为你的目标日期
  // 计算两个日期之间的天数
  const diffDays = targetDate.diff(currentDate, 'day');
  if (diffDays >= 0) {
    return `生效中 · ${diffDays}天后过期`;
  }
  return `已失效 · ${Math.abs(diffDays)}天`;
};

// 数据加载
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

const HandleWatchAliasChange = () => {
  rehandlePageChange({ current: 1, previous: 1, pageSize: 10 });
};

const reloadListData = async () => {
  dataLoading.value = true;
  try {
    const { records, total } = await getWatchList(searchParams);
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

const rehandlePageChange = (curr: PageInfo) => {
  console.log('分页变化', curr);
  searchParams.pageNum = curr.current;
  searchParams.pageSize = curr.pageSize;
  reloadListData();
};

const handleClickDetail = (item: any) => {
  router.push(`/watch/${item.id}`);
};

const handleClickDelete = (row: { id: any; rowIndex: any }) => {
  const dialog = DialogPlugin.confirm({
    theme: 'danger',
    header: '确认删除?',
    body: '删除后，所关联的证书后续续签将无法进行验证，会导致证书签发失败，请确认删除！',
    closeOnOverlayClick: false,
    confirmBtn: {
      theme: 'danger',
    },
    onConfirm: async () => {
      try {
        await deleteWatch(row.id);
        MessagePlugin.success('已删除');
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

// 新增弹窗
const drawerVisible = ref(false);
const formRef = ref<FormInstanceFunctions>();
const formData = ref({
  domain: '',
  ip: null,
  port: null,
});
const formRules: Record<string, FormRule[]> = {
  domain: [{ required: true, message: '请输入监控域名', type: 'error' }],
  ip: [{ required: false, message: '请输入监控IP', type: 'error' }],
  port: [{ required: false, message: '请输入监控端口', type: 'error' }],
};

const handleAddWatch: ButtonProps['onClick'] = () => {
  resetFormData();
  drawerVisible.value = true;
};

const resetFormData = () => {
  formData.value!.domain = '';
  formData.value!.ip = null;
  formData.value!.port = null;
};

const onClickConfirm: DrawerProps['onConfirm'] = () => {
  formRef.value?.validate().then(async (e) => {
    // 表单校验通过
    if (e === true) {
      console.log('formData', formData.value);
      if (!psl.isValid(formData.value?.domain)) {
        MessagePlugin.error(`域名不是合法域名,请检查输入`);
        return;
      }
      try {
        MessagePlugin.info('数据保存中...', 1000);
        await addWatch(formData.value);
        resetFormData();
        drawerVisible.value = false;
        MessagePlugin.success('数据保存成功!');
        // todo 刷新数据
        HandleWatchAliasChange();
      } catch (err) {
        MessagePlugin.error(`添加失败：${err.message}`);
      }
    }
  });
};

onMounted(() => {
  reloadListData();
});
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
