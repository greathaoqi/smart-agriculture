<template>
  <div class="gov-card">
    <div class="card-header">
      <span class="card-title">{{ title }}</span>
      <slot name="extra" />
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.gov-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 59, 48, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(255, 59, 48, 0.12);
    border-color: rgba(255, 59, 48, 0.25);
  }
}

.card-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.08) 0%, rgba(255, 149, 0, 0.05) 100%);
  border-bottom: 1px solid rgba(255, 59, 48, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #ff3b30;
  letter-spacing: 1px;
  position: relative;
  padding-left: 10px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 14px;
    background: linear-gradient(180deg, #ff3b30, #ff9500);
    border-radius: 2px;
  }
}

.card-body {
  flex: 1;
  padding: 16px;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>