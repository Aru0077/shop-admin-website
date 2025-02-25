//src/components/common/BaseChart.vue
<template>
      <div ref="chartContainer" class="chart-container">
            <canvas ref="chartCanvas"></canvas>
      </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Chart from 'chart.js/auto';
import { ChartConfiguration, ChartType, ChartData, ChartOptions } from 'chart.js';

// 定义组件属性
interface Props {
      type: ChartType;
      data: ChartData;
      options?: ChartOptions;
      width?: number;
      height?: number;
      id?: string;
}

const props = withDefaults(defineProps<Props>(), {
      options: () => ({}),
      width: 400,
      height: 300,
      id: 'chart'
});

// 定义自定义事件
const emit = defineEmits<{
      (e: 'chartCreated', chart: Chart): void;
      (e: 'chartUpdated', chart: Chart): void;
      (e: 'chartDestroyed'): void;
}>();

// 定义DOM引用
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartContainer = ref<HTMLDivElement | null>(null);

// 图表实例
let chartInstance: Chart | null = null;

// 初始化图表
const initChart = () => {
      if (!chartCanvas.value) return;

      // 如果图表已经存在，先销毁
      if (chartInstance) {
            chartInstance.destroy();
      }

      // 创建图表配置
      const config: ChartConfiguration = {
            type: props.type,
            data: props.data,
            options: props.options
      };

      // 初始化图表
      chartInstance = new Chart(chartCanvas.value, config);

      // 发射图表创建事件
      emit('chartCreated', chartInstance);
};

// 更新图表数据和选项
const updateChart = () => {
      if (!chartInstance) return;

      chartInstance.data = props.data;
      Object.assign(chartInstance.options || {}, props.options);
      chartInstance.update();

      // 发射图表更新事件
      emit('chartUpdated', chartInstance);
};

// 设置容器大小
const setContainerSize = () => {
      if (chartContainer.value) {
            if (props.width) {
                  chartContainer.value.style.width = `${props.width}px`;
            }
            if (props.height) {
                  chartContainer.value.style.height = `${props.height}px`;
            }
      }
};

// 暴露公共方法
defineExpose({
      getChartInstance: () => chartInstance,
      updateChart,
      initChart
});

// 生命周期钩子
onMounted(() => {
      setContainerSize();
      initChart();
});

onBeforeUnmount(() => {
      if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
            emit('chartDestroyed');
      }
});

// 监听图表数据和选项变化
watch(
      () => props.data,
      () => {
            updateChart();
      },
      { deep: true }
);

watch(
      () => props.options,
      () => {
            updateChart();
      },
      { deep: true }
);

// 监听图表尺寸变化
watch([() => props.width, () => props.height], () => {
      setContainerSize();
      if (chartInstance) {
            chartInstance.resize();
      }
});
</script>

<style scoped>
.chart-container {
      position: relative;
      margin: auto;
}
</style>