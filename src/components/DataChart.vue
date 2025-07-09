<template>
  <div class="chart-container">
    <h3 v-if="title" class="chart-title">{{ title }}</h3>
    <div class="chart-wrapper">
      <component :is="chartComponent" v-if="chartData && chartOptions && !loading" :data="chartData"
        :options="chartOptions" />
      <div v-else class="chart-loading">
        <ShimmerLoader width="100%" height="100%" variant="chart" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
}

const props = withDefaults(defineProps<Props>(), {
  type: 'bar',
  color: '#3b82f6',
  loading: false,
})

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

const chartData = computed(() => {
  if (!props.data.length) {
    // Return empty data structure to maintain chart dimensions
    const emptyLabels = ['Нет данных']
    const emptyValues = [0]

    if (props.type === 'doughnut') {
      return {
        labels: emptyLabels,
        datasets: [
          {
            data: emptyValues,
            backgroundColor: ['#f3f4f6'],
            borderWidth: 0,
          },
        ],
      }
    }

    return {
      labels: emptyLabels,
      datasets: [
        {
          label: 'Нет данных',
          data: emptyValues,
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
          borderWidth: 1,
          fill: props.type === 'line' ? false : true,
          tension: props.type === 'line' ? 0.4 : 0,
        },
      ],
    }
  }

  const labels = props.data.map((item) => item.label)
  const values = props.data.map((item) => item.value)

  if (props.type === 'doughnut') {
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
            '#84cc16',
            '#f97316',
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
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
        backgroundColor: props.color + '80',
        borderColor: props.color,
        borderWidth: 2,
        fill: props.type === 'line' ? false : true,
        tension: props.type === 'line' ? 0.4 : 0,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: props.type === 'doughnut',
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
  }

  if (props.type === 'doughnut') {
    return baseOptions
  }

  return {
    ...baseOptions,
    scales: {
      x: {
        display: true,
        title: {
          display: !!props.xLabel,
          text: props.xLabel,
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: !!props.yLabel,
          text: props.yLabel,
        },
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
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
.chart-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}

.chart-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .chart-container {
    padding: 1rem;
  }

  .chart-wrapper {
    height: 250px;
  }
}
</style>
