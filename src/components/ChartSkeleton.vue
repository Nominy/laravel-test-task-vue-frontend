<template>
  <div class="chart-skeleton">
    <div class="chart-container">
      <div v-if="title" class="chart-title-skeleton">
        <ShimmerLoader width="200px" height="18px" variant="text" />
      </div>
      <div class="chart-content-skeleton">
        <ShimmerLoader width="100%" height="300px" variant="chart" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShimmerLoader from './ShimmerLoader.vue'

interface Props {
  title?: boolean
}

withDefaults(defineProps<Props>(), {
  title: true,
})
</script>

<style scoped>
.chart-skeleton {
  width: 100%;
}

.chart-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-title-skeleton {
  margin-bottom: 1rem;
}

.chart-content-skeleton {
  position: relative;
  height: 300px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-container {
    padding: 1rem;
  }

  .chart-content-skeleton {
    height: 250px;
  }
}
</style>
