<template>
  <div class="edit-label" @mouseenter="handleMouseAction('enter')" @mouseleave="handleMouseAction('leave')">
    <t-tooltip :content="value" theme="default" placement="bottom-left">
      <span>{{ value }}</span>
    </t-tooltip>
    <t-popup
      trigger="click"
      placement="bottom-left"
      :visible="editing"
      :show-arrow="false"
      :overlay-class="['popup-class']"
      :overlay-style="{ width: '320px' }"
      :overlay-click="handleCloseEdit"
    >
      <template #triggerElement>
        <t-icon
          v-show="showIcon"
          :name="useCopy ? 'copy' : 'edit-2'"
          class="icon ml-[3px]"
          @click="handleClickEdit"
        ></t-icon>
      </template>
      <template #content>
        <div class="" style="padding: var(--td-comp-margin-xs)">
          <h3>{{ title }}:</h3>
          <t-row style="margin-top: var(--td-comp-margin-m)">
            <t-input
              ref="inputRef"
              v-model="editingValue"
              placeholder=""
              :min-length="minLength"
              :max-length="maxLength"
              style="width: 100%"
            />
          </t-row>
          <t-row style="margin-top: var(--td-comp-margin-xs)">
            <span style="color: var(--td-text-color-placeholder)">长度限制为{{ minLength }}-{{ maxLength }}个字符</span>
          </t-row>
          <t-row style="margin-top: var(--td-comp-margin-m)">
            <t-button theme="primary" @click="handleConfirm">确认</t-button>
            <t-button theme="default" @click="handleCloseEdit">取消</t-button>
          </t-row>
        </div>
      </template>
    </t-popup>
  </div>
</template>
<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';

const props = defineProps({
  title: String,
  minLength: Number,
  maxLength: Number,
  value: String,
  showIcon: Boolean,
  useCopy: Boolean,
  onDispatch: Function,
  onUpdate: Function,
});

const { title, minLength, maxLength, useCopy, onDispatch } = toRefs(props);

const editing = ref(false);
const editingValue = ref(props.value);
const showIcon = ref(props.showIcon);

const inputRef = ref();

const handleMouseAction = (action: 'enter' | 'leave') => {
  if (editing.value) return;
  showIcon.value = action === 'enter';
};

const handleClickEdit = () => {
  editing.value = true;

  setTimeout(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

const handleCloseEdit = () => {
  editing.value = false;
  editingValue.value = props.value;
  showIcon.value = props.showIcon;
};

const handleConfirm = () => {
  // 相同不更改
  if (editingValue.value === props.value) {
    handleCloseEdit();
    return;
  }
  if (onDispatch.value) {
    onDispatch.value(editingValue.value);
  }
  editing.value = false;
};

// 监听 props.modelValue 的变化，更新 visible
watch(
  () => props.value,
  (value) => {
    editingValue.value = value;
  },
);
</script>
