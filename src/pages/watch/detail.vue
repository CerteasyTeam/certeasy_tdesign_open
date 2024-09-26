<template>
  <div>
    <!-- page-nav -->
    <page-nav :show-back="true" :title="`${watchInfo?.alias || watchInfo?.name} 监控详情`" />
    <div class="watch-detail">
      <t-card class="watch-card" :bordered="false">
        <h2 class="watch-detail-title">
          <t-icon name="certificate" size="24"></t-icon>
          <copy-label class="ml-[5px]" :value="watchInfo?.name" />
        </h2>
        <t-row class="watch-detail-row">
          <t-col :span="1">监控名称：</t-col>
          <t-col :span="3">
            <watch-alias
              :watch-id="watchInfo?.id"
              :watch-alias="watchInfo?.alias || watchInfo?.name"
              :show-icon="false"
              :on-complete="reloadWatchInfo"
            />
          </t-col>
          <t-col :span="1">创建时间：</t-col>
          <t-col :span="3">{{ watchInfo?.createTime || '--' }}</t-col>
        </t-row>
        <t-row class="watch-detail-row">
          <t-col :span="1">监控域名：</t-col>
          <t-col :span="3">{{ watchInfo?.domain || '--' }}</t-col>
        </t-row>
        <t-row class="watch-detail-row">
          <t-col :span="1">监控IP：</t-col>
          <t-col :span="3">{{ watchInfo?.ip || '--' }}</t-col>
        </t-row>
        <t-row class="watch-detail-row">
          <t-col :span="1">监控端口：</t-col>
          <t-col :span="3">{{ watchInfo?.port || '443' }}</t-col>
        </t-row>
      </t-card>
      <t-card class="watch-card">
        <h3 class="watch-detail-title">监测记录</h3>
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
          <template #certificate="{ row }">
            <div v-if="row.watchCertificateId" class="certificate-info">
              <span
                class="info-status success"
                :class="{ error: row.status == 0 || renderExpiredTimeDay(row.expiredTime).diffDays <= 0 }"
              >
                {{ renderExpiredTimeDay(row.expiredTime).tips }}
              </span>
            </div>
            <span v-else>--</span>
          </template>
          <template #status="{ row }">
            <!-- 0 错误 1 进行中 2 监听中 -->
            <t-tag :theme="row.status == 1 ? 'primary' : row.status == 2 ? 'success' : 'danger'" variant="light">{{
              row.status == 1 ? '检测中' : row.status == 2 ? '已检测' : '检测失败'
            }}</t-tag>
          </template>
          <template #createTime="{ row }">
            {{ row.createTime }}
          </template>

          <template #op="{ row }">
            <t-space>
              <t-link
                v-if="row.status == 2"
                :disabled="row.status == 1"
                theme="primary"
                @click="handleClickDetail(row)"
              >
                查看
              </t-link>
              <t-link v-if="row.status == 0" theme="primary" @click="handleClickReload(row)"> 重新检测 </t-link>
            </t-space>
          </template>
        </t-table>
      </t-card>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'WatchDetail',
};
</script>

<script setup lang="ts">
import dayjs from 'dayjs';
import type { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getWatchInfo, getWatchRecordList, reloadWatchRecord } from '@/api/watch';
// import { useCopy } from '@/hooks';
import { t } from '@/locales';

import WatchAlias from './components/watch-alias/index.vue';

// const { copyText } = useCopy({
//   successDuration: 2e3,
//   onSuccess: () => MessagePlugin.success('复制成功'),
//   onError: (error: Error) => console.error('Failed to copy text:', error),
// });

const route = useRoute();
const router = useRouter();
const watchId = computed(() => route.params.id as unknown as number);
// 详情
const watchInfo = ref({
  id: 0,
  name: '',
  alias: '',
  domain: '',
  ip: '',
  port: '',
  createTime: '',
});

// 记录表格

// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  {
    title: '监控时间',
    align: 'left',
    width: 200,
    colKey: 'createTime',
    fixed: 'left',
  },
  {
    title: '证书机构',
    width: 250,
    colKey: 'issuer',
  },
  {
    title: '证书状态',
    width: 200,
    colKey: 'certificate',
  },
  {
    title: '过期时间',
    width: 200,
    colKey: 'expiredTime',
  },
  {
    title: '吊销时间',
    width: 200,
    colKey: 'revokedTime',
  },
  {
    title: '任务状态',
    width: 100,
    colKey: 'status',
  },
  {
    title: '错误信息',
    colKey: 'error',
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
    return {
      diffDays,
      tips: `生效中 · ${diffDays}天后过期`,
    };
  }
  return {
    diffDays,
    tips: `已失效 · ${Math.abs(diffDays)}天`,
  };
};

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
const rehandlePageChange = (curr: PageInfo, pageInfo?: unknown) => {
  console.log('分页变化', curr, pageInfo);
  searchParams.pageNum = curr.current;
  searchParams.pageSize = curr.pageSize;
  reloadWatchRecordList();
};

const reloadWatchRecordList = async () => {
  // 加载历史列表
  const { records, total } = await getWatchRecordList(watchId.value, searchParams);
  data.value = records;
  pagination.value = {
    ...pagination.value,
    total,
  };
};

const handleClickDetail = (item: any) => {
  router.push(`/watch/${watchId.value}/record/${item.id}`);
};

const handleClickReload = (item: any) => {
  reloadWatchRecord(watchId.value, item.id)
    .then(() => {
      MessagePlugin.error('已提交，请等待');
      rehandlePageChange({ current: 1, pageSize: 10, previous: 1 });
    })
    .catch(() => {
      MessagePlugin.error('数据异常');
    });
};

const reloadWatchInfo = async () => {
  try {
    // 加载详情
    watchInfo.value = await getWatchInfo(watchId.value);
    reloadWatchRecordList();
  } catch (err) {
    console.log(err);
  }
};

onMounted(async () => {
  // 加载详情
  reloadWatchInfo();
});
</script>

<style lang="less" scoped>
.watch-card:not(:last-child) {
  margin-bottom: 16px;
}

.watch-detail {
  &-title {
    margin-bottom: var(--td-comp-margin-l);
    font: 500 var(--td-font-size-title-large) / var(--td-line-height-title-large) var(--td-font-family);
    line-height: 26px;
  }

  &-row {
    margin-bottom: var(--td-comp-margin-s);
  }
}
</style>
