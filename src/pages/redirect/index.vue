<template>
  <div class="redirect">
    <t-loading size="medium" :loading="loading" show-overlay></t-loading>
    <!-- 邮箱采集 -->
    <t-dialog
      v-model:visible="collectDialog.visible"
      :close-on-overlay-click="false"
      header="绑定邮箱"
      :footer="null"
      width="420"
      @close="handleCollectDialogClose"
    >
      <t-form ref="formRef" :data="formData" label-align="top" :label-width="100" @submit="onSubmitConfirm">
        <t-form-item
          name="email"
          label="邮箱"
          :rules="[
            { required: true, message: `邮箱不能为空`, type: 'error' },
            { email: true, message: '邮箱地址输入不正确', type: 'warning' },
          ]"
        >
          <t-input v-model="formData.email" placeholder="请输入邮箱地址" />
        </t-form-item>
        <t-form-item name="code" label="验证码" :rules="[{ required: true, message: `验证码不能为空`, type: 'error' }]">
          <t-input v-model="formData.code" placeholder="请输入验证码" />
          <t-button theme="primary" variant="base" :disabled="countDown > 0" @click="sendCode">
            {{
              countDown == 0 ? $t('pages.signup.sendVerification') : $t('pages.signup.waitVerification', { countDown })
            }}
          </t-button>
        </t-form-item>
        <t-form-item class="pt-[20px]">
          <t-button type="submit">确认邮箱</t-button>
          <t-button theme="default" type="button" @click="redirectTo">取消</t-button>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { FormInstanceFunctions, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { oauth } from '@/api/auth';
import { commEmail } from '@/api/common';
import { updateUserEmail } from '@/api/user';
import { useCounter } from '@/hooks';
import { useUserStore } from '@/store';

const userStore = useUserStore();

const route = useRoute();
const router = useRouter();

const collectDialog = ref({
  visible: false,
  loading: true,
});

const [countDown, handleCounter] = useCounter();
const formRef = ref<FormInstanceFunctions>();
const formData = ref<{
  email?: string;
  code?: string;
}>({});

const handleCollectDialogClose = () => {
  collectDialog.value!.visible = false;
  collectDialog.value!.loading = false;
};

/**
 * 发送验证码
 */
const sendCode = () => {
  formRef.value.validate({ fields: ['email'] }).then(async (e: any) => {
    if (e === true) {
      // 发送 验证码
      try {
        await commEmail({ email: formData.value?.email, scene: 'email' });
        MessagePlugin.success('验证码已发送');
        handleCounter();
      } catch (err) {
        console.log(err);
        MessagePlugin.error(err.message);
      }
    }
  });
};

const onSubmitConfirm = async () => {
  // 表单验证
  formRef.value?.validate().then(async (e: any) => {
    // 表单校验通过
    if (e === true) {
      try {
        await updateUserEmail(formData.value);
        MessagePlugin.success('设置成功!');
        redirectTo();
      } catch (err) {
        MessagePlugin.error(err.message || '设置失败!');
      }
    }
  });
};

const loading = ref(true);

const getAuthForApp = async () => {
  try {
    // 授权成功有两种情况
    // 1.需要补充邮件 qq, wx 需要补充邮件
    // 2.不需要补充直接登录
    const authResult = await oauth(route.params?.app as string, route?.query);
    console.log('authResult', authResult);
    if (authResult) {
      userStore.oauthLogin(authResult);
      // 检查Email，如果不是就需要用户补充
      const regExpRule = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regExpRule.test(userStore?.userInfo?.email)) {
        MessagePlugin.success('授权成功');
        MessagePlugin.warning('请您添加邮件信息，以便信息及时推送');
        // 展示弹窗
        collectDialog.value!.visible = true;
      } else {
        MessagePlugin.success('登录成功');
        redirectTo();
      }
    }
  } catch (err) {
    MessagePlugin.error(`授权登录失败：${err.message}`);
    // 直接错误返回首页
    router.replace('/');
  }
};

const redirectTo = () => {
  const redirect = route.query.redirect as string;
  const redirectUrl = redirect ? decodeURIComponent(redirect) : '/overview';
  router.push(redirectUrl);
};

onMounted(async () => {
  if (route.params?.app) {
    getAuthForApp();
  }
});
</script>
<style lang="less" scoped>
.redirect {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
