import * as echarts from 'echarts/core';
import { onMounted, onUnmounted, Ref, ref, ShallowRef, shallowRef } from 'vue';

import { UseCopyOptions } from '@/types/hooks';

/**
 * eChart hook
 * @param domId
 */
export const useChart = (domId: string): ShallowRef<echarts.ECharts> => {
  let chartContainer: HTMLCanvasElement;
  const selfChart = shallowRef<echarts.ECharts | any>();
  const updateContainer = () => {
    selfChart.value.resize({
      width: chartContainer.clientWidth,
      height: chartContainer.clientHeight,
    });
  };

  onMounted(() => {
    if (!chartContainer) {
      chartContainer = document.getElementById(domId) as HTMLCanvasElement;
    }
    selfChart.value = echarts.init(chartContainer);
  });

  window.addEventListener('resize', updateContainer, false);

  onUnmounted(() => {
    window.removeEventListener('resize', updateContainer);
  });

  return selfChart;
};

/**
 * counter utils
 * @param duration
 * @returns
 */
export const useCounter = (duration = 60): [Ref<number>, () => void] => {
  let intervalTimer: ReturnType<typeof setInterval>;
  onUnmounted(() => {
    clearInterval(intervalTimer);
  });
  const countDown = ref(0);

  return [
    countDown,
    () => {
      countDown.value = duration;
      intervalTimer = setInterval(() => {
        if (countDown.value > 0) {
          countDown.value -= 1;
        } else {
          clearInterval(intervalTimer);
          countDown.value = 0;
        }
      }, 1000);
    },
  ];
};

/**
 * useCopy
 * @param options
 * @returns
 */
export const useCopy = (options: UseCopyOptions) => {
  const { successDuration = 2000, onError, onSuccess } = options;

  const isCopied = ref(false);
  const copyError = ref(null);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      isCopied.value = true;
      copyError.value = null;

      // 调用成功回调（如果存在）
      if (onSuccess) {
        onSuccess();
      }

      // 自动重置 `isCopied` 状态
      setTimeout(() => {
        isCopied.value = false;
      }, successDuration);
    } catch (error) {
      copyError.value = error;
      isCopied.value = false;

      // 调用错误回调（如果存在）
      if (onError) {
        onError(error);
      }
    }
  };

  return {
    isCopied,
    copyError,
    copyText,
  };
};
