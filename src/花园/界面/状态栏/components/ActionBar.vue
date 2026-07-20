<template>
  <div class="action-bar">
    <button class="action-btn" type="button" @click="emit('open', 'roster')">
      <span class="btn-icon icon-roster"></span>
      成员名册
    </button>
    <button class="action-btn" type="button" @click="emit('open', 'map')">
      <span class="btn-icon icon-map"></span>
      组织地图
    </button>
    <button class="action-btn" type="button" @click="emit('open', 'settings')">
      <span class="btn-icon icon-settings"></span>
      终端设置
    </button>
  </div>
</template>

<script setup lang="ts">
export type GardenPanel = 'roster' | 'map' | 'settings';

const emit = defineEmits<{ open: [panel: GardenPanel] }>();
</script>
