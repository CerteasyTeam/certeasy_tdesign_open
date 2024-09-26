<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-table
        hover
        size="large"
        :data="dataList"
        :columns="COLUMNS"
        :row-key="rowKey"
        cell-empty-content="--"
        :selected-row-keys="selectedRowKeys"
        :loading="dataLoading"
        @select-change="(value: number[]) => rehandleSelectChange(value)"
      >
        <template #status="{ row }">
          <t-switch size="medium" :value="!!row!.status" @change="handleChangeSwitch($event, row)" />
        </template>
        <template #associatedChannels="{ row }">
          <template v-for="(item, idx) in row.associatedChannels" :key="item.id">
            <t-link class="custom-tag" :class="[idx > 0 ? 'ml-[10px]' : '']" theme="primary" variant="outline">
              <template #prefix-icon>
                <t-image
                  v-if="item.providerLogo"
                  lazy
                  :style="{ width: '24px', height: '24px' }"
                  :src="item.providerLogo"
                  :alt="item.providerName"
                ></t-image
              ></template>
              {{ item.name }}</t-link
            >
          </template>
          <span v-if="row?.associatedChannels.length <= 0" style="color: var(--td-text-color-placeholder)"
            >未配置通知渠道，默认使用注册邮箱</span
          >
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link theme="primary" @click="handleClickConfig(row)"> 渠道配置 </t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>
    <!-- 操作弹出 -->
    <t-dialog
      :visible="channelDialog.visible"
      :width="800"
      :close-on-overlay-click="false"
      :close-btn="true"
      dialog-class-name="notification-channel-list"
      attach="body"
      :header="`配置通知渠道`"
      cancel-btn="取消"
      :on-confirm="handleSelectedChannel"
      :on-close="handleCloseChannel"
    >
      <template #body>
        <t-divider>渠道配置</t-divider>
        <div class="channel-config">
          <t-transfer
            v-model="channelDialog!.associatedChannelIds"
            :title="['渠道列表', '配置列表']"
            :operation="['取消', '配置']"
            :data="channelDialog.channelList"
            :search="true"
            :keys="{ label: 'name', value: 'id' }"
          >
            <template #transferItem="{ data }">
              <div class="flex items-center ml-[8px]">
                <t-image
                  v-if="data.providerLogo"
                  lazy
                  :style="{ width: '24px', height: '24px' }"
                  :src="data.providerLogo"
                  :alt="data.providerName"
                ></t-image>
                <span class="ml-[5px]">{{ data.providerName }} - {{ data.name }}</span>
              </div>
            </template>
          </t-transfer>
        </div>
      </template>
    </t-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ListConfig',
};
</script>

<script setup lang="ts">
import type { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';

import { getNotificationChannelList, getNotificationConfig, updateNotificationConfig } from '@/api/notification';
import { t } from '@/locales';

// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  // { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '通知名称',
    width: 200,
    align: 'left',
    colKey: 'name',
    fixed: 'left',
  },
  {
    title: '启用',
    width: 100,
    colKey: 'status',
  },
  {
    title: '通知渠道',
    colKey: 'associatedChannels',
  },
  {
    title: t('pages.listBase.operation'),
    width: 150,
    align: 'right',
    fixed: 'right',
    colKey: 'op',
  },
];

const rowKey = 'id';
const dataList = ref();
const dataLoading = ref(false);
const selectedRowKeys = ref([]);

const rehandleSelectChange = (val: number[]) => {
  selectedRowKeys.value = val;
};

// 证书选择
const channelDialog = ref({
  visible: false,
  // 当前配置
  config: {
    id: 0,
  },
  // 渠道列表
  channelList: [],
  // 选择
  associatedChannelIds: [],
});

/** 加载渠道列表 */
const reloadNotificationChannelList = async () => {
  try {
    const { records, total } = await getNotificationChannelList();
    channelDialog.value!.channelList = records;
  } catch (e) {
    console.log(e);
  }
};

// 渠道配置
const handleClickConfig = async (item: any) => {
  // 加载渠道列表
  await reloadNotificationChannelList();
  channelDialog.value!.config = { ...item };
  channelDialog.value!.visible = true;
  // 设置i选择
  channelDialog.value!.associatedChannelIds = item?.associatedChannels.map((channel: any) => channel.id);
};

// 确认选择
const handleSelectedChannel = async () => {
  // 设置渠道
  console.log();

  try {
    await updateNotificationConfig(channelDialog.value.config?.id, {
      associatedChannelIds: channelDialog.value?.associatedChannelIds,
    });

    MessagePlugin.success('配置已更新');
    channelDialog.value!.visible = false;
    reloadNotificationConfig();
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};

const handleCloseChannel = () => {
  channelDialog.value!.visible = false;
};

// 更新状态
const handleChangeSwitch = async (e: any, item: any) => {
  console.log('handleChangeSwitch', e, item);
  try {
    const status = e ? 1 : 0;
    item.status = status;
    await updateNotificationConfig(item?.id, {
      notificationEnabled: status,
    });
    channelDialog.value!.visible = false;
    // reloadNotificationConfig();
  } catch (err) {
    console.log(`err:${err.message}`);
    MessagePlugin.error(err.message);
  }
};

/**
 * 加载配置信息
 */
const reloadNotificationConfig = async () => {
  dataLoading.value = true;
  try {
    dataList.value = await getNotificationConfig();
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

onMounted(() => {
  reloadNotificationConfig();
});
</script>

<style lang="less" scoped>
.list-card-container {
  :deep(.t-card__footer) {
    padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingLR-l) var(--td-comp-paddingTB-l);
  }
}

.channel-config {
  &-title {
    margin-bottom: var(--td-comp-margin-s);
  }

  :deep(.t-row) {
    margin-bottom: var(--td-comp-margin-s);
  }

  :deep(.t-transfer) {
    .t-transfer__list {
      height: 420px;
      width: 320px;
    }

    .t-transfer__list-header {
      width: 100%;
    }
  }

  .config-flex {
    display: flex;
    align-items: center;

    .text {
      margin: 0 var(--td-comp-margin-s);
    }
  }
}

.custom-tag {
  height: var(--td-comp-size-s);
}
</style>
