<template>
  <t-drawer v-model:visible="visible" size="400" header="修改密码" :footer="null" :on-close="close" :close-btn="true">
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
      <t-form-item>
        <t-button type="submit">变更邮箱</t-button>
      </t-form-item>
    </t-form>
  </t-drawer>
</template>
<script lang="ts" setup>
import { FormInstanceFunctions, MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { commEmail } from '@/api/common';
import { updateUserEmail } from '@/api/user';
import { useCounter } from '@/hooks';
// 入参
const props = defineProps({
  modelValue: Boolean,
  data: Object,
  title: String,
});

const emit = defineEmits(['update:modelValue', 'done']);

const visible = ref(props.modelValue);

const [countDown, handleCounter] = useCounter();

// 弹窗
const formRef = ref<FormInstanceFunctions>();
const formData = ref<{
  email?: string;
  code?: string;
}>({});

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

const onSubmitConfirm = () => {
  // 表单验证
  formRef.value?.validate().then(async (e: any) => {
    // 表单校验通过
    if (e === true) {
      updateUserEmail(formData.value)
        .then(() => {
          MessagePlugin.success('变更成功!');
          emit('done');
        })
        .catch((err) => {
          MessagePlugin.error(err.message || '变更失败!');
        });
    }
  });
};

const close = () => {
  emit('update:modelValue', false);
};

// 监听 props.modelValue 的变化，更新 visible
watch(
  () => props.modelValue,
  async (value) => {
    console.log('modelValue.value', value);
    visible.value = value;
  },
);
</script>
