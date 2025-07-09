<template>
  <div class="shimmer-wrapper" :style="wrapperStyle">
    <div class="shimmer-content" :style="contentStyle" :class="contentClass"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  width?: string | number
  height?: string | number
  borderRadius?: string
  variant?: 'text' | 'rectangular' | 'circular' | 'chart' | 'table-row' | 'table-cell'
  lines?: number // For text variant
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '20px',
  borderRadius: '4px',
  variant: 'rectangular',
  lines: 1,
})

const wrapperStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const contentStyle = computed(() => {
  const style: Record<string, string> = {
    borderRadius: props.borderRadius,
  }

  if (props.variant === 'circular') {
    style.borderRadius = '50%'
  } else if (props.variant === 'text') {
    style.height = '1em'
    style.marginBottom = '0.5em'
  } else if (props.variant === 'chart') {
    style.height = '300px'
    style.borderRadius = '8px'
  } else if (props.variant === 'table-row') {
    style.height = '48px'
    style.marginBottom = '1px'
  } else if (props.variant === 'table-cell') {
    style.height = '20px'
    style.width = '100%'
  }

  return style
})

const contentClass = computed(() => ({
  'shimmer-multiple': props.variant === 'text' && props.lines > 1,
}))
</script>

<style scoped>
.shimmer-wrapper {
  position: relative;
  overflow: hidden;
}

.shimmer-content {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.shimmer-multiple {
  position: relative;
}

.shimmer-multiple::after {
  content: '';
  position: absolute;
  top: 1.5em;
  left: 0;
  right: 20%;
  height: 1em;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shimmer-content,
  .shimmer-multiple::after {
    animation: none;
    background: #f0f0f0;
  }
}
</style>
