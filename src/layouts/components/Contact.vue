<template>
  <t-popup expand-animation placement="bottom-right">
    <template #content>
      <div class="header-contact">
        <div class="header-contact-top">
          <p>扫码添加客服微信</p>
        </div>
        <div class="">
          <t-image
            lazy
            :style="{ width: '200px', height: '200px' }"
            class="contact-img"
            :src="customerService?.qrcode || WechatContact"
          >
            <template #error>
              <img class="contact-img" src="@/assets/contact/wechat-contact.jpg" />
            </template>
          </t-image>
          <t-divider />
          <p>微信号：<copy-label link :value="customerService?.wechat || 'zuxcloud'" /></p>
          <p>邮箱：<copy-label link :value="customerService?.email || 'me@mail.certeasy.cn'" /></p>
        </div>
      </div>
    </template>

    <t-button theme="default" variant="text">
      <template #icon><t-icon name="service" /></template>
      {{ $t('layout.header.contact') }}
    </t-button>
  </t-popup>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

import WechatContact from '@/assets/contact/wechat-contact.jpg';
import { useConfigStore } from '@/store';

const configStore = useConfigStore();
const { customerService } = toRefs(configStore);
</script>

<style lang="less" scoped>
.header-contact {
  //width: 360px;
  padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
  margin: calc(0px - var(--td-comp-paddingTB-xs)) calc(0px - var(--td-comp-paddingLR-s));

  &-top {
    position: relative;
    font: var(--td-font-title-medium);
    color: var(--td-text-color-primary);
    text-align: left;
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
  }

  :deep(.t-divider) {
    margin: var(--td-comp-margin-m) 0;
  }
}

.contact-img {
  width: 200px;
}
</style>
