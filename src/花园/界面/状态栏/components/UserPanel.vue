<template>
  <section class="panel user-panel">
    <h3 class="panel-title">主人档案</h3>
    <div class="user-header">
      <div class="user-avatar">主</div>
      <div class="user-name-block">
        <div class="user-name">主角</div>
        <div class="user-subtitle">{{ subtitle }}</div>
      </div>
    </div>
    <div class="user-info-grid">
      <div class="user-info-item">
        <span class="data-label">资金</span>
        <span class="data-value font-mono">{{ fund }}</span>
      </div>
      <div class="user-info-item">
        <span class="data-label">贡献度</span>
        <span class="data-value font-mono">{{ contrib }}</span>
      </div>
      <div class="user-info-item">
        <span class="data-label">职务</span>
        <span class="data-value">{{ role }}</span>
      </div>
      <div class="user-info-item">
        <span class="data-label">位置</span>
        <span class="data-value">{{ loc }}</span>
      </div>
    </div>
    <div class="user-outfit">
      <span class="data-label">今日着装</span>
      <div class="outfit-row">
        <span v-for="chip in outfitChips" :key="chip" class="outfit-chip">{{ chip }}</span>
        <span v-if="outfitChips.length === 0" class="outfit-chip" style="opacity: 0.6">暂无穿戴</span>
      </div>
    </div>
    <div class="user-inventory">
      <div class="sub-section-title">背包物品</div>
      <div class="inventory-grid">
        <div v-for="item in inventory" :key="item.name" class="inv-item">
          <span class="inv-name">{{ item.name }}</span>
          <span class="inv-desc">{{ item.desc }}</span>
          <span class="inv-badge">{{ item.badge }}</span>
        </div>
        <div v-if="inventory.length === 0" class="inv-desc" style="opacity: 0.5; padding: 10px">背包空空如也</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDataStore } from '../store';
import { asRecord, formatMoney } from '../utils';

const store = useDataStore();

const role = computed(() => String(_.get(store.data, '主角.职务', '待初始化')));
const loc = computed(() => String(_.get(store.data, '主角.当前位置', '待初始化')));
const subtitle = computed(() => `${role.value} · ${loc.value}`);
const fund = computed(() => formatMoney(_.get(store.data, '主角.资金', 0)));
const contrib = computed(() => (Number(_.get(store.data, '主角.贡献度', 0)) || 0).toLocaleString('en-US'));

const outfitChips = computed(() =>
  (['上衣', '下装', '袜', '鞋', '配饰'] as const)
    .map(k => String(_.get(store.data, `主角.着装.${k}`, '') || ''))
    .filter(v => v && v !== '待初始化'),
);

const inventory = computed(() => {
  const bag = asRecord(_.get(store.data, '主角.背包物品', {}));
  return Object.entries(bag)
    .map(([name, d]) => {
      const cnt = Number(_.get(d, '数量', 0)) || 0;
      if (cnt <= 0) return null;
      return {
        name,
        desc: String(_.get(d, '描述', '无描述')),
        badge: cnt > 99 ? '99+' : String(cnt),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
});
</script>
