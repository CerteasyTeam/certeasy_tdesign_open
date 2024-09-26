<template>
  <t-drawer
    v-model:visible="visible"
    size="400"
    :header="title"
    :close-btn="false"
    :on-close="close"
    :on-confirm="submitConfig"
  >
    <div class="editor-config">
      <t-form ref="formRef" :data="formData" :rules="formRules" label-align="top" :label-width="100">
        <!-- providers -->
        <t-form-item name="providerId" :label-width="0">
          <t-radio-group
            v-model:value="formData.providerId"
            variant="primary-filled"
            :default-value="formData.providerId"
          >
            <t-radio-button v-for="item in providerList" :key="item.id" :disabled="!!formData!.id" :value="item.id">
              <span class="provider-col-style">
                <t-image lazy :style="{ width: '24px', height: '24px' }" :src="item.logo" :aly="item.name"></t-image>
                {{ item.name }}</span
              >
            </t-radio-button>
          </t-radio-group>
        </t-form-item>
        <t-form-item name="providerProductId" :label-width="0">
          <t-radio-group
            v-model:value="formData.providerProductId"
            variant="primary-filled"
            :default-value="formData.providerProductId"
          >
            <t-radio-button
              v-for="item in providerProductList"
              :key="item.id"
              :disabled="!!formData!.id"
              :value="item.id"
            >
              <span class="provider-col-style"> {{ item.name }}</span>
            </t-radio-button>
          </t-radio-group>
        </t-form-item>
        <template v-if="currentProvider && currentProduct && currentProduct.configJson">
          <t-form-item
            v-for="(item, idx) in currentProduct!.configJson!.fields"
            :key="idx"
            :label="item.name"
            :name="`accessJson.${item.field}`"
            :rules="[{ required: true, message: `${item.name}不能为空`, type: 'error' }]"
          >
            <t-select
              v-if="item.type === 'select'"
              v-model:value="formData!.accessJson[item.field]"
              :placeholder="`请选择 ${item.name}`"
            >
              <t-option v-for="(op, odx) in item.options" :key="odx" :value="op.value"> {{ op.label }}</t-option>
            </t-select>
            <t-input
              v-else
              v-model:value="formData!.accessJson[item.field]"
              :type="item.type.toLowerCase()"
              :placeholder="item.placeholder || `请输入 ${item.name}`"
            >
              <template #suffix>
                <t-button v-if="item.type === 'RANDOM'">点击生成</t-button>
              </template>
            </t-input>
          </t-form-item>
          <t-form-item>
            <div>
              <t-link theme="warning" hover="color" :href="currentProduct!.configJson!.helpUrl" target="_blank">
                <template #prefix-icon>
                  <t-icon name="help-circle" size="16"></t-icon>
                </template>
                <span style="margin-left: var(--td-comp-margin-xs)">点击查看相关操作文档</span>
              </t-link>
            </div>
          </t-form-item>
        </template>
      </t-form>
    </div>
  </t-drawer>
</template>
<script setup lang="ts">
import type { FormRule } from 'tdesign-vue-next';
import { FormInstanceFunctions, MessagePlugin } from 'tdesign-vue-next';
import { computed, Ref, ref, toRefs, watch } from 'vue';

import { addCloud, checkCloud, getProviderList, updateCloudInfo } from '@/api/cloud';

const props = defineProps({
  modelValue: Boolean,
  data: Object,
  title: String,
});

const emit = defineEmits(['update:modelValue', 'done']);

const { data } = toRefs(props);

console.log('data', data.value);

const visible = ref(props.modelValue);

const INIT_DATA: any = {
  id: 0,
  providerId: 0,
  providerProductId: 0,
  accessJson: {},
  certificateIds: [],
};

const formRef = ref<FormInstanceFunctions>();
const formData = ref<any>({ ...INIT_DATA });

const formRules: Record<string, FormRule[]> = {
  providerId: [{ required: true, message: '请选择服务商', type: 'error' }],
  providerProductId: [{ required: true, message: '请选择产品', type: 'error' }],
  accessJson: [{ required: false, message: '请填写配置数据', type: 'error' }],
};

// 初始化数据
const providerList = ref<Record<string, any>[]>([]);
const currentProvider = computed(() => {
  return providerList.value.find((pro) => pro.id === formData.value.providerId);
});

const providerProductList: Ref<any[]> = computed(() => {
  return currentProvider.value?.providers || [];
});
const currentProduct = computed(() => {
  return providerProductList.value.find((prod) => prod.id === formData.value.providerProductId);
});

const reloadData = async () => {
  const { records, total } = await getProviderList();
  providerList.value = records;
  // 默认选择
  if (total && !data.value) {
    formData.value!.providerId = providerList.value[0].id;
    formData.value!.providerProductId = currentProvider.value?.providers[0].id;
  }
  console.log('ormData.value', formData.value, providerList.value[0].id);
};

// 检查可用
const preCheckCloudInfo = async () => {
  try {
    const params = {
      providerId: formData.value!.providerId,
      providerProductId: formData.value!.providerProductId,
      accessJson: formData.value!.accessJson,
    };
    console.log('params', params);
    const { error: apiError, result } = await checkCloud(params);
    if (!result) {
      MessagePlugin.error(apiError);
      console.log('err', apiError);
    }
    return result;
  } catch (err) {
    MessagePlugin.error(`验证失败：${err.message}`);
    return false;
  }
};

// 提交更新
const submitConfig = async () => {
  formRef.value?.validate().then(async (e) => {
    // 信息校验
    const result = await preCheckCloudInfo();
    // 表单校验通过
    if (e === true && result) {
      console.log('ok', formData.value);
      const params = {
        providerId: formData.value!.providerId,
        providerProductId: formData.value!.providerProductId,
        accessJson: formData.value!.accessJson,
      };
      try {
        if (formData.value?.id) {
          await updateCloudInfo(formData.value.id, params);
        } else {
          await addCloud(params);
        }
        emit('done');
        MessagePlugin.success('操作成功');
      } catch (err) {
        MessagePlugin.error(`操作失败：${err.message}`);
      }
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
watch(
  () => props.data,
  async (value) => {
    console.log('data.value', value);
    // reloadData
    await reloadData();
    formData.value = { ...value };
  },
);

watch(
  () => [currentProduct.value, formData.value],
  ([value, form]) => {
    // 处理formData!.accessJson
    formData.value!.accessJson = value?.configJson?.fields.reduce((acc: any, cur: any) => {
      acc[cur.field] = form.accessJson[cur.field];
      return acc;
    }, {});
  },
);
</script>
<style lang="less" scoped>
.editor-config {
  &-title {
    margin-bottom: var(--td-comp-margin-s);
  }

  :deep(.t-row) {
    margin-bottom: var(--td-comp-margin-s);
  }

  .config-flex {
    display: flex;
    align-items: center;

    .text {
      margin: 0 var(--td-comp-margin-s);
    }
  }
}

.provider-col-style {
  display: flex;
  align-items: center;
  gap: 5px;

  :deep(.t-image__wrapper) {
    background: none;
  }
}
</style>
