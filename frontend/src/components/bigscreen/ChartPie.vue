<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  type: {
    type: String,
    default: 'pie'
  },
  data: {
    type: Array,
    default: () => []
  },
  colors: {
    type: Array,
    default: () => ['#ff3b30', '#ff9500', '#34c759', '#5ac8fa', '#ffcc00', '#8e8e93']
  },
  showLegend: {
    type: Boolean,
    default: true
  }
})

const chartRef = ref(null)
let chart = null

const govTheme = {
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'Microsoft YaHei',
    color: '#333'
  }
}

const getOption = () => {
  const baseOption = {
    ...govTheme,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(255, 59, 48, 0.2)',
      borderWidth: 1,
      textStyle: { color: '#333' },
      confine: true
    }
  }

  if (props.type === 'pie') {
    return {
      ...baseOption,
      legend: props.showLegend ? {
        orient: 'horizontal',
        bottom: '5%',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: '#666', fontSize: 12 }
      } : undefined,
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        data: props.data.map((d, i) => ({
          name: d.name,
          value: d.value,
          itemStyle: {
            color: props.colors[i % props.colors.length]
          }
        }))
      }]
    }
  }

  if (props.type === 'bar') {
    return {
      ...baseOption,
      grid: {
        left: '3%',
        right: '4%',
        top: '10%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: props.data.map(d => d.name),
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisLabel: { color: '#666', fontSize: 12 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#999', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      series: [{
        type: 'bar',
        data: props.data.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: props.colors[i % props.colors.length] },
              { offset: 1, color: props.colors[i % props.colors.length] + '40' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barWidth: '40%'
      }]
    }
  }

  if (props.type === 'line') {
    return {
      ...baseOption,
      grid: {
        left: '3%',
        right: '4%',
        top: '10%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: props.data.map(d => d.name),
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisLabel: { color: '#666', fontSize: 12 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#999', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      series: [{
        type: 'line',
        data: props.data.map(d => d.value),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: props.colors[0], width: 2 },
        itemStyle: { color: props.colors[0] },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: props.colors[0] + '30' },
            { offset: 1, color: props.colors[0] + '05' }
          ])
        }
      }]
    }
  }

  return baseOption
}

const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption(getOption())
}

const resize = () => chart?.resize()

watch(() => props.data, () => {
  if (chart) chart.setOption(getOption())
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})

defineExpose({ resize })
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 150px;
}
</style>