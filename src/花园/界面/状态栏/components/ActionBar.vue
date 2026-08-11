<template>
  <div class="action-bar">
    <button class="action-btn" type="button" aria-label="成员名册" @click="emit('open', 'roster')">
      <span class="btn-icon icon-roster" aria-hidden="true"></span>
      <span class="action-btn-label">成员名册</span>
    </button>
    <button class="action-btn" type="button" aria-label="组织地图" @click="emit('open', 'map')">
      <span class="btn-icon icon-map" aria-hidden="true"></span>
      <span class="action-btn-label">组织地图</span>
    </button>
    <button class="action-btn" type="button" aria-label="背包" @click="emit('open', 'bag')">
      <span class="btn-icon icon-bag" aria-hidden="true"></span>
      <span class="action-btn-label">背包</span>
    </button>
    <button class="action-btn" type="button" aria-label="设置" @click="emit('open', 'settings')">
      <span class="btn-icon icon-settings" aria-hidden="true"></span>
      <span class="action-btn-label">设置</span>
    </button>
  </div>
</template>

<script setup lang="ts">
export type GardenPanel = 'roster' | 'map' | 'bag' | 'settings';

const emit = defineEmits<{ open: [panel: GardenPanel] }>();
</script>
