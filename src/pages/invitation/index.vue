<template>
  <div>
    <!-- page-nav -->
    <page-nav title="推广激励" />
    <t-row :gutter="15">
      <t-col v-if="false" :span="4">
        <t-card :bordered="false">
          <h2 class="invite-title">
            <t-icon name="animation" size="16"></t-icon>
            推广统计
          </h2>
          <div class="invite-count-container">
            <div class="invite-count-box box1">
              <div class="tit">累计访客</div>
              <div class="count">0</div>
            </div>
            <div class="invite-count-box box2">
              <div class="tit">累计注册</div>
              <div class="count">0</div>
            </div>
            <div class="invite-count-box box3">
              <div class="tit">邀请充值</div>
              <div class="count">0.00</div>
            </div>
            <div class="invite-count-box box4">
              <div class="tit">累计奖励</div>
              <div class="count">0.00</div>
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :span="12">
        <t-card :bordered="false">
          <div class="invite-link-container">
            <h4 class="invite-title">
              <t-icon name="link-1" size="14px" />
              <span class="ml-[5px]">你的邀请链接:</span>
            </h4>
            <t-row>
              <t-col :span="6">
                <t-input readonly :value="userShareLink">
                  <template #suffix-icon>
                    <t-icon class="copy-icon" name="file-copy" size="16px" @click="copyText(userShareLink)" />
                  </template>
                </t-input>
              </t-col>
            </t-row>
          </div>
          <div class="invite-gift-container mt-[20px]">
            <h4 class="invite-title mt-[10px]">
              <t-icon name="saving-pot" size="14px" />
              <span class="ml-[5px]">推广奖励:</span>
            </h4>
            <t-row>
              <t-col :span="12">
                <p>
                  1. 邀请一位用户注册成功，您可获得
                  <span class="coin">{{ configStore?.invitationActivateCoins }}</span> 金币
                </p>
                <p>
                  2. 如果被邀请用户成为付费用户，您将获得充值金币的
                  <span class="coin">{{ configStore?.invitationRechargeRewardRate }}%</span> 的额外金币奖励<br />
                  <span style="color: var(--td-gray-color-5); font-size: var(--td-font-size-body-medium)"
                    >（注册用户充值 <span class="coin">100</span> 可得
                    <span class="coin">{{ Math.floor(100 * (configStore?.invitationRechargeRewardRate / 100)) }}</span
                    >金币）</span
                  >
                </p>
              </t-col>
            </t-row>
          </div>
        </t-card></t-col
      >
    </t-row>
    <t-card class="list-card-container mt-[20px]" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="search-input">
            <t-input v-model="searchParams.keyword" placeholder="输入用户注册邮箱关键词" clearable>
              <template #prefix-icon>
                <search-icon size="16px" />
              </template>
            </t-input>
            <t-button theme="primary" @click="reloadUserInvitationList">搜索</t-button>
          </div>
        </div>
      </t-row>
      <t-table
        row-key="id"
        hover
        :data="data"
        :columns="COLUMNS"
        cell-empty-content="--"
        :pagination="pagination"
        :loading="dataLoading"
        @page-change="rehandlePageChange"
      >
        <template #signUser="{ row }">
          <span>{{ row.signup?.email }}</span>
        </template>
        <template #coin="{ row }">
          <span class="coin">{{ row.coin }}</span>
        </template>
        <template #payCoin="{ row }">
          <span v-if="row.payCoin" class="coin">{{ row.payCoin }}</span>
          <span v-else>--</span>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script lang="ts">
export default {
  name: 'WatchIndex',
};
</script>

<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin, type PageInfo, type PrimaryTableCol, type TableRowData } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref, toRefs } from 'vue';

import { getUserInvitationList } from '@/api/user';
import { useCopy } from '@/hooks';
import { useConfigStore, useUserStore } from '@/store';

const { copyText } = useCopy({
  successDuration: 2e3,
  onSuccess: () => MessagePlugin.success('复制成功'),
  onError: (error: Error) => console.error('Failed to copy text:', error),
});

const user = useUserStore();
const configStore = useConfigStore();
const { appDomain } = toRefs(configStore);

// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  {
    title: '注册时间',
    align: 'left',
    width: 220,
    colKey: 'createTime',
    fixed: 'left',
  },
  {
    title: '注册用户',
    colKey: 'signUser',
  },
  {
    title: '推广激励（金币）',
    width: 180,
    colKey: 'coin',
  },
  {
    title: '充值激励（金币）',
    width: 180,
    colKey: 'payCoin',
  },
];

const rehandlePageChange = (curr: PageInfo) => {
  console.log('分页变化', curr);
  searchParams.pageNum = curr.current;
  searchParams.pageSize = curr.pageSize;
  reloadUserInvitationList();
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

const userShareLink = computed(() => {
  return `${appDomain.value ? `https://${appDomain.value}` : import.meta.env.VITE_APP_URL}/?invitationCode=${user.userInfo.userCode}`;
});

const reloadUserInvitationList = async () => {
  dataLoading.value = true;
  try {
    const { records, total } = await getUserInvitationList(searchParams);
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

onMounted(() => {
  reloadUserInvitationList();
});
</script>

<style lang="less" scoped>
.invite-count-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1px;
  //width: 450px;
  height: 132px;
  position: relative;
}

.invite-count-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  box-sizing: border-box;

  .tit {
    font: var(--td-font-body-large);
    color: var(--td-text-color-secondary);
  }

  .count {
    color: var(--td-brand-color);
    font: var(--td-font-title-large);
    font-weight: bold;

    &:hover {
      transform: scale(1.1, 1.1);
    }
  }
}

.invite-count-container::before,
.invite-count-container::after {
  content: '';
  position: absolute;
  background-color: var(--td-component-stroke);
}

.invite-count-container::before {
  width: 100%;
  height: 1px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.invite-count-container::after {
  width: 1px;
  height: 100%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.invite-title {
  font: var(--td-font-title-small);
  margin-bottom: var(--td-comp-margin-s);
}

.copy-icon {
  cursor: pointer;

  &:hover {
    color: var(--td-brand-color);
    transform: scale(1.1, 1.1);
  }
}

.coin {
  color: var(--td-brand-color);
  font-weight: bold;

  &:hover {
    transform: scale(1.1, 1.1);
  }
}

.invite-gift-container {
  p {
    line-height: 26px;
  }
}
</style>
