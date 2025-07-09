<template>
  <div class="table-skeleton">
    <div class="data-table">
      <div class="table-wrapper">
        <!-- Desktop Table Skeleton -->
        <table class="desktop-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key">
                <ShimmerLoader width="80%" height="16px" variant="text" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in Array.from({ length: rows }, (_, i) => i)" :key="`skeleton-row-${row}`">
              <td v-for="(column, index) in columns" :key="column.key">
                <ShimmerLoader :width="getCellWidth(index)" height="16px" variant="table-cell" />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile Card Skeleton -->
        <div class="mobile-cards">
          <div v-for="row in Array.from({ length: rows }, (_, i) => i)" :key="`skeleton-card-${row}`"
            class="mobile-card skeleton-card">
            <div class="card-row" v-for="column in columns.slice(0, 4)" :key="column.key">
              <ShimmerLoader width="30%" height="14px" variant="text" />
              <ShimmerLoader width="60%" height="14px" variant="text" />
            </div>
          </div>
        </div>
      </div>

      <div class="pagination">
        <div class="pagination-info">
          <ShimmerLoader width="200px" height="16px" variant="text" />
        </div>
        <div class="pagination-controls">
          <ShimmerLoader width="60px" height="32px" border-radius="6px" />
          <div class="page-numbers">
            <ShimmerLoader v-for="i in 3" :key="i" width="32px" height="32px" border-radius="6px" />
          </div>
          <ShimmerLoader width="60px" height="32px" border-radius="6px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShimmerLoader from './ShimmerLoader.vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'number' | 'date' | 'currency'
}

interface Props {
  columns: Column[]
  rows?: number
}

withDefaults(defineProps<Props>(), {
  rows: 10,
})

const getCellWidth = (index: number) => {
  // Use percentage-based widths for responsive skeleton
  const widths = ['15%', '20%', '15%', '15%', '15%', '20%']
  return widths[index] || '10%'
}
</script>

<style scoped>
.table-skeleton {
  width: 100%;
}

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

/* Desktop Table Skeleton */
.desktop-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.desktop-table th,
.desktop-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  max-width: 200px;
}

.desktop-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  position: relative;
}

/* Mobile Card Skeleton */
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

/* Pagination Skeleton */
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
  flex: 1;
  min-width: 200px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
  margin: 0 0.5rem;
}

/* Responsive Breakpoints */
@media (max-width: 1024px) {

  .desktop-table th,
  .desktop-table td {
    padding: 0.5rem;
  }
}

@media (max-width: 768px) {

  /* Hide desktop table, show mobile cards */
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .pagination-info {
    order: 2;
    text-align: center;
    min-width: auto;
  }

  .pagination-controls {
    order: 1;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .mobile-card {
    padding: 0.75rem;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .pagination-controls {
    gap: 0.25rem;
  }

  .page-numbers {
    margin: 0 0.25rem;
  }
}
</style>
