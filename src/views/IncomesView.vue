<template>
  <DataView title="Incomes" subtitle="Отслеживайте и анализируйте свои потоки доходов" chart-type="line"
    chart-title="Количество поступлений по артикулам" chart-x-label="Артикулы" chart-y-label="Количество"
    chart-color="#3b82f6" :columns="columns" :chart-data="chartData" :default-filters="defaultFilters"
    :fetch-data-fn="fetchIncomes" @sort="handleSort">
  </DataView>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiService } from '../services/api'
import type { Income, ApiResponse } from '../types/api'
import DataView from '../components/DataView.vue'

const defaultFilters = {
  dateFrom: '2020-01-01',
  dateTo: '2030-12-31',
  search: undefined as string | undefined,
  limit: 25
}

const columns = [
  { key: 'income_id', label: 'ID дохода', sortable: true, type: 'number' as const },
  { key: 'supplier_article', label: 'Артикул', sortable: true, type: 'text' as const },
  { key: 'total_price', label: 'Сумма', sortable: true, type: 'currency' as const },
  { key: 'quantity', label: 'Количество', sortable: true, type: 'number' as const },
  { key: 'warehouse_name', label: 'Склад', sortable: true, type: 'text' as const },
  { key: 'date', label: 'Дата', sortable: true, type: 'date' as const },
  { key: 'date_close', label: 'Закрыто', sortable: true, type: 'date' as const },
]

const incomesData = ref<Income[]>([])

const chartData = computed(() => {
  return incomesData.value
    .map(income => ({
      label: income.supplier_article || `Доход ${income.income_id}`,
      value: Number(income.quantity) || 0
    }))
})

const fetchIncomes = async (params: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> => {
  const response = await ApiService.getIncomes(params)
  // Update local incomesData for chart
  incomesData.value = response.data || []
  return response as unknown as ApiResponse<Record<string, unknown>>
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  incomesData.value.sort((a, b) => {
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

<style scoped></style>
