<template>
  <DataView title="Sales" subtitle="Следите за эффективностью и тенденциями продаж" chart-type="doughnut"
    chart-title="Распределение продаж по продуктам" chart-color="#f59e0b" :columns="columns" :chart-data="chartData"
    :default-filters="defaultFilters" :fetch-data-fn="fetchSales" @sort="handleSort">
    <!-- <template #cell-finished_price="{ value }">
      <span class="price">${{ Number(value).toFixed(2) }}</span>
    </template>
<template #cell-total_price="{ value }">
      <span class="total">${{ Number(value).toFixed(2) }}</span>
    </template> -->
  </DataView>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiService } from '../services/api'
import type { Sale, ApiResponse } from '../types/api'
import DataView from '../components/DataView.vue'

const salesData = ref<Sale[]>([])

const defaultFilters = {
  dateFrom: '2020-01-01',
  dateTo: '2030-12-31',
  search: undefined as string | undefined,
  limit: 25
}

const columns = [
  { key: 'sale_id', label: 'ID Sales', sortable: true, type: 'text' as const },
  { key: 'subject', label: 'Продукт', sortable: true, type: 'text' as const },
  { key: 'g_number', label: '№ заказа', sortable: true, type: 'text' as const },
  { key: 'finished_price', label: 'Цена', sortable: true, type: 'currency' as const },
  { key: 'total_price', label: 'Итого', sortable: true, type: 'currency' as const },
  { key: 'warehouse_name', label: 'Склад', sortable: true, type: 'text' as const },
  { key: 'date', label: 'Дата Sales', sortable: true, type: 'date' as const },
]

const chartData = computed(() => {
  return salesData.value
    .map(sale => ({
      label: sale.subject || `Продажа ${sale.sale_id}`,
      value: Number(sale.total_price) || 0
    }))
})

const fetchSales = async (params: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> => {
  const response = await ApiService.getSales(params)
  // Update local salesData for chart
  salesData.value = response.data || []
  return response as unknown as ApiResponse<Record<string, unknown>>
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  salesData.value.sort((a, b) => {
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
</script>

<style scoped>
/* .price {
  font-weight: 600;
  color: #059669;
}

.total {
  font-weight: 700;
  color: #1f2937;
  font-size: 1.1em;
} */
</style>
