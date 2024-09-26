<template>
  <div class="cloud-guide">
    <!-- page-nav -->
    <page-nav :show-back="true" title="添加云资源" />
    <t-card>
      <div class="top-tabs">
        <t-row justify="center">
          <t-col :span="6">
            <t-steps :current="currentStep">
              <t-step-item title="资源服务商" />
              <t-step-item title="绑定证书" />
              <t-step-item title="部署证书" />
            </t-steps>
          </t-col>
        </t-row>
      </div>
      <div class="guide-content">
        <!-- 内容体 -->
        <t-row justify="center">
          <t-col :span="6">
            <div v-if="currentStep == 0" class="setup-brand">
              <h3>请选择资源服务商</h3>
              <t-divider />
              <t-row>
                <div class="provider-list comp-radio-group">
                  <t-radio-group v-model="formData.providerId">
                    <t-radio-button v-for="item in providerList" :key="item.id" :value="item.id">
                      <div class="provider-item flex items-center">
                        <t-image
                          lazy
                          :style="{ width: '24px', height: '24px' }"
                          :src="item.logo"
                          :aly="item.name"
                        ></t-image>
                        <div class="ml-[5px]">{{ item.alias || item.name }}</div>
                      </div>
                    </t-radio-button>
                  </t-radio-group>
                </div>
              </t-row>
              <t-row class="mt-[15px]">
                <div class="provider-product-list">
                  <t-radio-group v-model="formData.providerProductId">
                    <t-radio-button v-for="item in providerProductList" :key="item.id" :value="item.id">
                      <div class="brand-item flex items-center">
                        <div>{{ item.alias || item.name }}</div>
                      </div>
                    </t-radio-button>
                  </t-radio-group>
                </div>
              </t-row>

              <template v-if="currentProvider && currentProduct && currentProduct.configJson">
                <div class="flex flex-col">
                  <t-row v-for="(item, idx) in currentProduct!.configJson!.fields" :key="idx" class="mt-[16px]">
                    <t-col :span="3">{{ item.name }}: </t-col>
                    <t-col :span="9">
                      <div class="flex items-center gap-[10px]">
                        <t-select
                          v-if="item.type === 'select'"
                          v-model:value="formData!.accessJson[item.field]"
                          :placeholder="`请选择 ${item.name}`"
                        >
                          <t-option v-for="(op, odx) in item.options" :key="odx" :value="op.value">{{
                            op.label
                          }}</t-option>
                        </t-select>
                        <t-input
                          v-else
                          v-model:value="formData!.accessJson[item.field]"
                          :type="item.type === 'random' ? 'text' : item.type.toLowerCase()"
                          :placeholder="item.placeholder || `请输入 ${item.name}`"
                        >
                          <template #suffix>
                            <t-button v-if="item.type === 'random'" @click="handleRandomStrToField(item.field)"
                              >点击生成</t-button
                            >
                          </template>
                        </t-input>
                        <t-icon v-if="authCheck" color="green" size="18" name="check-circle" />
                      </div>
                    </t-col>
                  </t-row>
                  <div v-if="currentProduct!.configJson!.tips" class="mt-[15px]">
                    <t-alert v-for="(tip, tid) in currentProduct!.configJson!.tips" :key="tid">
                      <span style="margin-left: var(--td-comp-margin-xs)">{{ tip }}</span>
                    </t-alert>
                  </div>
                  <div class="mt-[10px]">
                    <t-link theme="warning" hover="color" :href="currentProduct!.configJson!.helpUrl" target="_blank">
                      <template #prefix-icon>
                        <t-icon name="help-circle" size="16"></t-icon>
                      </template>
                      <span style="margin-left: var(--td-comp-margin-xs)">点击查看相关操作文档</span>
                    </t-link>
                  </div>
                </div>
              </template>
            </div>
            <div v-if="currentStep == 1" class="setup-domains">
              <h3>选择你要部署证书，关联绑定</h3>
              <t-divider />
              <t-row>
                <t-space :break-line="true">
                  <t-tag
                    v-for="item in certificateDialog.certificates"
                    :key="item.id"
                    theme="primary"
                    variant="outline"
                    size="large"
                    closable
                    @close="handleCertificateClose(item)"
                  >
                    <div>
                      {{ item.alias || item.name }} -
                      <certificate-domains :inline-style="true" :domains="item.domains" :only-first="true" /></div
                  ></t-tag>
                  <t-tag theme="default" variant="outline" size="large" @click="handleSelectCertificate">
                    <template #icon>
                      <t-icon name="add-circle"></t-icon>
                    </template>
                    <span class="cursor-pointer">添加证书</span>
                  </t-tag>
                </t-space>
              </t-row>
              <!-- 选择弹窗 -->
              <t-dialog
                :visible="certificateDialog.visible"
                :width="800"
                :close-on-overlay-click="false"
                :close-btn="true"
                dialog-class-name="certificate-list"
                attach="body"
                header="选择证书"
                cancel-btn="取消"
                :on-confirm="handleSelectedCertificate"
                :on-close="handleCloseCertificate"
              >
                <template #body>
                  <t-table
                    row-key="id"
                    height="30%"
                    hover
                    :columns="certificateDialog.columns"
                    :data="certificateDialog.dataList"
                    :selected-row-keys="certificateDialog.selectedIds"
                    select-on-row-click
                    :pagination="certificateDialog.pagination"
                    :loading="certificateDialog.dataLoading"
                    @page-change="rehandlePageChange"
                    @select-change="(value: number[]) => rehandleSelectChange(value)"
                  >
                    <template #name="{ row }">
                      <div class="name-col-style">
                        <div class="name-col-text">
                          <t-link theme="primary">{{ row.alias || row.name }}</t-link>
                        </div>
                      </div>
                    </template>
                    <template #domains="{ row }">
                      <certificate-domains :domains="row.domains" :only-first="true" />
                    </template>
                    <template #type="{ row }"> <certificate-type :type="row.type" /> </template>
                    <template #status="{ row }"> <certificate-status :status="row.status" /> </template>
                  </t-table>
                </template>
              </t-dialog>
            </div>
            <div v-if="currentStep == 2" class="setup-apply">
              <t-row class="mt-[15px]" justify="space-between">
                <div class="text-sm">
                  <h3>关联证书列表</h3>
                </div>
                <div class="left-operation-container">
                  <t-button variant="outline" @click="handleDeployCloudCertificate"> 立即部署云资源证书 </t-button>
                </div>
              </t-row>
              <t-divider />
              <t-table
                row-key="id"
                :height="300"
                cell-empty-content="--"
                :data="certificateDeploy"
                :columns="certificateListColumns"
                :pagination="certificateListPagination"
                @page-change="onCertificatePageChange"
              >
                <template #certificate="{ row }">
                  <div class="name-col-style">
                    <div class="name-col-text">
                      <t-link theme="primary" :on-click="() => router.push(`/certificate/${row.id}`)">{{
                        row.alias || row.name
                      }}</t-link>
                    </div>
                  </div>
                </template>
                <template #type="{ row }">
                  <certificate-type :type="row.type" />
                </template>
                <template #domains="{ row }">
                  <certificate-domains :domains="row.domains" :only-first="true" />
                </template>
                <template #status="{ row }">
                  <div class="deploy-status">
                    <span v-if="row.status === 1" class="deploying">
                      <t-icon class="ml-[5px]" name="loading"></t-icon>
                      部署中
                    </span>
                    <span v-else-if="row.status === 2" class="success">
                      <t-icon name="check-circle" />
                      已部署
                    </span>
                    <span v-else-if="row.status === 0" class="danger"> <t-icon name="error-circle" />错误 </span>
                    <span v-else>--</span>
                  </div>
                </template>
              </t-table>
              <t-button @click="() => $router.push('/overview')">返回主页</t-button>
            </div>
          </t-col>
        </t-row>
      </div>
      <!-- 操作栏 -->
      <t-row v-if="currentStep < 2" justify="center" class="guide-operate">
        <t-col :span="6">
          <t-button v-if="currentStep > 0" theme="default" @click="handleNext(-1)">上一步</t-button>
          <t-button :loading="submitLoading" class="next-button" @click="handleNext()">下一步</t-button>
        </t-col>
      </t-row>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import type { PageInfo } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { Ref } from 'vue';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { getCertificateList } from '@/api/certificate';
import { addCloud, checkCloud, deployCloud, deployCloudList, getProviderList } from '@/api/cloud';
import { checkObjectEmptyAndKeys, randomString } from '@/utils/common';

import CertificateDomains from '../certificate/components/certificate-domains/index.vue';
import CertificateStatus from '../certificate/components/certificate-status/index.vue';
import CertificateType from '../certificate/components/certificate-type/index.vue';

const router = useRouter();
const currentStep = ref(0); // 0 1 2

const formData = ref<any>({
  providerId: 1,
  providerProductId: 1,
  accessJson: {
    Ali_Key: '',
    Ali_Secret: '',
  },
  certificateIds: [],
});

const authCheck = ref(false);
const submitLoading = ref(false);

watch(
  () => authCheck.value,
  (value) => {
    console.log('authCheck.value', value);
  },
);

watch(
  () => formData.value?.authMode,
  () => {
    authCheck.value = false;
  },
);

const handleNext = async (step: number = 1) => {
  if (step < 0) {
    currentStep.value += step;
    // 清理校验
    if (currentStep.value === 1) {
      authCheck.value = false;
      formData.value!.dnsServerId = '';
    }
    return true;
  }
  console.log('authCheck.value', authCheck.value, currentStep.value);

  // 前置校验
  submitLoading.value = true;
  if (currentStep.value <= 0) {
    const { error, emptyKeys } = checkObjectEmptyAndKeys(formData.value?.accessJson);
    if (error) {
      MessagePlugin.error(
        emptyKeys?.length ? `配置项【${emptyKeys[0]}】为空，请补充完整` : '还未选择授权服务商或请填写配置数据',
      );
      submitLoading.value = false;
      return false;
    }
    // 校验服务商配置
    await checkCloudInfo();
  }
  if (!authCheck.value) {
    submitLoading.value = false;
    return false;
  }
  if (currentStep.value >= 1) {
    if (certificateDialog.value!.selectedIds.length <= 0) {
      MessagePlugin.error('请先选择要部署的证书');
      submitLoading.value = false;
      return false;
    }
    await submitCloudCertificate();
  }
  // 下一步
  currentStep.value += step;
  return true;
};

// 检查可用
const checkCloudInfo = async () => {
  try {
    const params = {
      providerId: formData.value!.providerId,
      providerProductId: formData.value!.providerProductId,
      accessJson: formData.value!.accessJson,
    };
    console.log('params', params);
    submitLoading.value = true;
    const { error: apiError, result } = await checkCloud(params);
    authCheck.value = result;
    if (!result) {
      MessagePlugin.error(apiError);
      console.log('err', apiError);
    } else {
      // MessagePlugin.success('验证成功');
    }
    submitLoading.value = false;
  } catch (err) {
    MessagePlugin.error(`验证失败：${err.message}`);
    authCheck.value = false;
    submitLoading.value = false;
  }
};

// 资源信息
const cloudInfo = ref({
  id: 0,
  providerId: '',
  providerName: '',
  providerLogo: '',
  providerProductId: '',
  providerProductName: '',
  providerProductAliasName: '',
  certificates: [],
  error: '',
});

// 设置随机串
const handleRandomStrToField = (field: string) => {
  formData.value!.accessJson[field] = randomString(32);
  console.log(formData.value, randomString(32));
};

const certificateDeploy = computed(() => {
  return cloudInfo.value?.certificates.map((item) => {
    return {
      ...item,
      status: item.status >= 0 ? item.status : '--',
      error: item.error || '--',
    };
  });
});

const certificateListColumns = [
  {
    title: '证书ID/名称',
    align: 'left',
    colKey: 'certificate',
  },
  {
    title: '类型',
    width: 150,
    align: 'center',
    colKey: 'type',
  },
  {
    title: '部署域名',
    align: 'left',
    colKey: 'domains',
  },
  {
    title: '部署状态',
    width: 150,
    align: 'center',
    colKey: 'status',
  },
  {
    title: '错误信息',
    align: 'left',
    colKey: 'error',
  },
];

const certificateListPagination = ref({
  current: 1,
  pageSize: 5,
  total: 0,
});

const onCertificatePageChange = (pageInfo: PageInfo) => {
  // 受控用法需要下面两行代码
  certificateListPagination.value!.current = pageInfo.current;
  certificateListPagination.value!.pageSize = pageInfo.pageSize;
};

// 提交资源关联
const submitCloudCertificate = async () => {
  try {
    const params = {
      providerId: formData.value!.providerId,
      providerProductId: formData.value!.providerProductId,
      accessJson: formData.value!.accessJson,
      certificateIds: certificateDialog.value!.selectedIds,
    };
    console.log('params', params);
    submitLoading.value = true;
    cloudInfo.value = await addCloud(params);
    // 分页
    certificateListPagination.value!.total = cloudInfo.value?.certificates?.length;
    MessagePlugin.success('提交成功');
    submitLoading.value = false;
  } catch (err) {
    MessagePlugin.error(`操作失败：${err.message}`);
    submitLoading.value = false;
  }
};

// 部署证书
const handleDeployCloudCertificate = async () => {
  try {
    MessagePlugin.warning('部署已经提交，请耐心等待系统执行');
    await deployCloud(cloudInfo.value?.id);
    // 启动定时器
    intervalDeployCloudList();
  } catch (err) {
    MessagePlugin.error(`操作失败：${err.message}`);
  }
};

// 部署列表
const delpoyList = ref([]);
const intervalDelpoyTimer = ref();
const intervalTimer = ref(1);

const intervalDeployCloudList = () => {
  // 执行方法
  const retryFun = async () => {
    const { records } = await deployCloudList(cloudInfo.value?.id, { pageNum: 1, pageSize: 999 });
    delpoyList.value = records;
    // 处理现在的数据
    records.forEach((dat: any) => {
      const cert = cloudInfo.value?.certificates.find((cert) => cert.id === dat.certificateId);
      if (cert) {
        cert.status = dat.status;
        cert.error = dat.error;
      }
    });

    // 当里面的状态都为 2 已部署 的时候停止 或者超时 180 s
    if (delpoyList.value?.every((deploy) => [0, 2].includes(deploy.status)) || intervalTimer.value >= 60) {
      clearInterval(intervalDelpoyTimer.value);
    }
  };
  // 定时
  intervalDelpoyTimer.value = setInterval(async () => {
    await retryFun();
    intervalTimer.value += 1;
  }, 3e3);
  retryFun();
};

// 证书选择
const certificateDialog = ref({
  visible: false,
  certificates: [],
  selectedIds: [],
  dataLoading: true,
  pagination: {
    size: 'small',
    defaultPageSize: 10,
    total: 0,
    defaultCurrent: 1,
  },
  dataList: [],
  columns: [
    {
      colKey: 'row-select',
      type: 'multiple',
      width: 64,
      checkProps: ({ row }: { row: any }) => ({
        disabled: row.latestVersionStatus !== 2,
      }),
    },
    {
      title: '证书ID/名称',
      width: 220,
      align: 'left',
      colKey: 'name',
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
      title: '状态',
      width: 80,
      colKey: 'status',
    },
  ],
});

const handleSelectCertificate = async () => {
  // 加载证书列表
  await reloadCertificateList();
  certificateDialog.value!.visible = true;
};

const reloadCertificateList = async () => {
  certificateDialog.value!.dataLoading = true;
  try {
    const { records, total } = await getCertificateList(searchParams);
    certificateDialog.value!.dataList = records;
    certificateDialog.value!.pagination = {
      ...certificateDialog.value!.pagination,
      total,
    };
  } catch (e) {
    console.log(e);
  } finally {
    certificateDialog.value!.dataLoading = false;
  }
};

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
  reloadCertificateList();
};

const rehandleSelectChange = (val: number[]) => {
  certificateDialog.value!.selectedIds = val;
};

// 选中证书
const handleSelectedCertificate = async () => {
  certificateDialog.value!.certificates = certificateDialog.value!.dataList.filter((cert) =>
    certificateDialog.value!.selectedIds.includes(cert.id),
  );
  certificateDialog.value!.visible = false;
};

// 关闭
const handleCloseCertificate = async () => {
  certificateDialog.value!.visible = false;
  certificateDialog.value!.selectedIds = certificateDialog.value!.certificates?.map((cert) => cert.id) || [];
};

// 取消选择
const handleCertificateClose = (item: any) => {
  // 移除选中
  certificateDialog.value!.selectedIds = certificateDialog.value?.selectedIds.filter(
    (select: any) => select !== item.id,
  );
  handleSelectedCertificate();
};

// 初始化数据
const providerList = ref<Record<string, any>[]>([]);
const currentProvider = computed(() => {
  return providerList.value.find((pro) => pro.id === formData.value.providerId);
});

const providerProductList: Ref<any[]> = computed(() => {
  return currentProvider.value?.providers || [];
});
const currentProduct = computed(() => {
  return providerProductList.value.find((prod) => prod.id === formData.value.providerProductId);
});

// provider改变，需要更新 providerProductId
watch(
  () => currentProvider.value,
  (value) => {
    // 更替providerProductId
    formData.value!.providerProductId = value?.providers[0].id;
    // 处理formData!.accessJson
    formData.value!.accessJson = currentProduct.value?.configJson?.fields.reduce((acc: any, cur: any) => {
      acc[cur.field] = formData.value!.accessJson ? formData.value!.accessJson[cur.field] : '';
      return acc;
    }, {});
  },
);

// product改变，需要更新 accessJson
watch(
  () => currentProduct.value,
  (value) => {
    // 处理formData!.accessJson
    formData.value!.accessJson = value?.configJson?.fields.reduce((acc: any, cur: any) => {
      acc[cur.field] = formData.value!.accessJson ? formData.value!.accessJson[cur.field] : '';
      return acc;
    }, {});
  },
);

const reloadProviderData = async () => {
  const { records, total } = await getProviderList();
  providerList.value = records;
  // 默认选择
  if (total) {
    formData.value!.providerId = providerList.value[0].id;
    formData.value!.providerProductId = currentProvider.value?.providers[0].id;
  }
  console.log('formData.value', formData.value, providerList.value[0].id);
};

onMounted(async () => {
  reloadProviderData();
});

onUnmounted(() => {
  if (intervalDelpoyTimer.value) {
    clearInterval(intervalDelpoyTimer.value);
  }
});
</script>
<style lang="less" scoped>
.cloud-guide {
  :deep(.t-card) {
    margin-bottom: var(--td-comp-paddingTB-l);
  }

  :deep(.t-divider) {
    margin: var(--td-comp-margin-l) 0;
  }

  :deep(.t-alert) {
    padding: var(--td-pop-padding-xl) var(--td-pop-padding-xl);
    margin-bottom: var(--td-pop-padding-xl);
  }

  :deep(.t-table) {
    margin-bottom: var(--td-pop-padding-xl);
  }

  :deep(.t-input__suffix:not(:empty)) {
    margin-left: var(--td-comp-margin-s);
    margin-right: calc(0px - var(--td-comp-margin-s));
  }

  .top-tabs {
    margin: var(--td-comp-paddingTB-l) var(--td-comp-paddingTB-s);
  }

  .guide-content {
    min-height: 30vh;
  }

  .provider-list {
    :deep(.t-radio-button) {
      padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-l);
      border: 1px solid var(--td-border-level-2-color);
      height: auto !important;
    }

    :deep(.t-radio-button.t-is-checked) {
      position: relative;
      border: 1px solid var(--td-brand-color);

      &::after {
        content: '';
        position: absolute;
        bottom: calc(0px - var(--td-comp-margin-s) / 2);
        right: calc(0px - var(--td-comp-margin-s) / 2);
        border-radius: var(--td-comp-margin-s);
        width: var(--td-comp-margin-s);
        height: var(--td-comp-margin-s);
        background: var(--td-brand-color);
      }
    }
  }

  .provider-product-list {
    :deep(.t-radio-button) {
      padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-l);
    }
  }

  .guide-operate {
    margin-top: var(--td-comp-paddingTB-xxl);

    .next-button {
      width: 150px;
    }
  }
}

.logger-container {
  width: 100%; /* 占满父容器的宽度 */
  height: 600px; /* 固定高度，便于滚动 */
  border: 1px solid #ccc; /* 添加边框，便于区分 */
  padding: 10px; /* 内边距，提供一些空间 */
  box-sizing: border-box; /* 包含边框和内边距 */
  overflow-y: auto; /* 内容超出时启用垂直滚动条 */
  background-color: #f9f9f9; /* 背景颜色 */
  font-family: monospace; /* 使用等宽字体，适合显示日志 */
  white-space: pre-wrap; /* 保留空白符和换行 */
}

.cert-label {
  position: relative;
  margin-bottom: var(--td-comp-margin-l);
}

.setup-apply {
  max-width: 60vw;
  margin: 0 auto;
}

.result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 30vh;

  &.loading {
    height: 25vh;
  }

  &-icon {
    font-size: var(--td-comp-size-xxl);
    color: var(--td-brand-color);

    &.error {
      font-size: var(--td-comp-size-xxxxl);
      color: var(--td-error-color);
    }
  }

  &-title {
    margin-top: var(--td-comp-margin-xxl);
    font: var(--td-font-title-large);
    color: var(--td-text-color-primary);
    text-align: center;
  }

  &-describe {
    margin: var(--td-comp-margin-s) 0 var(--td-comp-margin-xxxl);
    font: var(--td-font-body-medium);
    color: var(--td-text-color-secondary);
  }
}

.certificate-list {
  .t-dialog__footer {
    padding: var(--td-comp-paddingTB-s) 0 0;
  }
}
</style>
