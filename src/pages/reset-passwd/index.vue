<template>
  <div class="reset-wrapper">
    <!-- 头部 -->
    <div class="reset-header">
      <div class="left-logo">
        <a href="/"><img src="@/assets/assets-certeasy-logo.png" class="logo" /></a>
      </div>
      <div class="right-items"></div>
    </div>
    <!-- 重置表单 -->
    <div class="reset-container">
      <t-loading size="small" :loading="loading" show-overlay>
        <div class="title-container">
          <div class="title">Hi，{{ route.query?.email || 'Certeasy 用户' }}</div>
          <div class="sub-title">
            <p class="tip">请输您的新密码进行重置</p>
          </div>
        </div>
        <t-form
          ref="form"
          :class="['form-container', `reset-passwd`]"
          :data="formData"
          :rules="FORM_RULES"
          label-width="0"
          @submit="onSubmit"
        >
          <t-form-item name="passwd">
            <t-input v-model="formData.passwd" type="password" size="large" placeholder="请输入密码"> </t-input>
          </t-form-item>
          <t-form-item name="rePasswd">
            <t-input v-model="formData.rePasswd" type="password" size="large" placeholder="请再次确认密码"> </t-input>
          </t-form-item>
          <t-form-item class="btn-container">
            <t-button :loading="submitLoading" block size="large" type="submit">重置密码</t-button>
          </t-form-item>
        </t-form>
      </t-loading>
    </div>
    <!-- 版权 -->
    <div class="reset-footer">
      <layout-footer />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { type FormInstanceFunctions, type FormRule, MessagePlugin, SubmitContext } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { resetPasswd } from '@/api/auth';
import { PASSWD_REGE_RULE } from '@/config/global';
import LayoutFooter from '@/layouts/components/Footer.vue';

const router = useRouter();
const route = useRoute();

const form = ref<FormInstanceFunctions>();
const formData = ref({
  passwd: '',
  rePasswd: '',
});

const FORM_RULES: Record<string, FormRule[]> = {
  passwd: [
    { required: true, message: `请输入新密码`, type: 'error' },
    {
      validator: (val: any) => {
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
        return { result: false, message: '你的密码不符合规则，请重新检查输入噢！', type: 'warning' };
      },
    },
  ],
  rePasswd: [
    { required: true, message: `请再次输入新密码`, type: 'error' },
    { validator: (value: any) => value === formData.value.passwd, message: '两次密码不一致' },
  ],
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
      await resetPasswd({
        token: route.query?.token,
        email: route.query?.email,
        passwd: formData.value.passwd,
        rePasswd: formData.value.rePasswd,
      });
      MessagePlugin.success('重置成功');
      const redirect = route.query.redirect as string;
      const redirectUrl = redirect ? decodeURIComponent(redirect) : '/overview';
      router.replace(redirectUrl);
    } catch (e) {
      console.log(e);
      submitLoading.value = false;
      MessagePlugin.error(e.message);
    }
  }
};

const loading = ref(true);

onMounted(() => {
  // 检查是否有token
  if (!route.query?.token || !route.query?.email) {
    MessagePlugin.error('校验数据错误，请重新发送邮件');
    setTimeout(() => {
      router.replace('/');
    }, 2e3);
  } else {
    loading.value = false;
  }
});
</script>
<style lang="less" scoped>
.reset-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between; // 居中
  background-size: cover;
  background-position: 100%;
  position: relative;
}

.reset-header {
  position: relative;
  height: 50px;
  width: 100%;
  border-bottom: 1px solid var(--td-gray-color-1);
  display: flex;
  align-items: center;
  padding: 0 var(--td-comp-paddingLR-xl);

  .left-logo {
    width: 120px;
  }
}

.reset-container {
  position: relative;
  flex: 1;
  padding: var(--td-size-10);
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center; // 居中
  margin: 0 auto;
}

.title-container {
  .title {
    font: var(--td-font-title-large);
    color: var(--td-text-color-primary);

    &.margin-no {
      margin-top: 0;
    }
  }

  .sub-title {
    margin-top: var(--td-comp-margin-xl);

    .tip {
      display: inline-block;
      font: var(--td-font-body-large);
    }
  }
}

.form-container {
  width: 320px;
  margin-top: var(--td-comp-margin-m);

  .btn-container {
    margin-top: var(--td-comp-margin-xxxl) !important;
  }
}

.reset-footer {
  padding: var(--td-comp-paddingTB-xl) var(--td-comp-paddingLR-xl);
  text-align: center;
}
</style>
