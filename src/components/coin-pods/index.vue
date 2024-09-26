<template>
  <div>
    <t-drawer
      v-model:visible="visible"
      size="560"
      :header="title || '金币充值'"
      :footer="null"
      :close-btn="false"
      :on-close="close"
      :on-confirm="submitConfig"
    >
      <div class="coin-trading">
        <!-- 可用余额 -->
        <t-row>
          <t-col :span="8">
            <p>我的金币余额：{{ userCoins }}</p>
          </t-col>
          <t-col :span="4">
            <t-button variant="outline" @click="handleRulesVisible">
              <template #icon>
                <t-icon name="calculator-1" size="14" theme="default"></t-icon>
              </template>
              <span>金币消耗规则</span>
            </t-button>
            <coin-rules v-model="coinRulesVisible" />
          </t-col>
        </t-row>
        <t-divider></t-divider>
        <!-- 充值列表 -->
        <t-row>
          <div class="coin-pods-list">
            <div
              v-for="item in coinPods"
              :key="item.id"
              :class="[item.activated ? 'activated' : '']"
              class="coin-pods"
              @click="handleChoosePods(item)"
            >
              <div class="name">{{ item.name }}</div>
              <div class="price"><span>￥</span>{{ item.price }}</div>
              <div v-if="item.giftCoin > 0" class="gift">
                额外赠送：<span>{{ item.giftCoin }} 金币</span>
              </div>
            </div>
          </div>
        </t-row>
        <div class="submit-btn">
          <t-button :loading="submitloading" theme="primary" @click="submitConfig">确认充值</t-button>
        </div>
        <!-- 提示说明 -->
        <div class="help-tips">
          <h4>* 注意事项：</h4>
          <p>1RMB = 100金币</p>
          <p>目前仅支持支付宝支付</p>
          <p>支付过程中有任何问题请联系客服处理</p>
        </div>
      </div>
    </t-drawer>
    <!-- 二维码弹窗 -->
    <t-dialog
      v-model:visible="qrCodeDialog.visible"
      width="320"
      header="请扫码进行支付"
      dialog-class-name="qrcode-dialog"
      :close-on-overlay-click="false"
      :confirm-btn="{
        content: '已支付',
        theme: 'primary',
        loading: qrCodeDialog.loading,
      }"
      :on-confirm="onQrCodeConfirm"
      :on-close="onQrCodeClose"
    >
      <div class="qrcode-content">
        <t-image lazy :style="{ width: '260px', height: '260px' }" :src="qrCodeDialog.qrCode" alt="alipay"></t-image>
        <div class="qrcode-logo">
          <t-image
            :style="{ width: '40px', height: '40px' }"
            src="https://cdn.certeasy.cn/payment/alipay.png"
          ></t-image>
        </div>
      </div>
      <div class="qrcode-tips">请使用【支付宝】扫码进行支付</div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import QRCode from 'qrcode';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useGtag } from 'vue-gtag-next';

import { createCoinOrder, getCoinOrder, getCoinPods } from '@/api/coin';
import { meCoins } from '@/api/user';

import CoinRules from '../coin-rules/index.vue';

const { event } = useGtag();
const props = defineProps({
  modelValue: Boolean,
  data: Object,
  title: String,
});

const emit = defineEmits(['update:modelValue', 'done']);

const visible = ref(props.modelValue);
const coinPods = ref([]);
const userCoins = ref(0);

const reloadUserCoins = async () => {
  try {
    const { coins } = await meCoins();
    userCoins.value = coins;
  } catch (error) {
    MessagePlugin.error('获取充值配置失败');
  }
};

const reloadPods = async () => {
  try {
    const { records } = await getCoinPods();
    coinPods.value = records.map((pods: any, idx: number) => {
      return {
        ...pods,
        activated: idx === 0,
      };
    });
    console.log('res', coinPods.value);
  } catch (error) {
    MessagePlugin.error('获取充值配置失败');
  }
};

const podsId = computed(() => {
  return coinPods.value.find((pods: any) => pods.activated)?.id;
});

const handleChoosePods = (item: any) => {
  // 取消所有
  coinPods.value.forEach((pods: any) => {
    pods.activated = false;
  });
  // 选中当前
  item.activated = true;
  event('pods', item);
};

// 二维码弹窗
const qrCodeDialog = ref({
  visible: false,
  loading: false,
  orderId: 0,
  qrCode: null,
});

onMounted(async () => {
  // 测试
  // qrCodeDialog.value!.qrCode = await QRCode.toDataURL('https://qr.alipay.com/bax07804rv5iyzxdb3jx00b2', {
  //   errorCorrectionLevel: 'L',
  //   margin: 2,
  //   width: 280,
  // });
});

const onQrCodeConfirm = async () => {
  try {
    qrCodeDialog.value!.loading = true;
    // todo
    const { isPaid } = await getCoinOrder(qrCodeDialog.value?.orderId);
    if (isPaid) {
      MessagePlugin.success('充值成功');
      qrCodeDialog.value!.loading = false;
      reloadPods();
      reloadUserCoins();
      // chean
      qrCodeDialog.value!.orderId = null;
      qrCodeDialog.value!.qrCode = null;
      qrCodeDialog.value!.visible = false;
    } else {
      MessagePlugin.warning('您还未支付成功，请确认再试！');
      qrCodeDialog.value!.loading = false;
    }
  } catch (error) {
    MessagePlugin.error(`充值失败:${error.message}`);
    qrCodeDialog.value!.loading = false;
  }
};

const onQrCodeClose = () => {
  qrCodeDialog.value!.loading = false;
  qrCodeDialog.value!.visible = false;
};

// 提交
const submitloading = ref(false);
const submitConfig = async () => {
  try {
    submitloading.value = true;
    const { orderId, qrCode, redirectUrl } = await createCoinOrder({
      podId: podsId.value,
    });
    console.log('createCoinOrder: ', orderId, qrCode, redirectUrl);
    submitloading.value = false;
    if (qrCode) {
      event('qrCode', { orderId, qrCode });
      qrCodeDialog.value!.orderId = orderId;
      qrCodeDialog.value!.qrCode = await QRCode.toDataURL(qrCode, { errorCorrectionLevel: 'H', margin: 2, width: 260 });
      // 弹出二维码
      qrCodeDialog.value!.visible = true;
    } else {
      // 打开充值
      window.open(redirectUrl);
      const dialog = DialogPlugin.confirm({
        theme: 'info',
        header: '金币充值',
        closeBtn: false,
        closeOnEscKeydown: false,
        closeOnOverlayClick: false,
        body: `已打开支付窗口页面，如您充值成功请点击下方已充值！`,
        onConfirm: async () => {
          try {
            // todo
            const { isPaid } = await getCoinOrder(orderId);
            if (isPaid) {
              MessagePlugin.success('充值成功');
              reloadPods();
              reloadUserCoins();
              dialog.destroy();
            } else {
              MessagePlugin.warning('您还未支付成功，请确认再试！');
            }
          } catch (error) {
            MessagePlugin.error(`充值失败:${error.message}`);
            qrCodeDialog.value!.loading = false;
          }
        },
        onClose: () => {
          return dialog.destroy();
        },
      });
    }
  } catch (err) {
    console.log('err', err);
  }
};

const close = () => {
  coinRulesVisible.value = false;
  emit('update:modelValue', false);
};

const coinRulesVisible = ref(false);
const handleRulesVisible = () => {
  coinRulesVisible.value = true;
};

// 监听 props.modelValue 的变化，更新 visible
watch(
  () => props.modelValue,
  async (value: boolean) => {
    console.log('modelValue.value', value);
    // 显示的时候再重载
    if (value) {
      await reloadPods();
      await reloadUserCoins();
    }
    visible.value = value;
    // reset loading
    submitloading.value = false;
  },
);
</script>
<style lang="less" scoped>
.coin-pods-list {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--td-comp-margin-s);

  .coin-pods {
    position: relative;
    padding: var(--td-comp-margin-s);
    border: 1px solid var(--td-border-level-2-color);
    width: calc(540px / 3 - var(--td-comp-margin-l));
    min-height: 116px;
    cursor: pointer;

    &.activated {
      border: 1px solid var(--td-brand-color);

      &::after {
        content: '';
        position: absolute;
        bottom: calc(0px - var(--td-comp-margin-m) / 2);
        right: calc(0px - var(--td-comp-margin-m) / 2);
        border-radius: var(--td-comp-margin-m);
        width: var(--td-comp-margin-m);
        height: var(--td-comp-margin-m);
        background: var(--td-brand-color);
      }
    }

    .name {
      font: var(--td-font-title-medium);
    }

    .price {
      font-size: var(--td-font-size-headline-medium);
      font-weight: 500;
      color: var(--td-brand-color);
      padding: var(--td-comp-paddingTB-m) 0;

      span {
        font-size: var(--td-font-size-link-small);
        margin-right: var(--td-comp-margin-xs);
      }
    }

    .gift {
      font-size: 12px;
      font-weight: 300;

      span {
        color: var(--td-brand-color);
        font-weight: 500;
      }
    }
  }
}

.help-tips {
  color: var(--td-warning-color);

  h4 {
    margin-bottom: var(--td-comp-paddingTB-xs);
    font-size: var(--td-font-size-title-large);
  }

  p {
    margin-left: var(--td-comp-margin-l);
    font-size: var(--td-font-size-body-medium);
    line-height: var(--td-line-height-title-medium);

    &::before {
      content: '·';
      width: 6px;
      height: 6px;
      color: var(--td-warning-color);
      margin-right: var(--td-comp-margin-xs);
    }
  }
}

.submit-btn {
  margin: var(--td-comp-paddingTB-xl) 0;
}

.qrcode-dialog {
  position: relative;

  .qrcode-content {
    position: relative;

    .qrcode-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9;
      background: #fff;
      padding: 5px;
      border-radius: 5px;
    }
  }

  .qrcode-tips {
    text-align: center;
    color: var(--td-gray-color-8);
    font-size: var(--td-font-size-title-medium);
  }
}
</style>
