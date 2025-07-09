<template>
  <DataView title="Orders" subtitle="Отслеживайте и управляйте заказами клиентов" chart-type="bar"
    chart-title="Стоимость заказов по клиентам" chart-x-label="Клиенты" chart-y-label="Общая сумма (₽)"
    chart-color="#8b5cf6" :columns="columns" :chart-data="chartData" :default-filters="defaultFilters"
    :fetch-data-fn="fetchOrders" @sort="handleSort">
    <template #cell-status="{ value }">
      <span :class="getStatusClass(String(value))">
        {{ value }}
      </span>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiService } from '../services/api'
import type { Order, ApiResponse } from '../types/api'
import DataView from '../components/DataView.vue'

const defaultFilters = {
  dateFrom: '2020-01-01',
  dateTo: '2030-12-31',
  search: undefined as string | undefined,
  limit: 25
}

const columns = [
  { key: 'odid', label: 'ID заказа', sortable: true, type: 'text' as const },
  { key: 'g_number', label: '№ заказа', sortable: true, type: 'text' as const },
  { key: 'subject', label: 'Продукт', sortable: true, type: 'text' as const },
  { key: 'total_price', label: 'Итого', sortable: true, type: 'currency' as const },
  { key: 'is_cancel', label: 'Статус', sortable: true, type: 'text' as const },
  { key: 'warehouse_name', label: 'Склад', sortable: true, type: 'text' as const },
  { key: 'date', label: 'Дата заказа', sortable: true, type: 'date' as const },
]

const ordersData = ref<Order[]>([])

const chartData = computed(() => {
  return ordersData.value
    .map(order => ({
      label: order.subject || `Заказ ${order.g_number}`,
      value: Number(order.total_price) || 0
    }))
})

const fetchOrders = async (params: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> => {
  const response = await ApiService.getOrders(params)
  // Update local ordersData for chart
  ordersData.value = response.data || []
  return response as unknown as ApiResponse<Record<string, unknown>>
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  ordersData.value.sort((a, b) => {
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

const getStatusClass = (status: string) => {
  const lowerStatus = status.toLowerCase()
  if (lowerStatus.includes('completed') || lowerStatus.includes('delivered')) {
    return 'status-completed'
  }
  if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
    return 'status-pending'
  }
  if (lowerStatus.includes('cancelled') || lowerStatus.includes('failed')) {
    return 'status-cancelled'
  }
  return 'status-default'
}
</script>

<style scoped>
/* .total {
  font-weight: 700;
  color: #1f2937;
  font-size: 1.1em;
} */

.status-completed {
  background: #d1fae5;
  color: #065f46;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-default {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
