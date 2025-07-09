<template>
  <div class="data-filters">
    <div class="filters-grid">
      <div class="filter-group">
        <label for="dateFrom">Дата с:</label>
        <input id="dateFrom" v-model="localFilters.dateFrom" type="date" @change="emitFilters" />
      </div>

      <div class="filter-group">
        <label for="dateTo">Дата по:</label>
        <input id="dateTo" v-model="localFilters.dateTo" type="date" @change="emitFilters" />
      </div>

      <div class="filter-group search-group">
        <label for="search">Поиск:</label>
        <input id="search" v-model="localFilters.search" type="text" placeholder="Поиск..."
          @input="debouncedEmitFilters" />
      </div>

      <div class="filter-group">
        <label for="limit">Элементов на странице:</label>
        <select id="limit" v-model="localFilters.limit" @change="emitFilters">
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>

    <div class="filter-actions">
      <button class="reset-btn" @click="resetFilters" type="button">
        <span class="reset-icon">↻</span>
        Сбросить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, onUnmounted } from 'vue'

interface FilterData {
  dateFrom?: string
  dateTo?: string
  search?: string
  limit: number
}

interface Props {
  filters?: Partial<FilterData>
}

interface Emits {
  (e: 'update:filters', filters: FilterData): void
}

const props = withDefaults(defineProps<Props>(), {
  filters: () => ({}),
})

const emit = defineEmits<Emits>()

const localFilters = reactive<FilterData>({
  dateFrom: props.filters.dateFrom || '',
  dateTo: props.filters.dateTo || '',
  search: props.filters.search || '',
  limit: props.filters.limit || 25,
})

// Debounce functionality for search
const debounceTimeout = ref<number | null>(null)

const emitFilters = () => {
  emit('update:filters', { ...localFilters })
}

const debouncedEmitFilters = () => {
  // Clear existing timeout
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  // Set new timeout for 500ms delay
  debounceTimeout.value = setTimeout(() => {
    emitFilters()
  }, 500)
}

const resetFilters = () => {
  // Clear any pending debounced search
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  localFilters.dateFrom = ''
  localFilters.dateTo = ''
  localFilters.search = ''
  localFilters.limit = 25
  emitFilters()
}

// Clean up timeout on component unmount
onUnmounted(() => {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }
})

watch(
  () => props.filters,
  (newFilters) => {
    Object.assign(localFilters, newFilters)
  },
  { deep: true },
)
</script>

<style scoped>
.data-filters {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.search-group {
  grid-column: span 2;
  min-width: 0;
  /* Prevents grid item from overflowing */
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  /* Prevents overflow */
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.filter-group input,
.filter-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.filter-group input::placeholder {
  color: #9ca3af;
}

.filter-actions {
  background: #f1f3f4;
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.reset-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.reset-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.reset-icon {
  font-size: 1rem;
  line-height: 1;
}

/* Responsive breakpoints */
@media (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
    padding: 1.25rem;
  }

  .search-group {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .search-group {
    grid-column: span 1;
  }

  .filter-actions {
    padding: 1rem;
    justify-content: center;
  }

  .reset-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .data-filters {
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .filters-grid {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .filter-group input,
  .filter-group select {
    padding: 0.625rem;
    font-size: 0.8rem;
  }

  .filter-group label {
    font-size: 0.8rem;
  }

  .filter-actions {
    padding: 0.75rem;
  }

  .reset-btn {
    padding: 0.625rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
