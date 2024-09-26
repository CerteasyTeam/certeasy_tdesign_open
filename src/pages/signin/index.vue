<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="title-container">
        <h1 class="title margin-no">
          <img src="@/assets/assets-certeasy-logo.png" class="logo" />
        </h1>
        <div class="sub-title">
          <p class="tip">{{ $t('pages.signin.signInTip') }}</p>
        </div>
      </div>
      <!-- 表单 -->
      <t-form
        ref="form"
        :class="['item-container', `login-email`]"
        :data="formData"
        :rules="FORM_RULES"
        label-width="0"
        @submit="onSubmit"
      >
        <t-form-item name="email">
          <t-input v-model="formData.email" size="large" :placeholder="$t('pages.signin.input.email')">
            <template #prefix-icon>
              <t-icon name="user" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="password">
          <t-input
            v-model="formData.password"
            size="large"
            :type="showPsw ? 'text' : 'password'"
            clearable
            :placeholder="$t('pages.signin.input.password')"
          >
            <template #prefix-icon>
              <t-icon name="lock-on" />
            </template>
            <template #suffix-icon>
              <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item class="btn-container">
          <t-button :loading="submitLoading" block size="large" type="submit">
            {{ $t('pages.signin.signIn') }}
          </t-button>
        </t-form-item>

        <!-- 其他登录 -->
        <div class="other-account">
          <div class="other-account-label">
            <span class="other-account-label__content"> {{ $t('pages.signin.otherSignIn') }} </span>
          </div>
          <div class="other-account-content">
            <t-link theme="default" hover="color" @click="thirdOAuthLink('github')">
              <template #prefix-icon>
                <t-icon name="logo-github" class="icon" />
              </template>
              Github
            </t-link>
            <t-link theme="default" hover="color" @click="thirdOAuthLink('qq')">
              <template #prefix-icon>
                <t-icon name="logo-qq" class="icon" />
              </template>
              QQ
            </t-link>
            <t-link theme="default" hover="color" @click="thirdOAuthLink('wechat')">
              <template #prefix-icon>
                <t-icon name="logo-wechat-stroke" class="icon" />
              </template>
              Wechat
            </t-link>
          </div>
        </div>
        <!-- 操作 -->
        <div class="switch-container">
          <div class="switch-links">
            <div class="switch-link">
              <t-tooltip content="如您忘记账号，请联系客服找回">
                <t-link theme="default" hover="underline" href="https://docs.certeasy.cn/faq" target="_blank">
                  <template #suffix-icon>
                    <t-icon name="help-circle"></t-icon>
                  </template>
                  {{ $t('pages.signin.forgetAccount') }}
                </t-link>
              </t-tooltip>
            </div>
            <span class="switch-link__split"></span>
            <div class="switch-link">
              <t-link theme="default" hover="underline" @click="() => (resetPasswd!.visible = true)">{{
                $t('pages.signin.forgetPasswd')
              }}</t-link>
            </div>
            <span class="switch-link__split"></span>
            <div class="switch-link">
              <t-link theme="default" hover="underline" @click="toRouter('/signup')">{{
                $t('pages.signin.signUp')
              }}</t-link>
            </div>
          </div>
        </div>
      </t-form>
    </div>
    <!-- 忘记密码弹窗 -->
    <t-dialog
      v-model:visible="resetPasswd.visible"
      header="重置密码"
      :footer="null"
      width="480"
      @close="handleResetClose"
    >
      <div v-if="resetPasswd.valid" class="result">
        <t-icon class="result-icon" name="check-circle" />
        <div class="result-title">已发送</div>
        <div class="result-describe">您的重置邮件已发送，请移至邮箱查收验证邮件，进行邮箱确认操作。</div>
        <div>
          <t-button
            :disabled="countDown > 0"
            :loading="resetPasswd.loading"
            @click="handleResetPasswd({ validateResult: true })"
            >重新发送
            <span v-if="countDown > 0" class="ml-[5px]"> ({{ countDown }}s)</span>
          </t-button>
          <t-button theme="default" @click="handleResetClose">关闭</t-button>
        </div>
      </div>
      <div v-else class="reset-input">
        <t-form
          :data="resetPasswd.formData"
          label-width="0"
          :rules="{
            email: [{ required: true, message: `邮箱地址不能为空`, type: 'error' }],
          }"
          @submit="handleResetPasswd"
        >
          <t-form-item name="email">
            <t-input v-model="resetPasswd.formData.email" size="large" placeholder="请输入邮箱地址"></t-input>
          </t-form-item>
          <t-form-item>
            <t-button :loading="resetPasswd.loading" type="submit">找回密码</t-button>
          </t-form-item>
        </t-form>
      </div>
    </t-dialog>
    <!-- 扫码弹出 -->
    <t-dialog
      v-model:visible="qrDialog.visible"
      :close-on-overlay-click="false"
      :header="null"
      :footer="null"
      width="360"
      @close="handleQrDialogClose"
    >
      <t-loading
        size="small"
        :loading="qrDialog.loading"
        :text="qrDialog.timeout ? '登录超时' : '加载中...'"
        show-overlay
        :class="['qr-dialog-wrap', qrDialog.timeout ? 'timeout' : '']"
      >
        <t-image lazy :style="{ width: '240px', height: '240px' }" :src="qrCode" alt="alipay"></t-image>
        <div class="qr-tips">{{ qrDialog.timeout ? '登录超时，请重新获取二维码' : '微信扫一扫登录' }}</div>
      </t-loading>
    </t-dialog>
  </div>
</template>
<script lang="ts">
export default {
  name: 'SignInIndex',
};
</script>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';
import { useGtag } from 'vue-gtag-next';
import { useRoute, useRouter } from 'vue-router';

import { getWechatQrcode, sendResetPasswd, urls } from '@/api/auth';
import { useCounter } from '@/hooks';
import { t } from '@/locales';
import { useUserStore } from '@/store';

const [countDown, handleCounter] = useCounter();

const env = import.meta.env.MODE || 'development';
const userStore = useUserStore();

const { event } = useGtag();

const INITIAL_DATA = {
  email: env === 'development' ? 'me@mail.certeasy.cn' : '',
  password: env === 'development' ? '123456' : '',
  verifyCode: '',
  checked: false,
};

const FORM_RULES: Record<string, FormRule[]> = {
  email: [{ required: true, message: t('pages.signin.required.email'), type: 'error' }],
  password: [{ required: true, message: t('pages.signin.required.password'), type: 'error' }],
  verifyCode: [{ required: true, message: t('pages.signin.required.verification'), type: 'error' }],
};

const form = ref<FormInstanceFunctions>();
const formData = ref({ ...INITIAL_DATA });
const showPsw = ref(false);

const router = useRouter();
const route = useRoute();

// 第三方链接
const thirdOAuthLink = (app: string) => {
  const redirect = route.query.redirect as string;
  const redirectUrl = redirect ? decodeURIComponent(redirect) : '/overview';
  // 取得跳转链接
  const href = thirdUrls.value[app];
  if (href) {
    // 微信目前做小程序登录，唤醒弹窗二维码
    if (app === 'wechat') {
      wechatAppLogin(href);
      qrDialog.value!.visible = true;
      qrDialog.value!.loading = true;
      return;
    }
    window.location.href = `${href}?redirect=${encodeURIComponent(redirectUrl)}`;
  } else {
    MessagePlugin.warning('正在接入...');
  }
};

/**
 * 提交表单
 */
const submitLoading = ref(false);
const onSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    try {
      console.log('formData.value', formData.value);
      submitLoading.value = true;
      await userStore.login({
        email: formData.value.email,
        passwd: formData.value.password,
      });
      event('signin', { email: formData.value.email });
      MessagePlugin.success('登录成功');
      const redirect = route.query.redirect as string;
      const redirectUrl = redirect ? decodeURIComponent(redirect) : '/overview';
      router.push(redirectUrl);
    } catch (e) {
      console.log(e);
      submitLoading.value = false;
      MessagePlugin.error(e.message);
    }
  }
};

// 忘记密码
const resetPasswd = ref({
  visible: false,
  formData: {
    email: '',
  },
  valid: false,
  loading: false,
});

const handleResetPasswd = async (ctx: SubmitContext | { validateResult: boolean }) => {
  if (ctx.validateResult === true) {
    try {
      console.log('formData.value', formData.value);
      resetPasswd.value!.loading = true;
      await sendResetPasswd({
        email: resetPasswd.value!.formData.email,
      });
      event('reset', { email: formData.value.email });
      MessagePlugin.success('已发送重置邮件！');

      // 倒计时
      handleCounter();
      //
      resetPasswd.value!.loading = false;
      resetPasswd.value!.valid = true;
    } catch (e) {
      console.log(e);
      resetPasswd.value!.loading = false;
      MessagePlugin.error(e.message);
    }
  }
};

const handleResetClose = () => {
  resetPasswd.value!.loading = false;
  resetPasswd.value!.valid = false;
  resetPasswd.value!.formData.email = '';
  // 隐藏
  resetPasswd.value!.visible = false;
};

// 路由跳转
const toRouter = async (path: string) => {
  await router.push(path);
};

// 第三方登录地址
const thirdUrls = ref<Record<string, any>>({
  github: '',
  qq: '',
  wechat: '',
});
const loadUrls = async () => {
  try {
    thirdUrls.value = await urls();
  } catch (err) {
    console.log('err', err);
  }
};

// 扫码登录
const qrCode = ref(null);
const qrCodeCheckTimer = ref();

const qrDialog = ref({
  visible: false,
  loading: true,
  timeout: false,
});

// 获取二维码内容
const wechatAppLogin = async (scene: string) => {
  try {
    const { qrcode } = await getWechatQrcode(scene, { action: 'create' });
    // 入有qrcode 则开始循环
    if (qrcode) {
      qrCode.value = qrcode;
      qrCodeCheckTimer.value = setInterval(async () => {
        // 查询内容
        const { time, data } = await getWechatQrcode(scene, { action: 'check' });
        // TODO 5分钟超时，在前端做，后端后面在想吧，无所谓的
        if (Math.round((Date.now() - time) / 1e3) >= 180) {
          // 设置过期，
          qrDialog.value!.loading = true;
          qrDialog.value!.timeout = true;
          MessagePlugin.warning('登录超时，请重新获取二维码！');
          clearInterval(qrCodeCheckTimer.value);
          return;
        }
        if (time && data && data?.token) {
          // 有结果返回了,表示登录成功
          clearInterval(qrCodeCheckTimer.value);
          // 写入登录数据
          userStore.oauthLogin(data);
          MessagePlugin.success('登录成功！');
          qrDialog.value!.visible = false;
          qrDialog.value!.loading = true;
          qrDialog.value!.timeout = false;
          const redirect = route.query.redirect as string;
          const redirectUrl = redirect ? decodeURIComponent(redirect) : '/overview';
          router.push(redirectUrl);
        }
      }, 3e3);
      // 弹出内容
      qrDialog.value!.loading = false;
    }
  } catch (err) {
    MessagePlugin.error(`失败${err.message}`);
  }
};

const handleQrDialogClose = () => {
  qrDialog.value!.visible = false;
  qrDialog.value!.loading = true;
  qrDialog.value!.timeout = false;
  clearInterval(qrCodeCheckTimer.value);
};

onUnmounted(() => {
  clearInterval(qrCodeCheckTimer.value);
});

onMounted(() => {
  loadUrls();
  // 如果来源signin?resetPasswd=true
  if (route?.query?.resetPasswd) {
    // 展示弹出层
    handleResetClose();
    resetPasswd.value!.visible = true;
  }
});
</script>

<style lang="less" scoped>
@import './index.less';

.result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

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

.qr-dialog-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .qr-tips {
    color: var(--td-gray-color-8);
    font-size: var(--td-font-size-title-medium);
    margin-top: var(--td-comp-margin-xl);
  }

  &.timeout {
    position: relative;

    :deep(.t-image__wrapper) {
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: hsl(0deg 0% 100% / 90%);
        z-index: 9;
      }
    }

    .qr-tips {
      color: var(--td-warning-color-6);
      font-weight: 600;
    }
  }
}
</style>
