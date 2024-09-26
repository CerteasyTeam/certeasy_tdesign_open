<template>
  <div>
    <!-- page-nav -->
    <page-nav :show-back="true" :title="`${certificateInfo?.alias || certificateInfo?.name} 证书详情`" />
    <div class="certificate-detail">
      <t-card class="certificate-card" :bordered="false">
        <h2 class="certificate-detail-title">
          <t-icon name="certificate" size="24"></t-icon>
          <copy-label class="ml-[5px]" :value="certificateInfo?.name" />
        </h2>
        <t-row class="certificate-detail-row">
          <t-col :span="1">证书名称</t-col>
          <t-col :span="3">
            <certificate-alias
              :certificate-id="certificateInfo?.id"
              :certificate-alias="certificateInfo?.alias || certificateInfo?.name"
              :show-icon="true"
              :on-complete="reloadCertificateInfo"
            />
          </t-col>
          <t-col :span="1">创建时间：</t-col>
          <t-col :span="3">{{ certificateInfo?.createTime || '--' }}</t-col>
        </t-row>
        <t-row class="certificate-detail-row">
          <t-col :span="1">证书类型：</t-col>
          <t-col :span="3">
            <certificate-type :type="certificateInfo?.type" />
          </t-col>
          <t-col :span="1">证书品牌：</t-col>
          <t-col :span="3"> <certificate-agency :agency="certificateInfo?.certAgency" /></t-col>
        </t-row>
        <t-row class="certificate-detail-row">
          <t-col :span="1">证书域名：</t-col>
          <t-col :span="10">
            <certificate-domins :domains="certificateInfo?.domains" />
          </t-col>
        </t-row>
        <t-row class="certificate-detail-row">
          <t-col :span="1">验证模式：</t-col>
          <t-col :span="3">
            <!--  1 HTTP验证 2 HTTP代理验证 3 DNS授权验证 4 DNS代理验证   -->
            <!-- 1,2,4 有弹窗  -->
            <t-link theme="primary" hover="color" @click="showAuthModeDrawer(certificateInfo.authMode)">
              {{ CertificateAuthModeMapList[certificateInfo?.authMode].label }}
              <template v-if="CERTIFICATE_AUTH_MODE.DNS_AUTH_MODE == certificateInfo?.authMode">
                - {{ certificateInfo?.dnsServer?.name }}
              </template>
              <span v-else>- 点击查看验证配置</span>
            </t-link>
          </t-col>
        </t-row>
        <t-row class="certificate-detail-row">
          <t-col :span="1">自动通知：</t-col>
          <t-col :span="3">
            <t-link :theme="certificateInfo?.autoNotify ? 'success' : 'danger'" hover="color">
              <template #suffix-icon>
                <t-icon
                  name="setting"
                  size="15"
                  style="color: var(--td-brand-color)"
                  @click="handleEditConfig"
                ></t-icon>
              </template>
              <span style="margin-right: var(--td-comp-margin-xl)">{{
                certificateInfo?.autoNotify ? '已启用' : '未启用'
              }}</span>
            </t-link>
          </t-col>
        </t-row>
        <t-row class="certificate-detail-row">
          <t-col :span="1">自动更新：</t-col>
          <t-col :span="3">
            <t-link :theme="certificateInfo?.autoUpdate ? 'success' : 'danger'" hover="color">
              <template #suffix-icon>
                <t-icon
                  name="setting"
                  size="15"
                  style="color: var(--td-brand-color)"
                  @click="handleEditConfig"
                ></t-icon>
              </template>
              <span style="margin-right: var(--td-comp-margin-xl)">{{
                certificateInfo?.autoUpdate ? '已启用' : '未启用'
              }}</span>
            </t-link>
          </t-col>
        </t-row>
        <t-row class="certificate-detail-row">
          <t-col :span="1">自动部署：</t-col>
          <t-col :span="3">
            <t-link :theme="certificateInfo?.autoPush ? 'success' : 'danger'" hover="color">
              <template #suffix-icon>
                <t-icon
                  name="setting"
                  size="15"
                  style="color: var(--td-brand-color)"
                  @click="handleEditConfig"
                ></t-icon>
              </template>
              <span style="margin-right: var(--td-comp-margin-xl)">{{
                certificateInfo?.autoPush ? '已启用' : '未启用'
              }}</span>
            </t-link>
          </t-col>
        </t-row>
        <!-- 部署节点信息 -->
        <t-row v-if="certificateInfo?.autoPush" class="certificate-detail-row">
          <t-col :span="1">部署资源：</t-col>
          <t-col :span="10">
            <div class="flex items-center cursor-pointer" style="">
              <template v-if="certificateInfo?.associatedClouds?.length">
                <t-space break-line>
                  <t-link
                    v-for="cert in certificateInfo?.associatedClouds"
                    :key="cert.id"
                    theme="primary"
                    @click="() => router.push(`/cloud/${cert.cloudId}`)"
                  >
                    <template #prefix-icon>
                      <t-image
                        :style="{ width: '24px', height: '24px' }"
                        :src="cert.providerLogo"
                        :alt="cert.providerName"
                      ></t-image>
                    </template>
                    <span class="ml-[5px]"
                      >{{ cert.providerName }} - {{ cert.providerProductName }} - {{ cert.name }}</span
                    >
                  </t-link>
                </t-space>
              </template>
              <span v-else class="cloud-config" @click="handleEditConfig">点击配置资源</span>
              <t-icon
                name="setting"
                class="ml-[10px]"
                size="15"
                style="color: var(--td-brand-color)"
                @click="handleEditConfig"
              ></t-icon>
            </div>
          </t-col>
        </t-row>
      </t-card>
      <t-card>
        <div class="relative">
          <t-tabs v-model="tabsValue" default-value="tabsValue">
            <t-tab-panel value="version" label="更新记录">
              <certificate-list ref="certificateListRef" :certificate="certificateInfo" @view="handleVersionInfo" />
            </t-tab-panel>
            <t-tab-panel value="cloud" label="部署记录">
              <certificate-cloud :certificate="certificateInfo" />
            </t-tab-panel>
          </t-tabs>
          <div class="absolute top-[-5px] right-[-5px] z-10">
            <t-button @click="renewCertificateVersion">更新证书</t-button>
            <t-button @click="handleClickDeploy">部署证书</t-button>
          </div>
        </div>
      </t-card>
      <!-- 验证配置信息 -->
      <t-drawer
        v-model:visible="authModeSettingDrawer.visible"
        size="600"
        header="查看配置说明"
        :on-confirm="() => (authModeSettingDrawer.visible = false)"
        :cancel-btn="null"
        :close-btn="false"
      >
        <div class="certificate-drawer">
          <!-- 展示数据 - HTTP代理模式 -->
          <template v-if="certificateInfo.authMode === 2">
            <certificate-http-alias :domains="certificateInfo?.domains" />
          </template>
          <!-- 展示数据 - DNS代理模式 -->
          <template v-if="certificateInfo.authMode === 4">
            <certificate-dns-alias :domains="certificateInfo?.domains" />
          </template>
        </div>
      </t-drawer>
      <!-- 配置弹出 -->
      <certificate-config
        v-model="certificateSettingDrawer.visible"
        :certificate="certificateInfo"
        @done="reloadCertificateInfo"
      />
      <!-- 查看证书 -->
      <certificate-info-comp
        v-model="certificateInfoDrawer.visible"
        :certificate="certificateInfo"
        :certificate-version-id="certificateInfoDrawer.versionInfo?.id"
        @done="reloadCertificateInfo"
      />
      <!-- 部署证书 -->
      <certificate-deploy v-model="delpoyDialog.visible" :certificate="certificateInfo" @done="handleDeployDone" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CertificateDetail',
};
</script>

<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createCertificateVersion, getCertificateInfo } from '@/api/certificate';
import { CERTIFICATE_AUTH_MODE, CertificateAuthModeMapList } from '@/constants';

import CertificateAgency from './components/certificate-agency/index.vue';
import CertificateAlias from './components/certificate-alias/index.vue';
import CertificateCloud from './components/certificate-cloud/index.vue';
import CertificateConfig from './components/certificate-config/index.vue';
import CertificateDeploy from './components/certificate-deploy/index.vue';
import CertificateDnsAlias from './components/certificate-dns-alias/index.vue';
import CertificateDomins from './components/certificate-domains/index.vue';
import CertificateHttpAlias from './components/certificate-http-alias/index.vue';
import CertificateInfoComp from './components/certificate-info/index.vue';
import CertificateList from './components/certificate-list/index.vue';
import CertificateType from './components/certificate-type/index.vue';

const route = useRoute();
const router = useRouter();

const certificateId = computed(() => route.params.id as unknown as number);
// 详情
const certificateInfo = ref({
  id: 0,
  name: '',
  alias: '',
  type: 1,
  certAgency: '',
  authMode: 2,
  autoNotify: 1,
  autoUpdate: 1,
  autoPush: 1,
  notifyDaysInAdvance: 30,
  updateDaysInAdvance: 7,
  domains: [],
  dnsServer: {
    id: null,
    name: '',
    alias: '',
  },
  associatedClouds: [],
  createTime: '',
});

// Tabs
const tabsValue = ref('version');

const authModeSettingDrawer = ref({
  visible: false,
});

// 显示验证配置信息
const showAuthModeDrawer = (authMode: string | number) => {
  if (authMode === CERTIFICATE_AUTH_MODE.DNS_AUTH_MODE) {
    router.push(`/dns/${certificateInfo.value?.dnsServer?.id}`);
  } else {
    authModeSettingDrawer.value!.visible = true;
  }
};

//  证书配置

const certificateSettingDrawer = ref({
  visible: false,
});
const handleEditConfig = () => {
  console.log('handleEditConfig');
  certificateSettingDrawer.value!.visible = true;
};

const reloadCertificateInfo = async () => {
  try {
    // 隐藏
    certificateSettingDrawer.value!.visible = false;
    delpoyDialog.value!.visible = false;
    // 加载数据
    certificateInfo.value = await getCertificateInfo(certificateId.value);
  } catch (err) {
    console.log(err);
  }
};

// 证书信息
const certificateInfoDrawer = ref({
  visible: false,
  versionInfo: {
    id: null,
  },
});
const handleVersionInfo = (version: any) => {
  console.log('handleVersionInfo');
  certificateInfoDrawer.value!.visible = true;
  certificateInfoDrawer.value!.versionInfo = version || {};
};

// 更新
const certificateListRef = ref();

// 提交证书更新
const renewCertificateVersion = async () => {
  const dialog = DialogPlugin.confirm({
    header: '确认更新?',
    body: '手动更新的证书，签发成功后如有关联云资源会自动更新，请确认更新！',
    onConfirm: async () => {
      try {
        // 提交
        await createCertificateVersion(certificateInfo.value?.id);
        MessagePlugin.success('已提交更新');
        MessagePlugin.warning('更新申请已经提交，请耐心等待');
        // 重载列表
        certificateListRef.value?.rehandlePageChange({ current: 1, pageSize: 10, previous: 1 });
      } catch (err) {
        console.log(`err:${err.message}`);
        MessagePlugin.error('证书更新失败');
      }
      return dialog.destroy();
    },
    onClose: () => {
      return dialog.destroy();
    },
  });
};

// 部署
const delpoyDialog = ref({
  visible: false,
  data: {},
});

const handleClickDeploy = () => {
  if (!certificateInfo.value?.associatedClouds?.length) {
    MessagePlugin.warning('证书还未关联云资源，请先关联云资源方可进行部署！');
    return;
  }
  // 弹窗
  delpoyDialog.value!.visible = true;
};

const handleDeployDone = () => {
  // 切换部署组件
  tabsValue.value = 'cloud';
  reloadCertificateInfo();
  // todo 启动定时刷新列表
};

onMounted(() => {
  // 加载详情
  reloadCertificateInfo();
});
</script>

<style lang="less" scoped>
.certificate-card:not(:last-child) {
  margin-bottom: 16px;
}

.certificate-detail {
  &-title {
    margin-bottom: var(--td-comp-margin-l);
    font: 500 var(--td-font-size-title-large) / var(--td-line-height-title-large) var(--td-font-family);
    line-height: 26px;
  }

  &-row {
    margin-bottom: var(--td-comp-margin-s);
  }

  :deep(.t-tabs__nav-item-wrapper) {
    padding: 0 var(--td-comp-paddingLR-l);
  }

  :deep(.t-tab-panel) {
    padding: var(--td-comp-paddingLR-m) 0;
  }
}

.cloud-config {
  margin-right: var(--td-comp-margin-xl);
  color: var(--td-brand-color);
  border-bottom: 1px solid transparent;

  &:hover {
    border-bottom: 1px solid var(--td-brand-color);
  }
}

.provider-style {
  display: flex;
  align-items: center;
  gap: 5px;

  :deep(.t-image__wrapper) {
    background: none;
  }
}

.certificate-drawer {
  :deep(.t-alert) {
    padding: var(--td-pop-padding-xl) var(--td-pop-padding-xl);
    margin-bottom: var(--td-pop-padding-xl);
  }

  :deep(.t-table) {
    margin-bottom: var(--td-pop-padding-xl);
  }
}
</style>
