<template>
  <div class="page-nav-wrapper">
    <t-card :shadow="false" :bordered="false" class="page-nav">
      <div class="page-nav-left">
        <slot name="icon"
          ><t-button v-if="showBack" class="back-btn" theme="primary" variant="text" @click="handleClickBackBtn">
            <template #icon>
              <t-icon name="arrow-left" />
            </template>
          </t-button>
        </slot>
        <slot name="title">
          <h1 class="page-nav-title">{{ showTitle }}</h1>
        </slot>
      </div>
      <div class=""></div>
    </t-card>
    <div class="nav-placeholder"></div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  title: String,
  showBack: Boolean,
});
const router = useRouter();
const showTitle = ref(props.title);
const handleClickBackBtn = () => {
  // 如果没设置返回路由
  router.back();
};

watch(
  () => props.title,
  (value) => {
    showTitle.value = value;
  },
);
</script>

<style lang="less" scoped>
.page-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0;
  z-index: 10;

  :deep(.t-card__body) {
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-xl);
  }
}

.page-nav-left {
  position: relative;
  display: inline-flex;
  align-items: center;

  .back-btn {
    margin-right: var(--td-comp-paddingLR-xs);
  }

  :deep(.t-button) {
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
  }
}

.page-nav-title {
  font: var(--td-font-title-large);
  line-height: 30px;
}

.nav-placeholder {
  height: calc(var(--td-comp-paddingTB-m) * 4);
}
</style>
