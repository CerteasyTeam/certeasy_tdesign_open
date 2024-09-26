<template>
  <t-drawer v-model:visible="visible" size="400" header="修改密码" :footer="null" :on-close="close" :close-btn="true">
    <t-form ref="formRef" :data="formData" label-align="top" :label-width="100" @submit="onSubmitConfirm">
      <t-form-item name="passwd" label="原密码" :rules="[{ required: true, message: `请输入原密码`, type: 'error' }]">
        <t-input v-model="formData.passwd" type="password" placeholder="请输入原密码" />
      </t-form-item>
      <t-form-item
        name="newPasswd"
        label="新密码"
        help="请输入至少6位密码,包含大小写字母和数字"
        :rules="[
          { required: true, message: `请输入新密码`, type: 'error' },
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
              return { result: false, message: '你的密码不符合规则，请重新检查输入噢！', type: 'warning' };
            },
          },
        ]"
      >
        <t-input v-model="formData.newPasswd" type="password" placeholder="请输入新密码" />
      </t-form-item>
      <t-form-item
        name="rePasswd"
        label="确认新密码"
        :rules="[
          { required: true, message: `请再次输入新密码`, type: 'error' },
          { validator: (value) => value === formData.newPasswd, message: '两次密码不一致' },
        ]"
      >
        <t-input v-model="formData.rePasswd" type="password" placeholder="请再次输入新密码" />
      </t-form-item>
      <t-form-item>
        <t-button type="submit">修改密码</t-button>
      </t-form-item>
    </t-form>
  </t-drawer>
</template>
<script lang="ts" setup>
import { FormInstanceFunctions, MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { updateUserPasswd } from '@/api/user';
import { PASSWD_REGE_RULE } from '@/config/global';
// 入参
const props = defineProps({
  modelValue: Boolean,
  data: Object,
  title: String,
});

const emit = defineEmits(['update:modelValue', 'done']);

const visible = ref(props.modelValue);

// 密码弹窗
const formRef = ref<FormInstanceFunctions>();
const formData = ref<{
  passwd?: string;
  newPasswd?: string;
  rePasswd?: string;
}>({});

const onSubmitConfirm = () => {
  // 表单验证
  formRef.value?.validate().then(async (e: any) => {
    // 表单校验通过
    if (e === true) {
      updateUserPasswd(formData.value)
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
