<template>
  <div>
    <!-- page-nav -->
    <page-nav title="费用明细" />
    <t-card class="list-card-container" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container" style="gap: 10px">
          <div class="search-date">
            <t-date-range-picker
              clearable
              :disable-date="{
                before: dayjs().subtract(60, 'day').format(),
                after: dayjs().format(),
              }"
              @change="onDateChange"
            />
          </div>
          <div class="search-input !w-[250px]">
            <t-select v-model="searchParams.type" label="类型：" placeholder="请选择类型" clearable>
              <t-option
                v-for="item in [
                  { label: '消耗', value: '0' },
                  { label: '增加', value: '1' },
                ]"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              ></t-option>
            </t-select>
            <t-button theme="primary" @click="reloadUserInvitationList">搜索</t-button>
          </div>
          <t-button class="min-w-[150px]" variant="outline">
            <template #icon><t-icon name="money" size="16"></t-icon></template>
            <span
              >金币余额：<span class="coin">{{ userCoins || '0.00' }} </span></span
            ></t-button
          >

          <t-button variant="outline" @click="handleRulesVisible">
            <template #icon>
              <t-icon name="calculator-1" size="14" theme="default"></t-icon>
            </template>
            <span>金币消耗规则</span>
          </t-button>
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
        <template #type="{ row }">
          <span class="">{{ row.type == 1 ? '增加' : '消耗' }}</span>
        </template>
        <template #coin="{ row }">
          <span class="coin" :class="[row.type == 1 ? 'inc' : 'dec']">{{ (row.type == 1 ? '+' : '') + row.coin }}</span>
        </template>
      </t-table>
    </t-card>
    <coin-rules v-model="coinRulesVisible" />
  </div>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs';
import type { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { getUserTransactionList, meCoins } from '@/api/user';
import CoinRules from '@/components/coin-rules/index.vue';

const coinRulesVisible = ref(false);

const handleRulesVisible = () => {
  coinRulesVisible.value = true;
};

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
    title: '类型',
    width: 100,
    colKey: 'type',
  },
  {
    title: '操作',
    width: 150,
    colKey: 'coin',
  },
  {
    title: '余额',
    width: 150,
    colKey: 'coinAfter',
  },
  {
    title: '说明',
    colKey: 'remark',
  },
];

const dateTimeSlot = ref([]);
const onDateChange = (e: any) => {
  dateTimeSlot.value = e;
};

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
  type: '',
  pageNum: 1,
  pageSize: 10,
  sortBy: 'createTime',
  sortOrder: 'DESC',
});

const reloadUserInvitationList = async () => {
  dataLoading.value = true;
  try {
    // 日期拼接
    const [startDate, endDate] = dateTimeSlot.value;
    const { records, total } = await getUserTransactionList({
      ...searchParams,
      startDate,
      endDate,
    });
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

const userCoins = ref(0);

const reloadUserCoins = async () => {
  try {
    const { coins } = await meCoins();
    userCoins.value = coins;
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};

onMounted(() => {
  reloadUserInvitationList();
  reloadUserCoins();
});
</script>

<style lang="less" scoped>
.coin {
  color: var(--td-brand-color);
  font-weight: 600;

  &.dec {
    color: var(--td-success-color-5);
  }
}
</style>
