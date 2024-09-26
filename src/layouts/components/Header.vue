<template>
  <div :class="layoutCls">
    <t-head-menu :class="menuCls" :theme="menuTheme" expand-type="popup" :value="active">
      <template #logo></template>
      <template v-if="layout !== 'side'" #default>
        <menu-content class="header-menu" :nav-data="menu" />
      </template>
      <template #operations>
        <div class="operations-container">
          <!-- 通知中心 -->
          <t-tooltip v-if="false" placement="bottom" :content="$t('layout.notice.title')">
            <t-badge :count="0" :offset="[4, 4]">
              <t-button theme="default" variant="text">
                <template #icon><t-icon name="system-messages" /></template>
                {{ $t('layout.notice.title') }}
              </t-button>
            </t-badge>
          </t-tooltip>
          <!-- 帮助文档 -->
          <t-tooltip placement="bottom" :content="$t('layout.header.help')">
            <t-button theme="default" variant="text" @click="navToHelper">
              <template #icon><t-icon name="help-circle" /></template>
              {{ $t('layout.header.help') }}
            </t-button>
          </t-tooltip>
          <!-- 联系客服 -->
          <contact />
          <!-- 金币充值 -->
          <t-tooltip placement="bottom" :content="$t('layout.header.exchange')">
            <t-button theme="default" variant="text" @click="() => (coinPodsVisible = true)">
              <template #icon><t-icon name="currency-exchange" /></template>
              {{ $t('layout.header.exchange') }}
            </t-button>
          </t-tooltip>
          <!-- 语言切换 -->
          <t-dropdown v-if="false" trigger="click">
            <t-button theme="default" shape="square" variant="text">
              <translate-icon />
            </t-button>
            <t-dropdown-menu>
              <t-dropdown-item
                v-for="(lang, index) in langList"
                :key="index"
                :value="lang.value"
                @click="(options) => changeLang(options.value as string)"
                >{{ lang.content }}</t-dropdown-item
              ></t-dropdown-menu
            >
          </t-dropdown>
          <!-- 用户操作 -->
          <t-dropdown :min-column-width="120" trigger="click">
            <template #dropdown>
              <t-dropdown-menu>
                <t-dropdown-item class="operations-dropdown-container-item" @click="handleDrawer('mail')">
                  <t-icon name="mail" />变更邮箱
                </t-dropdown-item>
                <t-dropdown-item class="operations-dropdown-container-item" @click="handleDrawer('passwd')">
                  <t-icon name="user-password" />修改密码
                </t-dropdown-item>
                <t-divider />
                <t-dropdown-item class="operations-dropdown-container-item" @click="handleLogout">
                  <poweroff-icon />{{ $t('layout.header.signOut') }}
                </t-dropdown-item>
              </t-dropdown-menu>
            </template>
            <t-button class="header-user-btn" theme="default" variant="text">
              <template #icon>
                <t-icon class="header-user-avatar" name="user-circle" size="18px" />
              </template>
              <div class="header-user-account">{{ user.userInfo.nickName }}</div>
              <template #suffix><chevron-down-icon /></template>
            </t-button>
          </t-dropdown>
        </div>
      </template>
    </t-head-menu>
    <!-- 充值 -->
    <coin-pods v-model="coinPodsVisible" />

    <!-- 邮箱弹窗 -->
    <update-email v-model="emailVisible" />

    <!-- 密码弹窗 -->
    <update-passwd v-model="passwdVisible" @done="handleLogout" />
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, PoweroffIcon, TranslateIcon } from 'tdesign-icons-vue-next';
import type { PropType } from 'vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import CoinPods from '@/components/coin-pods/index.vue';
import UpdateEmail from '@/components/update-email/index.vue';
import UpdatePasswd from '@/components/update-passwd/index.vue';
import { prefix } from '@/config/global';
import { langList } from '@/locales/index';
import { useLocale } from '@/locales/useLocale';
import { getActive } from '@/router';
import { useUserStore } from '@/store';
import type { MenuRoute, ModeType } from '@/types/interface';

import Contact from './Contact.vue';
import MenuContent from './MenuContent.vue';

const props = defineProps({
  theme: {
    type: String,
    default: 'light',
  },
  layout: {
    type: String,
    default: 'top',
  },
  showLogo: {
    type: Boolean,
    default: true,
  },
  menu: {
    type: Array as PropType<MenuRoute[]>,
    default: () => [],
  },
  isFixed: {
    type: Boolean,
    default: false,
  },
  isCompact: {
    type: Boolean,
    default: false,
  },
  maxLevel: {
    type: Number,
    default: 3,
  },
});

const router = useRouter();
const user = useUserStore();

const active = computed(() => getActive());

const layoutCls = computed(() => [`${prefix}-header-layout`]);

const menuCls = computed(() => {
  const { isFixed, layout, isCompact } = props;
  return [
    {
      [`${prefix}-header-menu`]: !isFixed,
      [`${prefix}-header-menu-fixed`]: isFixed,
      [`${prefix}-header-menu-fixed-side`]: layout === 'side' && isFixed,
      [`${prefix}-header-menu-fixed-side-compact`]: layout === 'side' && isFixed && isCompact,
    },
  ];
});
const menuTheme = computed(() => props.theme as ModeType);

// 切换语言
const { changeLocale } = useLocale();
const changeLang = (lang: string) => {
  changeLocale(lang);
};

const handleLogout = () => {
  router.push({
    path: '/signin',
    query: { redirect: encodeURIComponent(router.currentRoute.value.fullPath) },
  });
};

const coinPodsVisible = ref(false);
// 邮箱弹窗
const emailVisible = ref(false);
const passwdVisible = ref(false);
const handleDrawer = (type: string) => {
  if (type === 'passwd') {
    passwdVisible.value = true;
  } else {
    emailVisible.value = true;
  }
};

const navToHelper = () => {
  window.open('https://docs.certeasy.cn/guide/quick-start');
};
</script>
<style lang="less" scoped>
.@{starter-prefix}-header {
  &-menu-fixed {
    position: fixed;
    top: 0;
    z-index: 1001;

    :deep(.t-head-menu__inner) {
      padding-right: var(--td-comp-margin-xl);
    }

    &-side {
      left: 232px;
      right: 0;
      z-index: 10;
      width: auto;
      transition: all 0.3s;

      &-compact {
        left: 64px;
      }
    }
  }

  &-logo-container {
    cursor: pointer;
    display: inline-flex;
  }
}

.header-menu {
  flex: 1 1 1;
  display: inline-flex;

  :deep(.t-menu__item) {
    min-width: unset;
  }
}

.operations-container {
  display: flex;
  align-items: center;

  .t-popup__reference {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.t-button) {
    margin-left: var(--td-size-0);
    padding-left: var(--td-comp-margin-s);
    padding-right: var(--td-comp-margin-s);
  }
}

.header-operate-left {
  display: flex;
  align-items: normal;
  line-height: 0;
}

.header-logo-container {
  width: 184px;
  height: 26px;
  display: flex;
  margin-left: 24px;
  color: var(--td-text-color-primary);

  .t-logo {
    width: 100%;
    height: 100%;

    &:hover {
      cursor: pointer;
    }
  }

  &:hover {
    cursor: pointer;
  }
}

.header-user-account {
  display: inline-flex;
  align-items: center;
  color: var(--td-text-color-primary);
}

:deep(.t-head-menu__inner) {
  border-bottom: 1px solid var(--td-component-stroke);
}

.t-menu--light {
  .header-user-account {
    color: var(--td-text-color-primary);
  }
}

.t-menu--dark {
  .t-head-menu__inner {
    border-bottom: 1px solid var(--td-gray-color-10);
  }

  .header-user-account {
    color: rgb(255 255 255 / 55%);
  }
}

.operations-dropdown-container-item {
  width: 100%;
  display: flex;
  align-items: center;

  :deep(.t-dropdown__item-text) {
    display: flex;
    align-items: center;
  }

  .t-icon {
    font-size: var(--td-comp-size-xxxs);
    margin-right: var(--td-comp-margin-s);
  }

  :deep(.t-dropdown__item) {
    width: 100%;
    margin-bottom: 0;
  }

  &:last-child {
    :deep(.t-dropdown__item) {
      margin-bottom: 8px;
    }
  }
}
</style>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="less">
.operations-dropdown-container-item {
  .t-dropdown__item-text {
    display: flex;
    align-items: center;
  }
}
</style>
