<template>
  <div class="data-table">
    <div class="table-wrapper">
      <!-- Desktop Table View -->
      <table class="desktop-table">
        <thead ref="tableHeader">
          <tr>
            <th v-for="column in columns" :key="column.key" :class="{ sortable: column.sortable }"
              @click="column.sortable && handleSort(column.key)" :data-column="column.key">
              {{ column.label }}
              <span v-if="column.sortable && sortKey === column.key" class="sort-indicator">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="row in skeletonRows" :key="`skeleton-${row}`">
              <td v-for="(column, index) in columns" :key="column.key">
                <ShimmerLoader :width="getCellWidth(column, index)" height="16px" variant="table-cell" />
              </td>
            </tr>
          </template>
          <tr v-else-if="!data.length">
            <td :colspan="columns.length" class="no-data">Нет данных</td>
          </tr>
          <tr v-else v-for="item in data" :key="String(item.id)">
            <td v-for="column in columns" :key="column.key" :title="String(getNestedValue(item, column.key) || '')"
              :data-column="column.key">
              <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
                {{ formatValue(getNestedValue(item, column.key), column.type) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile Card View -->
      <div class="mobile-cards">
        <template v-if="loading">
          <div v-for="row in skeletonRows" :key="`skeleton-card-${row}`" class="mobile-card skeleton-card">
            <div class="card-row" v-for="column in columns.slice(0, 4)" :key="column.key">
              <span class="card-label">{{ column.label }}:</span>
              <ShimmerLoader width="60%" height="16px" variant="text" />
            </div>
          </div>
        </template>
        <div v-else-if="!data.length" class="no-data-card">
          <p>Нет данных</p>
        </div>
        <div v-else v-for="item in data" :key="`card-${String(item.id)}`" class="mobile-card">
          <div class="card-row" v-for="column in columns" :key="column.key"
            v-show="getNestedValue(item, column.key) !== null && getNestedValue(item, column.key) !== undefined">
            <span class="card-label">{{ column.label }}:</span>
            <span class="card-value">
              <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
                {{ formatValue(getNestedValue(item, column.key), column.type) }}
              </slot>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pagination || loading" class="pagination">
      <div v-if="loading" class="pagination-info">
        <ShimmerLoader width="200px" height="16px" variant="text" />
      </div>
      <div v-else class="pagination-info">
        Показано с {{ pagination?.from || 0 }} по {{ pagination?.to || 0 }} из {{ pagination?.total || 0 }} записей
      </div>
      <div v-if="loading" class="pagination-controls">
        <ShimmerLoader width="60px" height="32px" border-radius="6px" />
        <div class="page-numbers">
          <ShimmerLoader v-for="i in 3" :key="i" width="32px" height="32px" border-radius="6px" />
        </div>
        <ShimmerLoader width="60px" height="32px" border-radius="6px" />
      </div>
      <div v-else-if="pagination" class="pagination-controls">
        <button :disabled="pagination.current_page <= 1" @click="$emit('page-change', pagination.current_page - 1)">
          Предыдущая
        </button>

        <span class="page-numbers">
          <button v-for="page in visiblePages" :key="page" :class="{ active: page === pagination.current_page }"
            @click="$emit('page-change', page)">
            {{ page }}
          </button>
        </span>

        <button :disabled="pagination.current_page >= pagination.last_page"
          @click="$emit('page-change', pagination.current_page + 1)">
          Следующая
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { format } from 'date-fns'
import ShimmerLoader from './ShimmerLoader.vue'

// Column width management for consistent sizing
const columnWidths = ref<Map<string, number>>(new Map())

const getCellWidth = (column: Column, index: number) => {
  // For skeleton loading, use percentage-based widths
  const widths = ['15%', '20%', '15%', '15%', '15%', '20%']
  return widths[index] || '10%'
}

const captureColumnWidths = () => {
  if (!tableHeader.value || props.loading) return

  const headerCells = tableHeader.value.querySelectorAll('th')
  const newWidths = new Map<string, number>()

  headerCells.forEach((cell) => {
    const columnKey = cell.getAttribute('data-column')
    if (columnKey) {
      const rect = cell.getBoundingClientRect()
      newWidths.set(columnKey, rect.width)
    }
  })

  columnWidths.value = newWidths
}

const applyColumnWidths = () => {
  if (!tableHeader.value || columnWidths.value.size === 0) return

  const headerCells = tableHeader.value.querySelectorAll('th')
  const bodyCells = tableHeader.value.closest('table')?.querySelectorAll('tbody td')

  headerCells.forEach((cell) => {
    const columnKey = cell.getAttribute('data-column')
    if (columnKey && columnWidths.value.has(columnKey)) {
      const width = columnWidths.value.get(columnKey)!
      const cellElement = cell as HTMLElement
      cellElement.style.width = `${width}px`
      cellElement.style.minWidth = `${width}px`
      cellElement.style.maxWidth = `${width}px`
    }
  })

  bodyCells?.forEach((cell) => {
    const columnKey = cell.getAttribute('data-column')
    if (columnKey && columnWidths.value.has(columnKey)) {
      const width = columnWidths.value.get(columnKey)!
      const cellElement = cell as HTMLElement
      cellElement.style.width = `${width}px`
      cellElement.style.minWidth = `${width}px`
      cellElement.style.maxWidth = `${width}px`
    }
  })
}

const resetColumnWidths = () => {
  if (!tableHeader.value) return

  const allCells = tableHeader.value.closest('table')?.querySelectorAll('th, td')
  allCells?.forEach((cell) => {
    const cellElement = cell as HTMLElement
    cellElement.style.width = ''
    cellElement.style.minWidth = ''
    cellElement.style.maxWidth = ''
  })
}

interface Column {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'number' | 'date' | 'currency'
}

interface PaginationData {
  current_page: number
  last_page: number
  per_page: string | number
  total: number
  from?: number
  to?: number
}

interface Props {
  data: Record<string, unknown>[]
  columns: Column[]
  loading?: boolean
  pagination?: PaginationData
}

interface Emits {
  (e: 'sort', key: string, order: 'asc' | 'desc'): void
  (e: 'page-change', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Table header ref for sticky behavior
const tableHeader = ref<HTMLElement | null>(null)

// Skeleton loading configuration
const skeletonRows = computed(() => Array.from({ length: 10 }, (_, i) => i))

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', key, sortOrder.value)
}

const getNestedValue = (obj: Record<string, unknown>, path: string) => {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

const formatValue = (value: unknown, type?: string) => {
  if (value === null || value === undefined) return '-'

  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(Number(value))
    case 'number':
      return new Intl.NumberFormat('ru-RU').format(Number(value))
    case 'date':
      try {
        if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
          return format(new Date(value), 'MMM dd, yyyy')
        }
        return String(value)
      } catch {
        return String(value)
      }
    default:
      return String(value)
  }
}

const visiblePages = computed(() => {
  if (!props.pagination) return []

  const { current_page, last_page } = props.pagination
  const pages: number[] = []
  const maxVisible = 5

  let start = Math.max(1, current_page - Math.floor(maxVisible / 2))
  const end = Math.min(last_page, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

onMounted(() => {
  nextTick(() => {
    if (!props.loading) {
      captureColumnWidths()
    }
  })
})

// Expose methods for parent component sticky behavior
defineExpose({
  tableHeader,
  captureColumnWidths,
  applyColumnWidths,
  resetColumnWidths,
  columnWidths: columnWidths.value
})
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.table-wrapper {
  overflow-x: auto;
  min-height: 400px;
}

/* Desktop Table Styles */
.desktop-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.desktop-table th,
.desktop-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
}

.desktop-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  position: relative;
  white-space: nowrap;
}

.desktop-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.desktop-table th.sortable:hover {
  background: #f3f4f6;
}

.sort-indicator {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}

.desktop-table td {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Mobile Card Styles */
.mobile-cards {
  display: none;
  padding: 1rem;
  gap: 1rem;
}

.mobile-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.skeleton-card {
  min-height: 120px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  flex: 0 0 auto;
  margin-right: 1rem;
}

.card-value {
  color: #6b7280;
  font-size: 0.875rem;
  text-align: right;
  word-break: break-word;
}

.no-data,
.no-data-card {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.no-data-card p {
  margin: 0;
  font-size: 1rem;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  flex: 1;
  min-width: 200px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
}

.pagination-controls button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.pagination-controls button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-numbers button {
  min-width: 2rem;
  padding: 0.5rem;
  text-align: center;
}

.page-numbers button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-info {
    text-align: center;
    min-width: auto;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .page-numbers {
    justify-content: center;
    flex-wrap: wrap;
  }
}

/* Ensuring proper column widths are maintained */
.desktop-table[data-fixed-layout="true"] {
  table-layout: fixed;
}

.desktop-table th[data-column],
.desktop-table td[data-column] {
  box-sizing: border-box;
}
</style>
