<template>
  <div class="kpi-item" :class="{ center: center }">
    <div class="kpi-value-wrapper">
      <span class="kpi-value" :style="{ color: color }">{{ displayValue }}</span>
      <span class="kpi-unit" v-if="unit">{{ unit }}</span>
    </div>
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-trend" v-if="trend !== null">
      <span :class="trend >= 0 ? 'up' : 'down'">
        {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [Number, String],
    default: 0
  },
  label: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#ff3b30'
  },
  trend: {
    type: Number,
    default: null
  },
  center: {
    type: Boolean,
    default: false
  }
})

const displayValue = computed(() => {
  const num = Number(props.value)
  if (isNaN(num)) return props.value
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toLocaleString()
})
</script>

<style lang="scss" scoped>
.kpi-item {
  text-align: center;
  padding: 20px;

  &.center {
    padding: 40px 20px;

    .kpi-value {
      font-size: 56px;
    }

    .kpi-label {
      font-size: 18px;
    }
  }
}

.kpi-value-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  font-family: 'DIN', 'Arial', sans-serif;
  letter-spacing: -1px;
  line-height: 1;
}

.kpi-unit {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.kpi-label {
  font-size: 14px;
  color: #333;
  margin-top: 8px;
  letter-spacing: 1px;
}

.kpi-trend {
  margin-top: 6px;
  font-size: 12px;

  .up {
    color: #34c759;
  }

  .down {
    color: #ff3b30;
  }
}
</style>