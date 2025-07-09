<template>
  <DataView ref="dataViewRef" title="Stocks" subtitle="Отслеживайте и анализируйте уровни запасов" chart-type="bar"
    chart-title="Общее количество товаров на складе по продуктам" chart-x-label="Продукты"
    chart-y-label="Общее количество" chart-color="#10b981" :columns="columns" :chart-data="chartData"
    :default-filters="defaultFilters" :fetch-data-fn="fetchStocks" @sort="handleSort">
    <template #info>
      <div class="stocks-info">
        <p class="date-info"> Отображение складов на сегодня: {{ today }}</p>
      </div>
    </template>
    <template #cell-quantity="{ value }">
      <span :class="getQuantityClass(Number(value))">
        {{ value }}
      </span>
    </template>
    <template #cell-quantity_full="{ value }">
      <span class="quantity-full">{{ value }}</span>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiService } from '../services/api'
import type { Stock, ApiResponse } from '../types/api'
import DataView from '../components/DataView.vue'

const today = new Date().toISOString().split('T')[0]
const dataViewRef = ref<InstanceType<typeof DataView> | null>(null)
const stocksData = ref<Stock[]>([])

const defaultFilters = {
  dateFrom: undefined as string | undefined,
  dateTo: undefined as string | undefined,
  search: undefined as string | undefined,
  limit: 25
}

const columns = [
  { key: 'nm_id', label: 'ID продукта', sortable: true, type: 'number' as const },
  { key: 'subject', label: 'Тема', sortable: true, type: 'text' as const },
  { key: 'quantity', label: 'Количество', sortable: true, type: 'number' as const },
  { key: 'quantity_full', label: 'Общее количество', sortable: true, type: 'number' as const },
  { key: 'warehouse_name', label: 'Склад', sortable: true, type: 'text' as const },
  { key: 'brand', label: 'Бренд', sortable: true, type: 'text' as const },
  { key: 'price', label: 'Цена', sortable: true, type: 'currency' as const },
  { key: 'date', label: 'Дата', sortable: true, type: 'date' as const },
]

const chartData = computed(() => {
  const chartItems = stocksData.value
    .map(stock => ({
      label: stock.subject || `Продукт ${stock.nm_id}`,
      value: (stock.quantity_full !== null && stock.quantity_full !== undefined)
        ? stock.quantity_full
        : (stock.quantity || 0)
    }))

  // If no items or all have zero quantities, show a placeholder to prevent infinite loading
  const hasData = chartItems.some(item => item.value > 0)
  if (!hasData) {
    return [{
      label: 'Нет данных о наличии на складе',
      value: 0
    }]
  }

  return chartItems
})

const fetchStocks = async (params: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> => {
  const response = await ApiService.getStocks(params)
  // Update local stocksData for chart
  stocksData.value = response.data || []
  return response as unknown as ApiResponse<Record<string, unknown>>
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  stocksData.value.sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[key] as string | number
    const bVal = (b as unknown as Record<string, unknown>)[key] as string | number

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal
    }

    return 0
  })
}

const getQuantityClass = (quantity: number) => {
  if (quantity === 0) return 'quantity-zero'
  if (quantity < 10) return 'quantity-low'
  if (quantity < 50) return 'quantity-medium'
  return 'quantity-high'
}
</script>

<style scoped>
.stocks-info {
  background: #e0f2fe;
  border: 1px solid #0284c7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.date-info {
  color: #0369a1;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.quantity-full {
  font-weight: 600;
  color: #3b82f6;
}

.quantity-available {
  font-weight: 600;
  color: #059669;
}

.quantity-zero {
  color: #dc2626;
  font-weight: 600;
}

.quantity-low {
  color: #f59e0b;
  font-weight: 600;
}

.quantity-medium {
  color: #3b82f6;
  font-weight: 600;
}

.quantity-high {
  color: #10b981;
  font-weight: 600;
}
</style>
