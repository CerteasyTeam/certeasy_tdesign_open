<template>
  <div>
    <!-- page-nav -->
    <page-nav title="概览" />
    <t-row :gutter="[24, 24]">
      <!-- 左侧统计和列表 -->
      <t-col :flex="3">
        <div class="user-left-greeting mb-[18px]">
          <div>
            Hi，{{ renderName }}
            <span class="regular">
              {{ getTimePeriod }}好，今天是你使用 <b>Certeasy</b> 的第 <b>{{ renderTimeDay }}</b> 天</span
            >
          </div>
          <img src="@/assets/assets-certeasy-logo.png" class="logo" />
        </div>
        <!-- 统计数据 证书（总数、申请中、已签发、已过期、即将到期） -->
        <t-card class="content-container" :bordered="false">
          <t-row class="static-count">
            <t-col :xs="8" :xl="4">
              <t-card
                class="dashboard-item"
                :shadow="false"
                title="证书管理"
                :bordered="false"
                @click="routerGo('/certificate')"
              >
                <div class="dashboard-item-top">
                  <span>{{ overview.certificate!.totalCount || 0 }}</span>
                </div>
                <div class="dashboard-item-left"></div>
                <template #footer>
                  <div class="dashboard-item-bottom">
                    <div class="dashboard-item-block">
                      <div class="item-block">
                        已签发 <span class="signed">{{ overview.certificate!.issuedCount || 0 }}</span>
                      </div>
                      <div class="item-block">
                        生效中 <span class="success">{{ overview.certificate!.inEffectiveCount || 0 }}</span>
                      </div>
                      <div class="item-block">
                        准备过期 <span class="ready2expire">{{ overview.certificate!.willExpiredCount || 0 }}</span>
                      </div>
                      <div class="item-block">
                        已过期 <span class="expired">{{ overview.certificate!.inExpiredCount || 0 }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </t-card>
            </t-col>
            <t-col :xs="8" :xl="3">
              <t-card
                class="dashboard-item"
                :shadow="false"
                title="自动化部署"
                :bordered="false"
                @click="routerGo('/cloud')"
              >
                <div class="dashboard-item-top">
                  <span>{{ overview.deploy!.totalCount || 0 }}</span>
                </div>
                <div class="dashboard-item-left"></div>
                <template #footer>
                  <!-- 部署统计 证书（总数、部署中、成功数、失败数） -->
                  <div class="dashboard-item-bottom">
                    <div class="dashboard-item-block">
                      <div class="item-block">
                        部署中 <span class="signed">{{ overview.deploy!.inDeployingCount || 0 }}</span>
                      </div>
                      <div class="item-block">
                        成功数 <span class="success">{{ overview.deploy!.successCount || 0 }}</span>
                      </div>
                      <div class="item-block">
                        失败数 <span class="expired">{{ overview.deploy!.failedCount || 0 }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </t-card>
            </t-col>
            <t-col :xs="8" :xl="3">
              <t-card
                class="dashboard-item"
                :shadow="false"
                title="证书监控"
                :bordered="false"
                @click="routerGo('/watch')"
              >
                <div class="dashboard-item-top">
                  <span>{{ overview.watch!.totalCount || 0 }}</span>
                </div>
                <div class="dashboard-item-left"></div>
                <template #footer>
                  <!-- 部署统计 证书（总数、部署中、成功数、失败数） -->
                  <div class="dashboard-item-bottom">
                    <div class="dashboard-item-block">
                      <div class="item-block">
                        即将过期 <span class="ready2expire">{{ overview.watch!.willExpiredCount || 0 }}</span>
                      </div>
                      <div class="item-block">
                        成功数 <span class="success">{{ overview.watch!.successCount || 0 }}</span>
                      </div>
                      <div class="item-block">
                        失败数 <span class="expired">{{ overview.watch!.errorCount || 0 }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </t-card>
            </t-col>
            <t-col :xs="8" :xl="1">
              <t-card class="dashboard-item" :shadow="false" title="云资源" :bordered="false">
                <div class="dashboard-item-top">
                  <span>{{ overview.cloud!.totalCount || 0 }}</span>
                </div>
                <div class="dashboard-item-left"></div>
                <template #footer>
                  <t-link hover="color" href="/cloud/guide" target="_blank">
                    <template #suffix-icon>
                      <t-icon name="chevron-right" size="16" />
                    </template>
                    添加资源
                  </t-link>
                </template>
              </t-card>
            </t-col>
            <t-col :xs="8" :xl="1">
              <t-card class="dashboard-item" :shadow="false" title="DNS授权" :bordered="false">
                <div class="dashboard-item-top">
                  <span>{{ overview.dns!.totalCount || 0 }}</span>
                </div>
                <div class="dashboard-item-left"></div>
                <template #footer>
                  <t-link hover="color" href="/dns" target="_blank">
                    <template #suffix-icon>
                      <t-icon name="chevron-right" size="16" />
                    </template>
                    增加授权
                  </t-link>
                </template>
              </t-card>
            </t-col>
          </t-row>
        </t-card>
        <!-- 消息列表 -->
        <t-card class="content-container message-list" :bordered="false">
          <t-row class="mb-[10px]" align="center" justify="space-between">
            <div class="list-title">
              <h2 class="mb-[15px]">
                消息列表
                <t-link class="more" theme="primary" hover="color">
                  <t-icon name="swap-right" size="20"></t-icon>
                </t-link>
              </h2>
            </div>
            <div class="left-operation-container">
              <t-button
                size="small"
                :disabled="!selectedRowKeys.length"
                theme="danger"
                variant="outline"
                @click="handleOperation('delete')"
              >
                删除
              </t-button>
              <t-button
                size="small"
                :disabled="!selectedRowKeys.length"
                variant="outline"
                @click="handleOperation('read')"
              >
                标为已读
              </t-button>
              <t-button size="small" variant="outline" @click="handleOperation('readAll')"> 全部标为已读 </t-button>
            </div>
          </t-row>
          <t-table
            hover
            :data="data"
            :columns="COLUMNS"
            :row-key="rowKey"
            cell-empty-content="--"
            :selected-row-keys="selectedRowKeys"
            :pagination="pagination"
            :loading="dataLoading"
            @page-change="rehandlePageChange"
            @select-change="(value: number[]) => rehandleSelectChange(value)"
          >
            <template #title="{ row }">
              <div class="flex items-center" :class="[row.status === 0 ? 'text-unread' : 'text-read']">
                <t-icon
                  :name="row.status === 0 ? 'mail' : 'mark-as-unread'"
                  size="18"
                  :color="row.status === 0 ? '#0052d9' : '#888888'"
                ></t-icon>
                <t-link theme="default" hover="color" class="ml-[8px]" variant="color">{{ row.title }}</t-link>
              </div>
            </template>
            <template #createTime="{ row }">
              <div class="flex items-center" :class="[row.status === 0 ? 'text-unread' : 'text-read']">
                <span>{{ row.createTime }}</span>
              </div>
            </template>
          </t-table>
        </t-card>
      </t-col>
      <!-- 右侧信息和计划 -->
      <t-col class="overview-right" :flex="1">
        <t-card class="user-intro" :bordered="false">
          <t-avatar size="80px">{{ renderName }}</t-avatar>
          <div class="name">{{ userInfo.email }}</div>
          <div class="position">{{ userInfo.createTime }}</div>
        </t-card>
        <!-- 帮助提示 -->
        <t-card class="user-help">
          <h3>常见问题</h3>
          <t-divider />
          <div class="user-help-box">
            <t-row v-for="(item, idx) in userHelp" :key="idx" class="mt-[5px]">
              <t-link :href="item.link" target="_blank">{{ item.title }}</t-link>
            </t-row>
          </div>
        </t-card>
        <!-- 工具箱 -->
        <t-card class="user-tool">
          <h3>证书工具箱</h3>
          <t-divider />
          <div class="user-tool-box">
            <t-button v-for="(item, idx) in useTools" :key="idx" :href="item.link" target="_blank" variant="outline"
              ><template #icon> <t-icon :name="item.icon"></t-icon> </template>{{ item.name }}</t-button
            >
          </div>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Overview',
};
</script>

<script setup lang="ts">
import dayjs from 'dayjs';
import type { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';

import { commOverview } from '@/api/common';
import { deleteMessageInfo, getMessageList, readMessageInfo } from '@/api/message';
import { defaultPageInfo } from '@/constants';
import { useUserStore } from '@/store';

const router = useRouter();
const user = useUserStore();
const { userInfo } = toRefs(user);

const renderName = computed(() => userInfo.value?.email.substring(0, userInfo.value?.email.indexOf('@')));

const getTimePeriod = computed(() => {
  const hours = new Date().getHours();

  if (hours >= 5 && hours < 12) {
    return '早上';
  }
  if (hours >= 12 && hours < 13) {
    return '中午';
  }
  if (hours >= 13 && hours < 18) {
    return '下午';
  }
  if (hours >= 18 && hours < 24) {
    return '晚上';
  }
  return '凌晨';
});

const renderTimeDay = computed(() => {
  const currentDate = dayjs();
  const targetDate = dayjs(userInfo.value?.createTime);
  // 计算两个日期之间的天数
  const daysCount = Math.abs(Math.round(targetDate.diff(currentDate, 'day', true)));
  return daysCount <= 0 ? 1 : daysCount;
});

// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '标题',
    align: 'left',
    colKey: 'title',
    fixed: 'left',
  },
  {
    title: '创建时间',
    width: 300,
    colKey: 'createTime',
  },
];

const rowKey = 'id';
const data = ref([]);
const dataLoading = ref(false);
const selectedRowKeys = ref([]);
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
  reloadMessageList();
};

const rehandleSelectChange = (val: number[]) => {
  selectedRowKeys.value = val;
};

const handleOperation = async (action: string) => {
  try {
    if (action === 'delete') {
      await deleteMessageInfo({ ids: selectedRowKeys.value });
    } else if (action === 'read') {
      await readMessageInfo({ ids: selectedRowKeys.value });
    } else {
      // 获取列表的ids
      const listIds = data.value?.map((item: any) => item.id);
      await readMessageInfo({ ids: listIds });
    }
    // 重载列表
    rehandlePageChange(defaultPageInfo);
    selectedRowKeys.value = [];
    MessagePlugin.success('操作成功');
  } catch (e) {
    console.log(e);
    MessagePlugin.error('操作失败');
  }
};

// const moreOptions = [
//   { content: '操作一', value: 1 },
//   { content: '操作二', value: 2 },
//   { content: '操作三', value: 3 },
//   { content: '操作四', value: 4 },
// ];

// const handleClickOption = (data: any) => {
//   MessagePlugin.success(`选中【${data.value.content}】`);
// };

const reloadMessageList = async () => {
  try {
    const { records, total } = await getMessageList(searchParams);
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

// overview
const overview = ref<any>({
  certificate: {
    totalCount: 0,
    issuedCount: 0,
    inEffectiveCount: 0,
    willExpiredCount: 0,
    inExpiredCount: 0,
  },
  deploy: {
    totalCount: 0,
    inDeployingCount: 0,
    successCount: 0,
    failedCount: 0,
  },
  cloud: {
    totalCount: 0,
  },
  dns: {
    totalCount: 0,
  },
  watch: {
    totalCount: 0,
    successCount: 0,
    errorCount: 0,
  },
});

const reloadOverview = async () => {
  try {
    const data = await commOverview();
    overview.value = { ...overview.value, ...data };
    console.log('overview.value', overview.value);
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

/**
 * 帮助提示
 */
const userHelp = ref([
  {
    title: '如何在Certeasy进行证书申请',
    link: 'https://docs.certeasy.cn/guide/quick-start.html',
  },
  {
    title: '如何进行证书申请的域名DNS授权',
    link: 'https://docs.certeasy.cn/dns/aliyun.html',
  },
  {
    title: '常见的证书格式PEM、PFX、JKS有什么区别，如何进行转换',
    link: 'https://docs.certeasy.cn/faq.html',
  },
  {
    title: '申请的证书如何自动化部署，如何配置云资源证书',
    link: 'https://docs.certeasy.cn/cloud/aliyun/ssl.html',
  },
]);

/**
 * 工具箱
 */
const useTools = ref([
  {
    name: '证书格式转换',
    icon: 'pending',
    link: 'https://myssl.com/cert_convert_wasm.html',
  },
  {
    name: 'CSR在线生成',
    icon: 'assignment',
    link: 'https://myssl.com/csr_create.html',
  },
  {
    name: 'SSL配置生成器',
    icon: 'widget',
    link: 'https://ssl-config.mozilla.org/',
  },
  {
    name: 'ATS合规检测',
    icon: 'verified',
    link: 'https://myssl.com/ats.html',
  },
  {
    name: '证书链修复',
    icon: 'link',
    link: 'https://myssl.com/chain_download.html',
  },
  {
    name: 'DNS诊断工具',
    icon: 'sensors',
    link: 'https://myssl.com/dns_check.html#dns_check',
  },
]);

const routerGo = (path: string) => {
  router.push(path);
};

onMounted(() => {
  reloadMessageList();
  reloadOverview();
});
</script>

<style lang="less" scoped>
.row-container:not(:last-child) {
  margin-bottom: 16px;
}

:deep(.t-card__title) {
  font: var(--td-font-title-large);
  font-weight: 400;
}

.user-left-greeting {
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);
  font: var(--td-font-title-large);
  background: var(--td-bg-color-container);
  color: var(--td-text-color-primary);
  text-align: left;
  border-radius: var(--td-radius-medium);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .regular {
    margin-left: var(--td-comp-margin-xl);
    font: var(--td-font-body-medium);
  }

  .logo {
    width: 168px;
  }
}

.user-info-list {
  margin-top: var(--td-comp-margin-l);
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);

  .content {
    width: 90%;
  }

  :deep(.t-card__header) {
    padding: 0;
  }

  :deep(.t-card__body) {
    padding: 0;
  }

  .contract {
    &-title {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin: var(--td-comp-margin-xxxl) 0 var(--td-comp-margin-l);
      font: var(--td-font-body-medium);
      color: var(--td-text-color-placeholder);
    }

    &-detail {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font: var(--td-font-body-medium);
      color: var(--td-text-color-primary);
    }
  }

  .contract:last-child {
    margin-bottom: 0;
  }
}

.user-intro {
  padding: var(--td-comp-paddingTB-xl) var(--td-comp-paddingLR-xl);
  background: var(--td-brand-color);
  border-radius: var(--td-radius-medium);
  color: var(--td-text-color-primary);

  :deep(.t-card__body) {
    padding: 0;
  }

  .name {
    font: var(--td-font-title-large);
    margin-top: var(--td-comp-margin-xxxl);
    color: var(--td-text-color-anti);
  }

  .position {
    font: var(--td-font-body-medium);
    margin-top: var(--td-comp-margin-s);
    color: var(--td-text-color-anti);
  }

  .user-info {
    line-height: 24px;
    font-size: 14px;
    color: var(--td-text-color-primary);

    .hiredate,
    .del,
    .mail {
      display: flex;
    }

    .t-icon {
      height: 24px;
      margin-right: 8px;
    }

    .del {
      margin: 16px 0;
    }
  }
}

.content-container {
  margin-top: var(--td-comp-margin-l);
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);

  :deep(.t-card__header) {
    padding: 0;
  }

  :deep(.t-card__body) {
    padding: 0;
  }

  .card-padding-no {
    margin-top: var(--td-comp-margin-xxxl);

    :deep(.t-card__body) {
      margin-top: var(--td-comp-margin-xxl);
    }
  }
}

.message-list {
  :deep(.t-button--variant-outline.t-is-disabled) {
    background-color: transparent;
  }

  .list-title {
    font: var(--td-font-title-large);
    color: var(--td-text-color-primary);
  }

  .text-unread {
    font: var(--td-font-link-medium);
    color: var(--td-text-color-primary);

    :deep(.t-link) {
      font: var(--td-font-link-medium);
      color: var(--td-text-color-primary);
    }
  }

  .text-read {
    font: var(--td-font-link-medium);
    color: var(--td-gray-color-5);
  }

  :deep(.t-link) {
    line-height: var(--td-line-height-body-medium);
    color: #888;

    &:hover {
      color: var(--td-text-color-primary);
    }

    &.more {
      color: var(--td-brand-color) !important;
    }
  }
}

.overview-right {
  :deep(.t-card:not(:last-child)) {
    margin-bottom: var(--td-comp-margin-xl);
  }

  :deep(.t-divider) {
    margin: var(--td-comp-margin-m) 0;
  }
}

.dashboard-item {
  box-shadow: none;

  :deep(.t-card__header) {
    padding: 0;
  }

  :deep(.t-card__footer) {
    padding: 0;
  }

  :deep(.t-card__title) {
    font: var(--td-font-body-medium);
    color: var(--td-text-color-secondary);
  }

  :deep(.t-card__body) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    position: relative;
    padding: 0;
    margin-top: var(--td-comp-margin-s);
    margin-bottom: var(--td-comp-margin-l);
  }

  &:hover {
    cursor: pointer;
  }

  &-top {
    display: flex;
    flex-direction: row;
    align-items: flex-start;

    > span {
      display: inline-block;
      color: var(--td-text-color-primary);
      font-size: var(--td-font-size-headline-large);
      line-height: var(--td-line-height-headline-large);
    }
  }

  &-bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    > .t-icon {
      cursor: pointer;
      font-size: var(--td-comp-size-xxxs);
    }
  }

  &-block {
    display: flex;
    gap: var(--td-comp-paddingLR-s);
    align-items: center;
    justify-content: flex-start;

    > .item-block {
      display: inline-block;
      color: var(--td-text-color-primary);

      span {
        font-size: var(--td-font-size-title-medium);
      }

      .signed {
        color: var(--td-brand-color);
      }

      .success {
        color: var(--td-success-color-6);
      }

      .ready2expire {
        color: var(--td-warning-color-5);
      }

      .expired {
        color: var(--td-error-color-6);
      }
    }
  }

  &-trend {
    margin-left: var(--td-comp-margin-s);
  }

  &-left {
    position: absolute;
    top: 0;
    right: 0;

    > span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--td-comp-size-xxxl);
      height: var(--td-comp-size-xxxl);
      background: var(--td-brand-color-light);
      border-radius: 50%;

      .t-icon {
        font-size: 24px;
        color: var(--td-brand-color);
      }
    }
  }

  &--main-color {
    background: var(--td-brand-color);
    color: var(--td-text-color-primary);

    :deep(.t-card__title),
    .dashboard-item-top span,
    .dashboard-item-bottom {
      color: var(--td-text-color-anti);
    }

    .dashboard-item-block {
      color: var(--td-text-color-anti);
      opacity: 0.6;
    }

    .dashboard-item-bottom {
      color: var(--td-text-color-anti);
    }
  }
}

// 工具
.user-tool {
  .user-tool-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--td-comp-margin-m);
    flex-wrap: wrap;
  }

  :deep(.t-button + .t-button) {
    margin-left: 0;
  }
}
</style>
