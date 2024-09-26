<template>
  <t-alert theme="info"
    >请在服务端(CDN、Nginx、OpenResty、HTTPd等)配置中将以下1个域名的HTTP验证请求路径代理至Certeasy的代理验证地址并设置相应的请求头，以实现证书申请及后续更新的自动化</t-alert
  >
  <t-table
    row-key="value"
    bordered
    hover
    :loading="false"
    :data="domainsHttpUri"
    :columns="[
      { title: 'HTTP验证请求路径', colspan: 2, colKey: 'value' },
      { title: '复制', width: 100, align: 'center', colKey: 'copy' },
    ]"
  >
    <template #value="{ row }">
      <div class="" style="display: flex; align-items: center; justify-content: space-between">
        <div>{{ row.value }}</div>
        <t-link :href="`${row.value}certeasy-${user.userInfo.userCode}`" target="_blank" theme="primary"
          >点击验证</t-link
        >
      </div>
    </template>
    <template #copy="{ row }">
      <t-link hover="color" @click="copyText(row.value)">
        <template #prefix-icon>
          <t-icon name="copy"></t-icon>
        </template>
        复制
      </t-link>
    </template></t-table
  >
  <p class="line-p">1、请在服务端配置中将以上路径统一代理至以下地址：</p>
  <t-table
    row-key="value"
    bordered
    hover
    :show-header="false"
    :loading="false"
    :data="httpAgencyData"
    :columns="[
      { title: 'HTTP代理地址', colKey: 'value' },
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
    </template></t-table
  >
  <p class="line-p">2、请在服务端配置中将以上代理统一添加以下请求头：</p>
  <t-table
    row-key="value"
    bordered
    hover
    :show-header="false"
    :loading="false"
    :data="[{ value: `x-user-code ${user.userInfo.userCode}` }]"
    :columns="[
      { title: 'HTTP代理请求头', colKey: 'value' },
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
    </template></t-table
  >
  <t-alert theme="info">请不要删除以上服务端代理配置，否则会导致相关证书生成失败或自动更新失败</t-alert>
  <pre class="pre-content">{{
    `# 此处为Nginx服务端配置代码示例，仅供参考
${domainsNginxConfig}
`
  }}</pre>
  <!-- 校验操作 -->
  <div v-if="useVerify" class="verify-conn flex justify-between p-[12px_0]">
    <div></div>
    <t-button :loading="verifing" variant="outline" @click="handleToVerify">验证HTTP是否联通</t-button>
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, toRefs } from 'vue';

import { HttpCheck } from '@/api/common';
import { useCopy } from '@/hooks';
import { useConfigStore, useUserStore } from '@/store';

const configStore = useConfigStore();
const { appDomain } = toRefs(configStore);

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

/**
 * Http 代理数据
 */
const httpAgencyData = ref([
  {
    value: `${appDomain.value ? `https://${appDomain.value}` : import.meta.env.VITE_APP_URL}/.well-known/acme-challenge/`,
  },
]);

// 域名链接拼接
const domainsHttpUri = computed(() => {
  return props?.domains.map((domain) => {
    return { value: `http://${domain}/.well-known/acme-challenge/` };
  });
});

// nginx 配置拼接
const domainsNginxConfig = computed(() => {
  return props?.domains
    .map((domain) => {
      return `server {
    # 注意配置的必须是80端口（即HTTP请求，非443端口的HTTPS请求）
    listen  80;
    server_name  ${domain};

    location /.well-known/acme-challenge/ {
        # 设置代理请求头，用以验证证书申请者身份
        proxy_set_header  x-user-code  ${user.userInfo.userCode};

        # 设置代理地址，指向Certeasy代理验证地址，以实现证书申请及后续更新的自动化
        proxy_pass  ${appDomain.value ? `https://${appDomain.value}` : import.meta.env.VITE_APP_URL}/.well-known/acme-challenge/;
    }

    # ... 其它Nginx配置 ...
}
    `;
    })
    .join('\n');
});

// 验证中
const verifing = ref(false);
const handleToVerify = async () => {
  try {
    verifing.value = true;
    await HttpCheck('proxy', { domains: props?.domains });
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
