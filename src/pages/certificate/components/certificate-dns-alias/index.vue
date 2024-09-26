<template>
  <t-alert theme="info">请添加 {{ domainsDnsValue.length }} 记录至您的DNS域名解析记录中</t-alert>
  <t-table
    row-key="value"
    bordered
    hover
    :loading="false"
    :data="domainsDnsValue"
    :columns="[{ title: '主机记录值', colKey: 'value' }]"
  ></t-table>
  <p class="line-p">以上域名解析记录的记录类型和记录值统一为：</p>
  <t-table
    row-key="value"
    bordered
    hover
    :loading="false"
    :data="dnsAliasData"
    :columns="[
      { title: '记录类型', align: 'center', width: 70, colKey: 'type' },
      { title: '记录值', colKey: 'value', colspan: 2 },
      { title: '复制', width: 100, align: 'center', colKey: 'copy' },
    ]"
  >
    <template #copy="{ row }">
      <t-link hover="color" @click="copyText(row.value)">
        <template #prefix-icon>
          <t-icon name="copy"></t-icon>
        </template>
        复制
      </t-link>
    </template>
  </t-table>
  <t-alert theme="info">请不要删除以上域名解析记录，否则会导致相关证书生成失败或自动更新失败</t-alert>
  <solt name="tips" />
  <!-- 校验操作 -->
  <div v-if="useVerify" class="verify-conn flex justify-between p-[12px_0]">
    <div></div>
    <t-button :loading="verifing" variant="outline" @click="handleToVerify">验证DNS解析记录</t-button>
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, toRefs } from 'vue';

import { useConfigStore, useUserStore } from '@/store';

const configStore = useConfigStore();
const { appDomain } = toRefs(configStore);

import { DnsCheck } from '@/api/common';
import { useCopy } from '@/hooks';
import { extractDomainWithPrefix } from '@/utils/common';

const { copyText } = useCopy({
  successDuration: 2e3,
  onSuccess: () => MessagePlugin.success('复制成功'),
  onError: (error: Error) => console.error('Failed to copy text:', error),
});

const props = defineProps({
  domains: Array<any>,
  useVerify: Boolean,
  onComplete: Function,
  onFailed: Function,
});
const { onComplete, onFailed } = toRefs(props);

const user = useUserStore();

const dnsAliasData = computed(() => {
  const { domain } = extractDomainWithPrefix(appDomain.value);
  return [{ type: 'CNAME', value: `_acme-challenge.${user.userInfo.userCode}.${domain || 'certeasy.cn'}` }];
});

// 域名解析拼接
const domainsDnsValue = computed(() => {
  return props?.domains.map((domain) => {
    return { value: `_acme-challenge.${domain.replaceAll('*.', '')}` };
  });
});

// 验证中
const verifing = ref(false);
const handleToVerify = async () => {
  try {
    verifing.value = true;
    await DnsCheck('cname', { domains: props?.domains });
    MessagePlugin.success('验证成功');
    if (onComplete.value) {
      onComplete.value();
    }
    verifing.value = false;
  } catch (err) {
    MessagePlugin.error(err.message);
    if (onFailed.value) {
      onFailed.value();
    }
    verifing.value = false;
  }
};
</script>
