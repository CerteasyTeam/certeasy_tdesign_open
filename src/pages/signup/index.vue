<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="title-container">
        <h1 class="title margin-no">
          <img src="@/assets/assets-certeasy-logo.png" class="logo" />
        </h1>
        <div class="sub-title">
          <p class="tip">{{ $t('pages.signup.signUpTip') }}</p>
        </div>
      </div>
      <!-- 表单 -->
      <t-form
        ref="form"
        :class="['item-container', `register-password`]"
        :data="formData"
        :rules="FORM_RULES"
        label-width="0"
        @submit="onSubmit"
      >
        <t-form-item name="email">
          <t-input v-model="formData.email" type="text" size="large" :placeholder="$t('pages.signup.input.email')">
            <template #prefix-icon>
              <t-icon name="mail" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="password">
          <t-input
            v-model="formData.password"
            size="large"
            :type="showPsw ? 'text' : 'password'"
            clearable
            :placeholder="$t('pages.signup.input.password')"
          >
            <template #prefix-icon>
              <t-icon name="lock-on" />
            </template>
            <template #suffix-icon>
              <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
            </template>
          </t-input>
        </t-form-item>
        <t-form-item class="verification-code" name="verifyCode">
          <t-input
            v-model="formData.verifyCode"
            type="number"
            size="large"
            :placeholder="$t('pages.signup.input.verification')"
          >
            <template #prefix-icon>
              <t-icon name="user-password" />
            </template>
          </t-input>
          <t-button theme="primary" variant="base" :disabled="countDown > 0" @click="sendCode">
            {{
              countDown == 0 ? $t('pages.signup.sendVerification') : $t('pages.signup.waitVerification', { countDown })
            }}
          </t-button>
        </t-form-item>

        <t-form-item class="check-container" name="checked">
          <t-checkbox v-model="formData.checked">我已阅读并同意 </t-checkbox>
          <t-link tag="span" theme="primary" href="https://docs.certeasy.cn/terms" target="_blank">服务协议</t-link> 和
          <t-link tag="span" theme="primary" href="https://docs.certeasy.cn/privacy" target="_blank">隐私声明</t-link>
        </t-form-item>

        <t-form-item class="btn-container">
          <t-button :loading="submitLoading" block size="large" type="submit">
            {{ $t('pages.signup.signUp') }}
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
              <span
                >{{ $t('pages.signup.existAccount')
                }}<t-link theme="default" hover="underline" @click="toSignIn">立即登录</t-link></span
              >
            </div>
          </div>
        </div>
      </t-form>
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
  </div>
</template>
<script lang="ts">
export default {
  name: 'SignUpIndex',
};
</script>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';
import { useGtag } from 'vue-gtag-next';
import { useRoute, useRouter } from 'vue-router';

import { getWechatQrcode, signUp, urls } from '@/api/auth';
import { commEmail } from '@/api/common';
import { PASSWD_REGE_RULE } from '@/config/global';
import { useCounter } from '@/hooks';
import { t } from '@/locales';
import { useUserStore } from '@/store';

const user = useUserStore();
const { event } = useGtag();

const INITIAL_DATA = {
  email: '',
  password: '',
  verifyCode: '',
  checked: false,
};

const FORM_RULES: Record<string, FormRule[]> = {
  email: [
    { required: true, message: t('pages.signup.required.email'), type: 'error' },
    { email: true, message: t('pages.signup.required.emailError'), type: 'warning' },
  ],
  password: [
    { required: true, message: t('pages.signup.required.password'), type: 'error' },
    {
      validator: (val) => {
        if (val.length < 6) {
          return { result: false, message: '太简单了！再开动一下你的小脑筋吧！', type: 'error' };
        }
        const regexp = new RegExp(PASSWD_REGE_RULE);
        if (val.length >= 6 && regexp.test(val)) {
          return { result: true, message: '太棒了，你的密码超级符合规则！', type: 'success' };
        }
        if (val.length > 12) {
          return { result: false, message: '太长了换一个吧，我们怕你忘记了！', type: 'warning' };
        }
        return { result: false, message: '密码请输入6~12位大小写数字密码，请重新检查输入噢！', type: 'warning' };
      },
    },
  ],
  verifyCode: [{ required: true, message: t('pages.signup.required.verification'), type: 'error' }],
};

const form = ref<FormInstanceFunctions>();
const formData = ref({ ...INITIAL_DATA });
const showPsw = ref(false);
const [countDown, handleCounter] = useCounter();

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
 * 发送验证码
 */
const sendCode = () => {
  form.value.validate({ fields: ['email'] }).then(async (e) => {
    if (e === true) {
      // 发送 验证码
      try {
        await commEmail({ email: formData.value?.email, scene: 'signup' });
        event('verify', { email: formData.value?.email });
        MessagePlugin.success('验证码已发送');
        handleCounter();
      } catch (err) {
        console.log(err);
        MessagePlugin.error(err.message);
      }
    }
  });
};

/**
 * 提交表单
 */
const submitLoading = ref(false);
const onSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    try {
      // 协议
      if (formData.value.checked === false) {
        MessagePlugin.error('请先阅读并同意服务协议和隐私声明');
        return;
      }
      const { email, password, verifyCode } = formData.value;
      // loading
      submitLoading.value = true;
      // todo 读取邀请码
      await signUp({
        email,
        passwd: password,
        code: verifyCode,
        invite: user.invitation || null,
      });
      event('signup', { email: formData.value?.email });

      MessagePlugin.success('注册成功');
      const redirect = route.query.redirect as string;
      const redirectUrl = redirect ? decodeURIComponent(redirect) : '/signin';
      await router.push(redirectUrl);
    } catch (e) {
      console.log(e);
      submitLoading.value = false;
      MessagePlugin.error(e.message);
    }
  }
};

// 去登陆
const toSignIn = async () => {
  await router.push('/signin');
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
          user.oauthLogin(data);
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
});
</script>

<style lang="less" scoped>
@import './index.less';

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
