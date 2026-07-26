<template>
  <div class="garden-overlay" @click.self="emit('close')">
    <div class="garden-modal bag-modal">
      <div class="modal-header">
        <h3 class="modal-title">主角背包</h3>
        <button class="modal-close" type="button" @click="emit('close')">关闭</button>
      </div>
      <div class="bag-modal-body">
        <p class="bag-modal-hint">点击格子查看完整描述；重要物品会标「重」。分类由物品名/描述自动识别。</p>
        <InventoryGrid :items="items" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseInventory } from '../inventory';
import { useDataStore } from '../store';
import InventoryGrid from './InventoryGrid.vue';

const emit = defineEmits<{ close: [] }>();
const store = useDataStore();

const items = computed(() => parseInventory(_.get(store.data, '主角.背包物品', {})));
</script>
