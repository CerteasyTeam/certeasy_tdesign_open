<template>
  <div class="certificate-guide">
    <!-- page-nav -->
    <page-nav :show-back="true" title="证书申请" />
    <t-card>
      <div class="top-tabs">
        <t-row justify="center">
          <t-col :span="6">
            <t-steps :current="currentStep">
              <t-step-item title="签发机构" />
              <t-step-item title="添加域名" />
              <t-step-item title="域名验证" />
              <t-step-item title="申请证书" />
            </t-steps>
          </t-col>
        </t-row>
      </div>
      <div class="guide-content">
        <!-- 内容体 -->
        <t-row justify="center">
          <t-col :span="6">
            <div v-if="currentStep == 0" class="setup-brand">
              <h3>请选择签发机构</h3>
              <t-divider />
              <div class="brand-list comp-radio-group">
                <t-radio-group v-model="formData.certAgency" default-value="letsencrypt">
                  <t-radio-button value="letsencrypt">
                    <div class="brand-item">
                      <img src="@/assets/brand/letsencrypt.png" />
                    </div>
                  </t-radio-button>
                  <t-radio-button value="zerossl">
                    <div class="brand-item">
                      <img src="@/assets/brand/zerossl.png" />
                    </div>
                  </t-radio-button>
                  <t-radio-button value="google">
                    <div class="brand-item">
                      <img src="@/assets/brand/google.png" />
                    </div>
                  </t-radio-button>
                </t-radio-group>
              </div>
            </div>
            <div v-if="currentStep == 1" class="setup-domains">
              <h3>选择证书类型，添加证书申请所需的域名</h3>
              <t-divider />
              <t-row style="margin-bottom: var(--td-comp-paddingTB-l)">
                <t-radio-group v-model="formData.type">
                  <t-radio-button v-for="(item, key) in CertificateTypesMapList" :key="key" :value="Number(key)">
                    {{ item.label }}
                  </t-radio-button>
                </t-radio-group>
              </t-row>
              <t-textarea
                v-model="formData.domains"
                :placeholder="domainsPlaceholder[formData.type]"
                name="description"
                :autosize="{ minRows: 5, maxRows: 8 }"
              />
            </div>
            <div v-if="currentStep == 2" class="setup-auth">
              <h3>选择验证域名所有权方式</h3>
              <t-divider />
              <t-row style="margin-bottom: var(--td-comp-paddingTB-l)">
                <t-radio-group v-model="formData.authMode">
                  <t-radio-button
                    v-for="(item, key) in CertificateAuthModeMapList"
                    :key="key"
                    :disabled="
                      CERTIFICATE_TYPE.WILDCARD == formData.type &&
                      CERTIFICATE_AUTH_MODE.HTTP_ALIAS_AUTH_MODE == Number(key)
                    "
                    :value="Number(key)"
                  >
                    {{ item.label }}
                  </t-radio-button>
                </t-radio-group>
              </t-row>
              <t-row>
                <t-col :span="12">
                  <!-- http alias -->
                  <certificate-http-alias
                    v-if="formData.authMode == CERTIFICATE_AUTH_MODE.HTTP_ALIAS_AUTH_MODE"
                    :domains="domainsArray"
                    :use-verify="true"
                    :on-complete="() => handleDnsVerify(true)"
                    :on-failed="() => handleDnsVerify(false)"
                  />
                  <!-- dns auth -->
                  <div v-if="formData.authMode == CERTIFICATE_AUTH_MODE.DNS_AUTH_MODE" class="">
                    <t-row>
                      <div class="brand-list comp-radio-group">
                        <t-radio-group v-model="currentProviderId" default-value="letsencrypt">
                          <t-radio-button v-for="item in dnsProviders" :key="item.id" :value="item.id">
                            <div class="brand-item flex items-center">
                              <t-image
                                lazy
                                :style="{ width: '24px', height: '24px' }"
                                :src="item.logo"
                                :alt="item.name"
                              ></t-image>
                              <div class="ml-[10px]">{{ item.name }}</div>
                            </div>
                          </t-radio-button>
                        </t-radio-group>
                      </div>
                    </t-row>
                    <t-row class="mt-[20px]">
                      <t-select v-model="formData.dnsServerId" placeholder="请选择已有dns服务" clearable>
                        <t-option
                          v-for="item in currentUserDnsServer"
                          :key="item.id"
                          :value="item.id"
                          :label="item.alias || item.name"
                        ></t-option>
                      </t-select>
                    </t-row>
                    <div v-if="currentProvider && currentProvider.configJson">
                      <div class="flex flex-col">
                        <t-row v-for="(item, idx) in currentProvider!.configJson!.fields" :key="idx" class="mt-[16px]">
                          <t-col :span="3">{{ item.name }}: </t-col>
                          <t-col :span="8">
                            <div class="flex items-center gap-[10px]">
                              <t-input
                                v-model="formData!.dnsServerAccessJson[item.field]"
                                :disabled="!!formData!.dnsServerId"
                                :type="item.type.toLowerCase()"
                                :placeholder="`请输入 ${item.name}`"
                              ></t-input>
                              <t-icon v-if="authCheck" color="green" size="18" name="check-circle" />
                            </div>
                          </t-col>
                        </t-row>
                        <div class="mt-[10px]">
                          <t-link
                            theme="warning"
                            hover="color"
                            :href="currentProvider!.configJson!.helpUrl"
                            target="_blank"
                          >
                            <template #prefix-icon>
                              <t-icon name="help-circle" size="16"></t-icon>
                            </template>
                            <span style="margin-left: var(--td-comp-margin-xs)">点击查看相关操作文档</span>
                          </t-link>
                        </div>
                      </div>
                    </div>
                    <!-- 校验操作 -->
                    <div class="verify-conn flex justify-between p-[12px_0]">
                      <div></div>
                      <t-button :loading="dnsVerifing" variant="outline" @click="handleToDnsVerify"
                        >验证DNS授权</t-button
                      >
                    </div>
                  </div>
                  <!-- dns alias -->
                  <certificate-dns-alias
                    v-if="formData.authMode == CERTIFICATE_AUTH_MODE.DNS_ALIAS_AUTH_MODE"
                    :domains="domainsArray"
                    :use-verify="true"
                    :on-complete="() => handleDnsVerify(true)"
                    :on-failed="() => handleDnsVerify(false)"
                  />
                </t-col>
              </t-row>
            </div>
            <div v-if="currentStep == 3" class="setup-apply">
              <template v-if="certificateVersionInfo.status === 1">
                <t-row justify="center">
                  <div class="result loading">
                    <t-icon class="result-icon" name="loading" />
                    <div class="result-title">证书申请中</div>
                    <div class="result-describe">证书申请中，预计需要 3 ～ 15 分钟，请您耐心等待</div>
                  </div>
                </t-row>
              </template>
              <!-- 申请失败 -->
              <t-row v-else-if="certificateVersionInfo.status === 0" justify="center">
                <div class="result">
                  <t-icon class="result-icon error" name="error-circle" />
                  <div class="result-title">证书申请失败</div>
                  <div class="result-describe">错误原因：{{ certificateVersionInfo.error }}</div>
                  <div>
                    <t-button theme="default" @click="() => $router.push('/overview')">查看证书</t-button>
                    <t-button @click="handleReloadCertificate">重新申请</t-button>
                  </div>
                </div>
              </t-row>
              <!-- 申请成功 -->
              <template v-else>
                <t-row justify="center">
                  <div class="result">
                    <t-icon class="result-icon" name="check-circle" />
                    <div class="result-title">证书申请成功</div>
                    <div class="result-describe">您的证书已经生成，请您下载自行部署或在证书详情自动部署</div>
                    <div>
                      <t-button
                        theme="default"
                        @click="() => $router.push(`/certificate/${certificateVersionInfo.certificateId}`)"
                        >查看证书</t-button
                      >
                      <t-button @click="handleDownloadCertificate">下载证书文件</t-button>
                    </div>
                  </div>
                </t-row>
              </template>
              <!-- 展示进程数据 -->
              <t-row justify="center">
                <div ref="loggerContainer" class="logger-container flex bg-[#e7e7e7] w-full p-80"></div>
              </t-row>
            </div>
          </t-col>
        </t-row>
      </div>
      <!-- 操作栏 -->
      <t-row v-if="currentStep < 3" justify="center" class="guide-operate">
        <t-col :span="6">
          <t-button v-if="currentStep > 0" theme="default" @click="handleNext(-1)">上一步</t-button>
          <t-button :loading="submitLoading" class="next-button" @click="handleNext()">下一步</t-button>
        </t-col>
      </t-row>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { EventSourcePolyfill } from 'event-source-polyfill';
import * as psl from 'psl';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, onUnmounted, ref, toRefs, watch } from 'vue';
import { useGtag } from 'vue-gtag-next';

import {
  createCertificate,
  createCertificateVersion,
  downloadCertificateVersionCert,
  getCertificateVersionInfo,
} from '@/api/certificate';
import { checkDns, getDnsList, getDnsProviderList } from '@/api/dns';
import {
  CERTIFICATE_AUTH_MODE,
  CERTIFICATE_TYPE,
  CertificateAuthModeMapList,
  CertificateTypesMapList,
} from '@/constants';
import { useConfigStore, useUserStore } from '@/store';

const configStore = useConfigStore();
const { appDomain } = toRefs(configStore);

import { checkDuplicate, checkObjectEmptyAndKeys, download } from '@/utils/common';
import { host } from '@/utils/request';

import CertificateDnsAlias from './components/certificate-dns-alias/index.vue';
import CertificateHttpAlias from './components/certificate-http-alias/index.vue';

const userStore = useUserStore();
const { event } = useGtag();

// 示例
const domainsExample = (wildcard?: string) => {
  return ['', 'aa', 'bb', 'a.aa', 'b.bb']
    .map((prefix) => `${wildcard || ''}${prefix ? `${prefix}.` : ''}${appDomain.value || import.meta.env.VITE_APP_URL}`)
    .join('\n');
};

const currentStep = ref(0); // 0 1 2 3
const domainsPlaceholder = ref({
  [CERTIFICATE_TYPE.SINGLE]: `请输入域名，不能以*.开头，支持一个域名`,
  [CERTIFICATE_TYPE.MULTI]: `请输入域名，不能以*.开头，每行一个，支持多个，例如：
${domainsExample()}`,
  [CERTIFICATE_TYPE.WILDCARD]: `泛域名请以*.开头，每行一个，支持多个，例如：
${domainsExample('*.')}`,
});

const formData = ref<any>({
  certAgency: 'letsencrypt',
  type: CERTIFICATE_TYPE.SINGLE, // CERTIFICATE_TYPE
  domains: '',
  authMode: CERTIFICATE_AUTH_MODE.DNS_ALIAS_AUTH_MODE, // CERTIFICATE_AUTH_MODE
  dnsServerId: null,
  dnsProviderId: null,
  dnsServerAccessJson: {},
});

const authCheck = ref(false);

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
    // 充值dnsProviderId
    formData.value!.dnsServerId = null;
    formData.value!.dnsProviderId = null;
    formData.value!.dnsServerAccessJson = {};
  },
);

const domainsArray = computed(() => {
  return formData.value.domains.split('\n').filter((domain: string) => domain.trim());
});

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
  event('nextStep', formData.value);
  console.log('authCheck.value', authCheck.value, currentStep.value);

  // 进入流程
  if (currentStep.value >= 1) {
    // 刷新列表
    if (currentStep.value === 1) {
      reloadDnsProviders();
    }
    const { error } = checkDomains();
    if (error) return MessagePlugin.error(error);
    // 泛域名设置DNS验证，HTTP禁止选择
    if (formData.value?.type === CERTIFICATE_TYPE.WILDCARD && currentStep.value === 1) {
      formData.value!.authMode = CERTIFICATE_AUTH_MODE.DNS_AUTH_MODE;
    }
    if (currentStep.value >= 2) {
      if (!authCheck.value) {
        return MessagePlugin.error('域名验证失败，请先校验域名成功再进行下一步');
      }
      await submitCreateCertificate();
    }
  }
  // 下一步
  currentStep.value += step;
  return true;
};

const checkDomains = (): { error: string | null; domains?: string[] } => {
  if (domainsArray.value.length <= 0) {
    return { error: '请填写申请域名' };
  }

  if (formData.value?.type === CERTIFICATE_TYPE.SINGLE && domainsArray.value?.length > 1) {
    return { error: '单域名类型证书域名数量不能多于1个' };
  }

  if (formData.value?.type === CERTIFICATE_TYPE.MULTI && domainsArray.value?.length <= 1) {
    return { error: '多域名类型证书域名数量不能少于2个' };
  }

  if (formData.value?.type === CERTIFICATE_TYPE.MULTI && domainsArray.value?.length > 100) {
    return { error: '多域名类型证书域名数量不能多于100个' };
  }

  // 重复域名
  const { error, duplicates } = checkDuplicate(domainsArray.value);
  if (error) {
    return { error: `您填写域名【${duplicates[0]}】存在重复，请检查后再重试` };
  }
  // 是否泛域名
  const wildcard = domainsArray.value?.every((item: string) => item.startsWith('*.'));
  if (formData.value?.type !== CERTIFICATE_TYPE.WILDCARD && wildcard) {
    return { error: '单域名或多域名不能以*.开头' };
  }
  if (formData.value?.type === CERTIFICATE_TYPE.WILDCARD && !wildcard) {
    return { error: '泛域名必须以*.开头' };
  }

  // 域名校验
  let mainDomain;
  for (const domain of domainsArray.value) {
    const tempDomain = domain.startsWith('*.') ? domain.replace('*.', '') : domain;
    if (!psl.isValid(tempDomain)) {
      return { error: `域名【${tempDomain}】不是合法域名` };
    }
    const tempMainDomain = psl.get(tempDomain);
    if (!mainDomain) {
      mainDomain = tempMainDomain;
    } else if (mainDomain !== tempMainDomain) {
      return { error: `顶级域名不一致，所有域名的顶级域名必须一致` };
    }
  }
  return { error: null, domains: domainsArray.value };
};

const dnsProviders = ref([]);
const currentProviderId = ref();
const userDnsServers = ref([]);
const currentProvider = computed(() => {
  return dnsProviders.value.find((pro) => pro.id === currentProviderId.value);
});
// 当前provider下的用户dns server
const currentUserDnsServer = computed(() => {
  return userDnsServers.value.filter((pro) => pro.providerId === currentProviderId.value);
});
const currentDnsServer = computed(() => {
  return userDnsServers.value.find((pro) => pro.id === formData.value.dnsServerId);
});

// dns
const reloadDnsProviders = async () => {
  try {
    const { records } = await getDnsProviderList({});
    console.log('records', records);
    dnsProviders.value = records;
    // 选择第一项
    currentProviderId.value = records[0].id;
    // 加载用户dns
    reloadUserDnsServers();
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};

const reloadUserDnsServers = async () => {
  try {
    const { records } = await getDnsList({});
    console.log('records', records);
    userDnsServers.value = records;
  } catch (err) {
    console.log(`err:${err.message}`);
  }
};

watch(
  () => [currentProvider.value, formData.value],
  ([value, form]) => {
    console.log('currentProvider.value', value);
    // 恢复
    formData.value!.dnsProviderId = value?.id;
    formData.value!.dnsServerId = '';
    // 处理formData!.accessJson
    formData.value!.dnsServerAccessJson = value?.configJson?.fields.reduce((acc: any, cur: any) => {
      acc[cur.field] = form.dnsServerAccessJson[cur.field] || '';
      return acc;
    }, {});
    console.log('formData.value', formData.value);
    authCheck.value = false;
  },
);

watch(
  () => currentDnsServer.value,
  (provider) => {
    // 存在则赋值
    if (provider) {
      formData.value!.dnsServerAccessJson = provider?.accessJson;
    } else {
      // 置空
      formData.value!.dnsServerAccessJson = currentProvider.value?.configJson?.fields.reduce((acc: any, cur: any) => {
        acc[cur.field] = '';
        return acc;
      }, {});
    }
    console.log('formData.value', formData.value);
    authCheck.value = false;
  },
);

const dnsVerifing = ref(false);
const handleToDnsVerify = async () => {
  try {
    // todo 验证值输入 可以考虑走form 验证
    const { error, emptyKeys } = checkObjectEmptyAndKeys(formData.value?.dnsServerAccessJson);
    console.log('error, emptyKeys', error, emptyKeys, formData.value?.dnsServerAccessJson);
    if (error) {
      MessagePlugin.error(
        emptyKeys?.length ? `配置项【${emptyKeys[0]}】为空，请补充完整` : '还未选择授权dns或请填写配置数据',
      );
      return;
    }
    const { type, dnsServerAccessJson } = formData.value;
    const params = {
      providerId: currentProviderId.value,
      providerServerId: currentDnsServer.value?.id,
      domains: domainsArray.value,
      type,
      accessJson: dnsServerAccessJson,
    };
    console.log('checkDns,params', params);
    dnsVerifing.value = true;
    // 请求检查
    const { error: apiError, result } = await checkDns(params);
    authCheck.value = result;
    if (apiError) {
      MessagePlugin.error(apiError);
    } else {
      MessagePlugin.success('验证成功');
    }
    dnsVerifing.value = false;
  } catch (err) {
    MessagePlugin.error(err.message);
    authCheck.value = false;
    dnsVerifing.value = false;
  }
};

// 授权检查
const handleDnsVerify = (checked: boolean): void => {
  authCheck.value = checked;
};

// 证书信息
const certificateVersionInfo = ref({
  id: null,
  certificateId: null,
  certificate: {
    name: '',
    alias: '',
  },
  detail: {
    cert: '',
    certKey: '',
  },
  error: '',
  status: 1,
});
const loggerContainer = ref();

/**
 * 提交表单
 */
const submitLoading = ref(false);
const submitCreateCertificate = async () => {
  try {
    submitLoading.value = true;
    // 提交证书
    const { id, latestVersionId } = await createCertificate({
      ...formData.value,
      domains: domainsArray.value,
    });
    event('certificate', formData.value);
    MessagePlugin.success('申请已经提交，正在向CA机构申请证书，请耐心等待');
    // 开始轮询或者sse
    // 读取证书
    getCertificateVersionInfo(id, latestVersionId).then((data) => {
      // 写入数据
      certificateVersionInfo.value = data;
      // 轮询
      actionCertificateProcessEvent(id, latestVersionId);
    });
    submitLoading.value = false;
  } catch (err) {
    submitLoading.value = false;
    MessagePlugin.error(err.message);
    // 重置步骤
    handleNext(-1);
  }
};

const eventSource = ref();
const getCertificateTimer = ref();
/**
 * sse轮询证书进度
 */
const actionCertificateProcessEvent = (certificateId: number, versionId: number) => {
  getCertificateTimer.value = setInterval(async () => {
    // 读取证书
    certificateVersionInfo.value = await getCertificateVersionInfo(certificateId, versionId);
    // 如果2/0就结束
    if (certificateVersionInfo.value?.status !== 1) {
      clearInterval(getCertificateTimer.value);
      if (eventSource.value) {
        eventSource.value.close();
      }
    }
  }, 3e3);
  // return;
  const eventHost = `${host || import.meta.env.VITE_API_URL}/certificate/${certificateId}/version/${versionId}/process`;
  // 用户token
  const { token } = userStore;
  eventSource.value = new EventSourcePolyfill(eventHost, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    heartbeatTimeout: 60 * 1e3,
  });

  eventSource.value.onmessage = (event: any) => {
    // 展示消息
    loggerContainer.value!.style.display = 'block';
    const newLogLine = document.createTextNode(`${event.data}\n`);
    loggerContainer.value?.appendChild(newLogLine);
    loggerContainer.value!.scrollTop = loggerContainer.value?.scrollHeight; // 自动滚动到底部
  };

  eventSource.value.onerror = (error: any) => {
    console.error('SSE error:', error);
  };
};

const handleReloadCertificate = async () => {
  try {
    const { id, certificateId } = await createCertificateVersion(certificateVersionInfo.value?.certificateId);
    MessagePlugin.success('已重新申请已经提交，请耐心等待');
    // 开始轮询或者sse
    // 轮询
    actionCertificateProcessEvent(certificateId, id);
  } catch (err) {
    console.log(`err:${err.message}`);
    MessagePlugin.error('证书更新失败');
  }
};
const handleDownloadCertificate = () => {
  const {
    id,
    certificateId,
    certificate: { name, alias },
  } = certificateVersionInfo.value;
  downloadCertificateVersionCert(certificateId, id).then((data) => {
    const downName = `${alias || name}_${Math.round(Date.now() / 1e3)}.zip`;
    download(data, downName);
  });
};

onMounted(async () => {
  await reloadDnsProviders();
});

onUnmounted(() => {
  if (eventSource.value) {
    eventSource.value.close();
  }
  if (getCertificateTimer.value) {
    clearInterval(getCertificateTimer.value);
  }
});
</script>
<style lang="less" scoped>
.certificate-guide {
  :deep(.t-card) {
    margin-bottom: var(--td-comp-paddingTB-l);
  }

  :deep(.t-alert) {
    padding: var(--td-pop-padding-xl) var(--td-pop-padding-xl);
    margin-bottom: var(--td-pop-padding-xl);
  }

  :deep(.t-table) {
    margin-bottom: var(--td-pop-padding-xl);
  }

  .top-tabs {
    margin: var(--td-comp-paddingTB-l) var(--td-comp-paddingTB-s);
  }

  .guide-content {
    min-height: 30vh;
  }

  .brand-list {
    :deep(.t-radio-button) {
      padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-xl);
      border: 1px solid var(--td-border-level-2-color);
      height: auto !important;
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

  .guide-operate {
    margin-top: var(--td-comp-paddingTB-xxl);

    .next-button {
      width: 150px;
    }
  }
}

.logger-container {
  position: relative;
  display: none;
  margin-bottom: var(--td-comp-paddingTB-xl);
  width: 100%; /* 占满父容器的宽度 */
  height: 45vh; /* 固定高度，便于滚动 */
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
</style>
