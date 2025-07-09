<template>
  <div class="standardized-chart">
    <div class="chart-container">
      <div v-if="title" class="chart-header">
        <h3 class="chart-title">{{ title }}</h3>
      </div>
      <div class="chart-body" :style="{ height: responsiveHeight + 'px' }">
        <div v-if="loading" class="chart-loading">
          <ShimmerLoader width="100%" :height="responsiveHeight" variant="chart" />
        </div>
        <div v-else-if="isEmpty" class="chart-empty">
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <p class="empty-text">Нет данных</p>
            <p class="empty-subtext">Данные появятся здесь, когда будут доступны</p>
          </div>
        </div>
        <div v-else class="chart-content">
          <component :is="chartComponent" :data="processedChartData" :options="responsiveOptions"
            :style="{ height: responsiveHeight + 'px' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import ShimmerLoader from './ShimmerLoader.vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface ChartDataPoint {
  label: string
  value: number
}

interface Props {
  data: ChartDataPoint[]
  type?: 'bar' | 'line' | 'doughnut'
  title?: string
  xLabel?: string
  yLabel?: string
  color?: string
  loading?: boolean
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'bar',
  color: '#3b82f6',
  loading: false,
  height: 300,
})

// Responsive height calculation
const screenWidth = ref(window.innerWidth)

const responsiveHeight = computed(() => {
  // Base height on screen size and chart type
  if (screenWidth.value <= 480) {
    return props.type === 'doughnut' ? 200 : 220
  } else if (screenWidth.value <= 768) {
    return props.type === 'doughnut' ? 250 : 280
  } else if (screenWidth.value <= 1024) {
    return props.type === 'doughnut' ? 300 : 320
  } else {
    return Math.max(props.height, 300)
  }
})

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})

const isEmpty = computed(
  () =>
    !props.loading &&
    (!props.data || props.data.length === 0 || props.data.every((item) => item.value === 0)),
)

const chartComponent = computed(() => {
  switch (props.type) {
    case 'line':
      return Line
    case 'doughnut':
      return Doughnut
    default:
      return Bar
  }
})

const processedChartData = computed(() => {
  // Always return data structure to maintain consistent chart dimensions
  const labels = props.data.length > 0 ? props.data.map((item) => item.label) : ['Нет данных']
  const values = props.data.length > 0 ? props.data.map((item) => item.value) : [0]

  if (props.type === 'doughnut') {
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor:
            props.data.length > 0
              ? [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
                '#06b6d4',
                '#84cc16',
                '#f97316',
              ]
              : ['#f3f4f6'],
          borderWidth: props.data.length > 0 ? 2 : 0,
          borderColor: props.data.length > 0 ? '#ffffff' : 'transparent',
        },
      ],
    }
  }

  return {
    labels,
    datasets: [
      {
        label: props.yLabel || 'Значение',
        data: values,
        backgroundColor: props.data.length > 0 ? props.color + '80' : '#f3f4f6',
        borderColor: props.data.length > 0 ? props.color : '#d1d5db',
        borderWidth: 2,
        fill: props.type === 'line' ? false : true,
        tension: props.type === 'line' ? 0.4 : 0,
        pointRadius: props.type === 'line' ? (props.data.length > 0 ? 4 : 0) : undefined,
        pointHoverRadius: props.type === 'line' ? (props.data.length > 0 ? 6 : 0) : undefined,
      },
    ],
  }
})

const responsiveOptions = computed(() => {
  const isMobile = screenWidth.value <= 768
  const isSmallMobile = screenWidth.value <= 480

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: props.loading ? 0 : (isMobile ? 500 : 750),
    },
    plugins: {
      legend: {
        display: props.type === 'doughnut' && props.data.length > 0,
        position: 'bottom' as const,
        labels: {
          padding: isMobile ? 10 : 20,
          usePointStyle: true,
          font: {
            size: isSmallMobile ? 10 : (isMobile ? 11 : 12)
          }
        }
      },
      tooltip: {
        enabled: props.data.length > 0,
        mode: 'index' as const,
        intersect: false,
        titleFont: {
          size: isSmallMobile ? 11 : 12
        },
        bodyFont: {
          size: isSmallMobile ? 10 : 11
        }
      },
    },
  }

  if (props.type === 'doughnut') {
    return {
      ...baseOptions,
      cutout: isMobile ? '50%' : '60%',
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins.legend,
          labels: {
            ...baseOptions.plugins.legend.labels,
            padding: isMobile ? 10 : 20,
            usePointStyle: true,
            font: {
              size: isSmallMobile ? 10 : (isMobile ? 11 : 12)
            }
          },
        },
      },
    }
  }

  return {
    ...baseOptions,
    scales: {
      x: {
        display: true,
        title: {
          display: !!props.xLabel && props.data.length > 0 && !isSmallMobile,
          text: props.xLabel,
          font: {
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          display: false,
        },
        ticks: {
          display: props.data.length > 0,
          font: {
            size: isSmallMobile ? 9 : (isMobile ? 10 : 11)
          },
          maxRotation: isMobile ? 45 : 0,
          maxTicksLimit: isSmallMobile ? 5 : (isMobile ? 8 : undefined)
        },
      },
      y: {
        display: true,
        title: {
          display: !!props.yLabel && props.data.length > 0 && !isSmallMobile,
          text: props.yLabel,
          font: {
            size: isMobile ? 10 : 12
          }
        },
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          lineWidth: isMobile ? 0.5 : 1
        },
        ticks: {
          display: props.data.length > 0,
          font: {
            size: isSmallMobile ? 9 : (isMobile ? 10 : 11)
          },
          maxTicksLimit: isMobile ? 5 : 8
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  }
})
</script>

<style scoped>
.standardized-chart {
  width: 100%;
  max-width: 100%;
}

.chart-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.chart-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.chart-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.chart-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
}

.chart-body {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.chart-loading,
.chart-empty,
.chart-content {
  width: 100%;
  height: 100%;
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  color: #64748b;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #475569;
}

.empty-subtext {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.8;
}

.chart-content {
  overflow: hidden;
  border-radius: 4px;
}

/* Responsive breakpoints */
@media (max-width: 1024px) {
  .chart-container {
    padding: 1.25rem;
  }

  .chart-title {
    font-size: 1.125rem;
  }

  .chart-header {
    margin-bottom: 1.25rem;
  }
}

@media (max-width: 768px) {
  .chart-container {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .chart-title {
    font-size: 1rem;
  }

  .chart-header {
    margin-bottom: 1rem;
  }

  .empty-icon {
    font-size: 2rem;
  }

  .empty-text {
    font-size: 1rem;
  }

  .empty-subtext {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .chart-container {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .chart-title {
    font-size: 0.95rem;
    line-height: 1.3;
  }

  .chart-header {
    margin-bottom: 0.75rem;
  }

  .empty-icon {
    font-size: 1.75rem;
  }

  .empty-text {
    font-size: 0.9rem;
  }

  .empty-subtext {
    font-size: 0.75rem;
  }
}

/* Ensure charts are always contained within their parents */
.chart-content canvas {
  max-width: 100% !important;
  height: auto !important;
}
</style>
