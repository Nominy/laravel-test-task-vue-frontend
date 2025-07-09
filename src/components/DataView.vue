<template>
  <div class="data-view">
    <div class="page-header">
      <h1 v-if="!loading">{{ title }}</h1>
      <ShimmerLoader v-else width="300px" height="32px" variant="text" />
      <p v-if="!loading">{{ subtitle }}</p>
      <ShimmerLoader v-else width="500px" height="20px" variant="text" />
    </div>

    <slot name="info"></slot>

    <DataFilters :filters="filters" @update:filters="handleFiltersChange" />

    <div class="chart-wrapper" ref="chartWrapper">
      <div class="chart-content" ref="chartContent">
        <StandardizedChart :data="computedChartData" :type="chartType" :title="chartTitle" :x-label="chartXLabel"
          :y-label="chartYLabel" :color="chartColor" :loading="loading" :height="300" />
      </div>
    </div>

    <DataTable ref="dataTableRef" :data="filteredData" :columns="columns" :loading="loading" :pagination="pagination"
      @sort="handleSort" @page-change="handlePageChange">
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import DataFilters from './DataFilters.vue'
import StandardizedChart from './StandardizedChart.vue'
import DataTable from './DataTable.vue'
import ShimmerLoader from './ShimmerLoader.vue'
import type { ApiResponse } from '../types/api'

interface ChartDataPoint {
  label: string
  value: number
}

interface Column {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'number' | 'date' | 'currency'
}

interface Props {
  title: string
  subtitle: string
  chartType: 'bar' | 'line' | 'doughnut'
  chartTitle: string
  chartXLabel?: string
  chartYLabel?: string
  chartColor: string
  columns: Column[]
  chartData?: ChartDataPoint[]
  fetchDataFn: (params: Record<string, unknown>) => Promise<ApiResponse<Record<string, unknown>>>
  defaultFilters?: {
    dateFrom?: string
    dateTo?: string
    search?: string
    limit: number
  }
}

interface Emits {
  (e: 'sort', key: string, order: 'asc' | 'desc'): void
}

const props = withDefaults(defineProps<Props>(), {
  chartXLabel: '',
  chartYLabel: '',
  defaultFilters: () => ({
    dateFrom: undefined,
    dateTo: undefined,
    search: undefined,
    limit: 25
  })
})

const emit = defineEmits<Emits>()

const loading = ref(false)
const data = ref<Record<string, unknown>[]>([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 25,
  total: 0,
  from: 0,
  to: 0
})

const filters = ref({ ...props.defaultFilters })

// Sticky behavior refs
const chartWrapper = ref<HTMLElement | null>(null)
const chartContent = ref<HTMLElement | null>(null)
const dataTableRef = ref<InstanceType<typeof DataTable> | null>(null)
const isSticky = ref(false)
const originalDimensions = ref({
  width: 0,
  height: 0,
  left: 0,
  padding: '',
  margin: ''
})
const originalTableHeaderDimensions = ref({
  width: 0,
  height: 0,
  left: 0,
  padding: '',
  borderBottom: '',
  backgroundColor: '',
  fontSize: '',
  fontWeight: '',
  color: '',
  columnWidths: [] as number[]
})

let ticking = false

const captureOriginalDimensions = () => {
  if (!chartWrapper.value || !chartContent.value) return false

  // Capture chart dimensions
  const contentRect = chartContent.value.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(chartContent.value)
  const parentRect = chartWrapper.value.parentElement?.getBoundingClientRect()

  originalDimensions.value = {
    width: contentRect.width,
    height: contentRect.height,
    left: parentRect ? contentRect.left - parentRect.left + parentRect.left : contentRect.left,
    padding: computedStyle.padding,
    margin: computedStyle.margin
  }

  // Capture table header dimensions and column widths
  const tableHeader = dataTableRef.value?.tableHeader
  if (tableHeader && !loading.value) {
    // Let the DataTable component capture its own column widths
    dataTableRef.value?.captureColumnWidths()

    const tableHeaderRect = tableHeader.getBoundingClientRect()
    const headerComputedStyle = window.getComputedStyle(tableHeader)

    originalTableHeaderDimensions.value = {
      width: tableHeaderRect.width,
      height: tableHeaderRect.height,
      left: originalDimensions.value.left,
      padding: headerComputedStyle.padding,
      borderBottom: headerComputedStyle.borderBottom,
      backgroundColor: headerComputedStyle.backgroundColor,
      fontSize: headerComputedStyle.fontSize,
      fontWeight: headerComputedStyle.fontWeight,
      color: headerComputedStyle.color,
      columnWidths: [] // Not needed anymore, handled by DataTable
    }
    return true
  }
  return false
}

const applyStickyStyles = () => {
  if (!chartContent.value) return

  // Get actual header height dynamically
  const appHeader = document.querySelector('.app-header') as HTMLElement
  const headerHeight = appHeader ? appHeader.offsetHeight : 80
  const stickyThreshold = headerHeight

  // Make chart sticky
  chartContent.value.style.position = 'fixed'
  chartContent.value.style.top = `${stickyThreshold}px`
  chartContent.value.style.left = `${originalDimensions.value.left}px`
  chartContent.value.style.width = `${originalDimensions.value.width}px`
  chartContent.value.style.height = `${originalDimensions.value.height}px`
  chartContent.value.style.zIndex = '50'
  chartContent.value.style.boxSizing = 'border-box'
  chartContent.value.style.margin = '0'
  chartContent.value.style.padding = originalDimensions.value.padding

  // Create chart spacer
  if (chartWrapper.value) {
    chartWrapper.value.style.height = `${originalDimensions.value.height}px`
    chartWrapper.value.style.marginBottom = '2rem'
  }

  // Make table header sticky with exact original styling
  const tableHeader = dataTableRef.value?.tableHeader

  if (tableHeader && !loading.value && originalTableHeaderDimensions.value.height > 0) {
    const chartBottom = stickyThreshold + originalDimensions.value.height

    tableHeader.style.position = 'fixed'
    tableHeader.style.top = `${chartBottom}px`
    tableHeader.style.left = `${originalTableHeaderDimensions.value.left}px`
    tableHeader.style.width = `${originalTableHeaderDimensions.value.width}px`
    tableHeader.style.height = `${originalTableHeaderDimensions.value.height}px`
    tableHeader.style.zIndex = '49'
    tableHeader.style.boxSizing = 'border-box'

    // Apply exact original styling
    tableHeader.style.backgroundColor = originalTableHeaderDimensions.value.backgroundColor
    tableHeader.style.borderBottom = originalTableHeaderDimensions.value.borderBottom
    tableHeader.style.padding = originalTableHeaderDimensions.value.padding
    tableHeader.style.fontSize = originalTableHeaderDimensions.value.fontSize
    tableHeader.style.fontWeight = originalTableHeaderDimensions.value.fontWeight
    tableHeader.style.color = originalTableHeaderDimensions.value.color
    tableHeader.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'

    // Ensure table layout properties are inherited
    const table = tableHeader.closest('table') as HTMLElement
    if (table) {
      tableHeader.style.tableLayout = 'fixed'
      tableHeader.style.borderCollapse = 'collapse'
      table.setAttribute('data-fixed-layout', 'true')
    }

    // Apply column widths using DataTable's column width management
    dataTableRef.value?.applyColumnWidths()

    // Add table spacer
    const tableContainer = tableHeader.closest('.data-table') as HTMLElement | null
    if (tableContainer) {
      tableContainer.style.paddingTop = `${originalTableHeaderDimensions.value.height}px`
    }
  }
}

const removeStickyStyles = () => {
  if (!chartContent.value) return

  // Restore chart
  chartContent.value.style.position = ''
  chartContent.value.style.top = ''
  chartContent.value.style.left = ''
  chartContent.value.style.width = ''
  chartContent.value.style.height = ''
  chartContent.value.style.zIndex = ''
  chartContent.value.style.boxSizing = ''
  chartContent.value.style.margin = originalDimensions.value.margin
  chartContent.value.style.padding = ''

  // Remove chart spacer
  if (chartWrapper.value) {
    chartWrapper.value.style.height = ''
    chartWrapper.value.style.marginBottom = '2rem'
  }

  // Restore table header
  const tableHeader = dataTableRef.value?.tableHeader

  if (tableHeader) {
    tableHeader.style.position = ''
    tableHeader.style.top = ''
    tableHeader.style.left = ''
    tableHeader.style.width = ''
    tableHeader.style.height = ''
    tableHeader.style.zIndex = ''
    tableHeader.style.boxSizing = ''
    tableHeader.style.backgroundColor = ''
    tableHeader.style.borderBottom = ''
    tableHeader.style.padding = ''
    tableHeader.style.fontSize = ''
    tableHeader.style.fontWeight = ''
    tableHeader.style.color = ''
    tableHeader.style.boxShadow = ''
    tableHeader.style.tableLayout = ''
    tableHeader.style.borderCollapse = ''

    // Reset column widths using DataTable's reset method
    dataTableRef.value?.resetColumnWidths()

    // Remove table layout attribute
    const table = tableHeader.closest('table') as HTMLElement
    if (table) {
      table.removeAttribute('data-fixed-layout')
    }

    // Remove table spacer
    const tableContainer = tableHeader.closest('.data-table') as HTMLElement
    if (tableContainer) {
      tableContainer.style.paddingTop = ''
    }
  }
}

const updateStickyState = () => {
  if (!chartWrapper.value || !chartContent.value) return

  const wrapperRect = chartWrapper.value.getBoundingClientRect()
  // Get actual header height dynamically
  const appHeader = document.querySelector('.app-header') as HTMLElement
  const headerHeight = appHeader ? appHeader.offsetHeight : 80
  const stickyThreshold = headerHeight

  if (wrapperRect.top <= stickyThreshold && !isSticky.value) {
    if (captureOriginalDimensions()) {
      isSticky.value = true
      applyStickyStyles()
    }
  } else if (wrapperRect.top > stickyThreshold && isSticky.value) {
    isSticky.value = false
    removeStickyStyles()
  } else if (isSticky.value) {
    // Maintain sticky state and reapply styles (for navigation persistence)
    applyStickyStyles()
  }
}

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateStickyState()
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', updateStickyState, { passive: true })
  nextTick(() => {
    updateStickyState()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateStickyState)
})

const fetchData = async () => {
  loading.value = true
  try {
    // Add minimum loading time to show loading states
    const [response] = await Promise.all([
      props.fetchDataFn({
        page: pagination.value.current_page,
        limit: filters.value.limit,
        dateFrom: filters.value.dateFrom || undefined,
        dateTo: filters.value.dateTo || undefined,
        search: filters.value.search || undefined,
      }),
      new Promise(resolve => setTimeout(resolve, 300)) // Minimum 300ms to show loading
    ])

    data.value = response.data || []

    pagination.value = {
      current_page: response.meta.current_page || 1,
      last_page: response.meta.last_page || 1,
      per_page: typeof response.meta.per_page === 'string' ? parseInt(response.meta.per_page) : response.meta.per_page || 25,
      total: response.meta.total || 0,
      from: response.meta.from || 0,
      to: response.meta.to || 0
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
    data.value = []
  } finally {
    loading.value = false
    // Restore sticky state after loading completes
    await nextTick()
    updateStickyState()
  }
}

const handleFiltersChange = (newFilters: { dateFrom?: string; dateTo?: string; search?: string; limit: number }) => {
  filters.value = { ...newFilters }
  pagination.value.current_page = 1
  fetchData()
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  emit('sort', key, order)
}

const handlePageChange = async (page: number) => {
  // Store current scroll position
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop

  pagination.value.current_page = page
  await fetchData()

  // Restore scroll position after DOM update
  await nextTick()
  window.scrollTo(0, scrollPosition)

  // Ensure sticky state is maintained after pagination
  updateStickyState()
}

const filteredData = computed(() => {
  let result = [...data.value]

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(item => {
      return Object.values(item as Record<string, unknown>).some(value =>
        value?.toString().toLowerCase().includes(search)
      )
    })
  }

  return result
})

const computedChartData = computed(() => {
  // If chartData prop is provided, use it; otherwise return empty array for chart
  // The data for table comes from the internal data ref
  return props.chartData || []
})

watch(
  () => filters.value.limit,
  () => {
    pagination.value.current_page = 1
    fetchData()
  }
)

// Watch loading state to manage sticky behavior
watch(loading, async (newLoading) => {
  if (!newLoading) {
    // When loading completes, restore sticky state if needed
    await nextTick()
    updateStickyState()
  }
})

// Expose the internal data so parent components can access it for chart transformation
defineExpose({ data, filteredData, rawData: data })
</script>

<style scoped>
.data-view {
  padding: 1.5rem 0;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 2rem;
  min-height: 60px;
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  min-height: 2.5rem;
  line-height: 1.25;
}

.page-header p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  min-height: 1.5rem;
  line-height: 1.5;
}

.chart-wrapper {
  margin-bottom: 2rem;
  width: 100%;
  overflow: hidden;
}

.chart-content {
  background-color: #fff;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
  width: 100%;
  box-sizing: border-box;
}



/* Smooth transitions for all interactive elements */
.data-view * {
  box-sizing: border-box;
}

/* Responsive breakpoints */
@media (max-width: 1024px) {
  .data-view {
    padding: 1.25rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
    min-height: 2.25rem;
  }

  .page-header {
    margin-bottom: 1.75rem;
  }
}

@media (max-width: 768px) {
  .data-view {
    padding: 1rem;
  }

  .page-header {
    min-height: 50px;
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
    min-height: 2rem;
  }

  .page-header p {
    font-size: 0.9rem;
  }

  .chart-wrapper {
    margin-bottom: 1.5rem;
  }

  .chart-content {
    padding: 0.5rem 0;
  }


}

@media (max-width: 480px) {
  .data-view {
    padding: 0.75rem;
  }

  .page-header {
    min-height: 45px;
    margin-bottom: 1.25rem;
  }

  .page-header h1 {
    font-size: 1.25rem;
    min-height: 1.75rem;
    line-height: 1.2;
  }

  .page-header p {
    font-size: 0.85rem;
    min-height: 1.25rem;
  }

  .chart-wrapper {
    margin-bottom: 1.25rem;
  }

  .chart-content {
    padding: 0.25rem 0;
  }


}
</style>
