<template>
  <div>
    <!-- page-nav -->
    <page-nav title="授权管理" />
    <t-card class="list-card-container" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-button @click="handleClickEdit()"> 新增授权 </t-button>
        </div>
        <div class="search-input">
          <t-input v-model="searchParams.keyword" placeholder="输入DNS ID或关键词" clearable>
            <template #prefix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-button theme="primary" @click="reloadDnsList">搜索</t-button>
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
              <dns-alias
                :dns-id="row?.id"
                :dns-alias="row?.alias || row?.name"
                :show-icon="false"
                :on-complete="HandleAliasChange"
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
            <t-link theme="primary" @click="handleClickEdit(row)"> 修改 </t-link>
            <t-link theme="danger" @click="handleClickDelete(row)"> 删除 </t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 新增/编辑弹窗 -->
    <t-drawer
      v-model:visible="drawerVisible"
      size="500"
      :header="`${formData!.id ? '编辑' : '新增'}DNS授权`"
      :on-confirm="onClickConfirm"
      :on-close="onClickClose"
      :close-btn="true"
    >
      <t-form ref="formRef" :data="formData" :rules="formRules" label-align="top" :label-width="100">
        <!-- providers -->
        <t-form-item class="comp-radio-group" name="providerId" :label-width="0">
          <t-radio-group v-model:value="formData.providerId" :default-value="formData.providerId">
            <t-radio-button v-for="item in providerlist" :key="item.id" :value="item.id">
              <span class="provider-col-style">
                <t-image lazy :style="{ width: '24px', height: '24px' }" :src="item.logo" :aly="item.name"></t-image>
                {{ item.name }}</span
              >
            </t-radio-button>
          </t-radio-group>
        </t-form-item>
        <template v-if="currentProvider && currentProvider.configJson">
          <t-form-item
            v-for="(item, idx) in currentProvider!.configJson!.fields"
            :key="idx"
            :label="item.name"
            :name="`accessJson.${item.field}`"
            :rules="[{ required: true, message: `${item.name}不能为空`, type: 'error' }]"
          >
            <t-input
              v-model:value="formData!.accessJson[item.field]"
              :type="item.type.toLowerCase()"
              :placeholder="`请输入 ${item.name}`"
              style="width: 80%"
            ></t-input>
          </t-form-item>
          <t-form-item>
            <div>
              <t-link theme="warning" hover="color" :href="currentProvider!.configJson!.helpUrl" target="_blank">
                <template #prefix-icon>
                  <t-icon name="help-circle" size="16"></t-icon>
                </template>
                <span style="margin-left: var(--td-comp-margin-xs)">点击查看相关操作文档</span>
              </t-link>
            </div>
          </t-form-item>
        </template>
      </t-form>
    </t-drawer>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DnsIndex',
};
</script>

<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions, FormRule, PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { addDns, deleteDns, getDnsInfo, getDnsList, getDnsProviderList, updateDnsInfo } from '@/api/dns';
import { prefix } from '@/config/global';
import { defaultPageInfo } from '@/constants';
import { useCopy } from '@/hooks';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

import DnsAlias from './components/dns-alias/index.vue';

const { copyText } = useCopy({
  successDuration: 2e3,
  onSuccess: () => MessagePlugin.success('复制成功'),
  onError: (error: Error) => console.error('Failed to copy text:', error),
});

const store = useSettingStore();

// 表格col
const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  {
    title: 'DNS授权ID/名称',
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
    title: '关联证书',
    width: 100,
    colKey: 'certificatesCount',
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
const reloadDnsList = async () => {
  dataLoading.value = true;
  try {
    const { records, total } = await getDnsList(searchParams);
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

const HandleAliasChange = () => {
  rehandlePageChange(defaultPageInfo);
};

onMounted(() => {
  reloadDnsList();
});

const router = useRouter();

const rowKey = 'id';

const rehandlePageChange = (curr: PageInfo) => {
  console.log('分页变化', curr);
  searchParams.pageNum = curr.current;
  searchParams.pageSize = curr.pageSize;
  reloadDnsList();
};

const handleClickDetail = (item: any) => {
  router.push(`/dns/${item.id}`);
};

// 更新
const drawerVisible = ref(false);
const formRef = ref<FormInstanceFunctions>();

const providers = ref([]);

const providerlist = computed(() => {
  if (formData.value?.id) {
    return providers.value.filter((pro) => pro.id === formData.value.providerId);
  }
  return providers.value;
});

const currentProvider = computed(() => {
  return providers.value.find((pro) => pro.id === formData.value.providerId);
});

const formData = ref<any>({
  id: null,
  providerId: '',
  accessJson: {},
});

const formRules: Record<string, FormRule[]> = {
  providerId: [{ required: true, message: '请选择服务商', type: 'error' }],
  accessJson: [{ required: false, message: '请填写配置数据', type: 'error' }],
};

watch(
  () => [currentProvider.value, formData.value],
  ([value, form]) => {
    // 处理formData!.accessJson
    formData.value!.accessJson = value?.configJson?.fields.reduce((acc: any, cur: any) => {
      acc[cur.field] = form.accessJson[cur.field];
      return acc;
    }, {});
  },
);

const onClickConfirm = () => {
  formRef.value?.validate().then(async (e) => {
    // 表单校验通过
    if (e === true) {
      console.log('ok', formData.value);
      const params = {
        providerId: formData.value!.providerId,
        accessJson: formData.value!.accessJson,
      };
      try {
        if (formData.value?.id) {
          await updateDnsInfo(formData.value.id, params);
        } else {
          await addDns(params);
        }
        drawerVisible.value = false;
        // 刷新页面
        rehandlePageChange(defaultPageInfo);
        MessagePlugin.success('操作成功');
      } catch (err) {
        MessagePlugin.error(`操作失败：${err.message}`);
      }
    }
  });
};

const onClickClose = () => {
  // 清理选择
  formData.value!.providerId = '';
};

const handleClickEdit = (row?: { id: any; rowIndex: any; certificatesCount: number }) => {
  // 1.存在修改
  if (row?.id) {
    // 含有证书管理
    if (row?.certificatesCount) {
      const dialog = DialogPlugin.confirm({
        theme: 'warning',
        header: '确认修改?',
        body: '多个证书已使用该DNS授权，修改DNS授权可能会导致证书更新失败，请确认修改！',
        confirmBtn: {
          theme: 'warning',
        },
        onConfirm: () => {
          onClickEditConfirm(row);
          return dialog.destroy();
        },
        onClose: () => {
          return dialog.destroy();
        },
      });
    } else {
      onClickEditConfirm(row);
    }
  } else {
    onClickEditConfirm(row);
  }
};

/**
 * 确认编辑
 * @param item
 */
const onClickEditConfirm = async (row: any) => {
  console.log('更新');
  try {
    // 1.加载providers
    const { records } = await getDnsProviderList({});
    providers.value = records;
    // 2.加载详情
    if (row && row.id) {
      formData.value = await getDnsInfo(row.id);
    } else {
      formData.value = {
        id: null,
        providerId: '',
        accessJson: {},
      };
      // 默认第一项
      formData.value!.providerId = records[0].id;
    }
    drawerVisible.value = true;
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};

// 删除按钮点击
const handleClickDelete = (row: any) => {
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
        await deleteDns(row.id);
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

.comp-radio-group {
  :deep(.t-radio-button) {
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-xl);
    border: 1px solid var(--td-border-level-2-color);
    height: auto !important;
  }

  :deep(.t-radio-button + .t-radio-button) {
    margin-left: 0;
    border: 1px solid var(--td-border-level-2-color);
  }

  :deep(.t-radio-button.t-is-checked) {
    position: relative;
    border: 1px solid var(--td-brand-color);

    &::after {
      content: '';
      position: absolute;
      bottom: calc(0px - var(--td-comp-margin-l) / 2);
      right: calc(0px - var(--td-comp-margin-l) / 2);
      border-radius: var(--td-comp-margin-l);
      width: var(--td-comp-margin-l);
      height: var(--td-comp-margin-l);
      background: var(--td-brand-color);
    }
  }
}
</style>
