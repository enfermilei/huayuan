<template>
  <section class="panel user-panel">
    <h3 class="panel-title">角色档案</h3>
    <div class="user-header">
      <div class="user-avatar">{{ avatarGlyph }}</div>
      <div class="user-name-block">
        <div class="user-name">{{ userName }}</div>
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
    <div class="user-outfit" :class="{ 'is-expanded': settings.outfitExpanded }">
      <button
        class="outfit-toggle"
        type="button"
        :aria-expanded="settings.outfitExpanded"
        aria-controls="user-outfit-list"
        @click="settings.outfitExpanded = !settings.outfitExpanded"
      >
        <span class="data-label">今日着装</span>
        <span class="outfit-toggle-meta">{{ outfitSummary }}</span>
        <span class="outfit-toggle-chevron" aria-hidden="true"></span>
      </button>
      <div id="user-outfit-list" class="outfit-list-fold" :hidden="!settings.outfitExpanded">
        <div class="outfit-list">
          <div
            v-for="chip in outfitChips"
            :key="chip.slot"
            class="outfit-item"
            :data-slot="chip.slot"
          >
            <span class="gear-icon-slot" aria-hidden="true">
              <OutfitGlyph :slot="chip.slot" />
            </span>
            <span class="outfit-item-text">{{ chip.text }}</span>
          </div>
          <div v-if="outfitChips.length === 0" class="outfit-item is-empty">
            <span class="outfit-item-text">暂无穿戴</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../settings';
import { useDataStore } from '../store';
import { formatMoney, parseOutfitChips } from '../utils';
import OutfitGlyph from './OutfitGlyph.vue';

const store = useDataStore();
const { settings } = storeToRefs(useSettingsStore());

const userName = computed(() => {
  try {
    const fromMacro = SillyTavern.substituteParams?.('{{user}}')?.trim();
    if (fromMacro && fromMacro !== '{{user}}') return fromMacro;
  } catch {
    /* ignore */
  }
  return String(SillyTavern.name1 || '用户').trim() || '用户';
});
const avatarGlyph = computed(() => Array.from(userName.value)[0] || '角');

const role = computed(() => String(_.get(store.data, '主角.职务', '待初始化')));
const loc = computed(() => String(_.get(store.data, '主角.当前位置', '待初始化')));
const subtitle = computed(() => `${role.value} · ${loc.value}`);
const fund = computed(() => formatMoney(_.get(store.data, '主角.资金', 0)));
const contrib = computed(() => (Number(_.get(store.data, '主角.贡献度', 0)) || 0).toLocaleString('en-US'));

const outfitChips = computed(() => parseOutfitChips(_.get(store.data, '主角.着装', {})));
const outfitSummary = computed(() => {
  const n = outfitChips.value.length;
  if (n === 0) return '暂无';
  return settings.value.outfitExpanded ? `${n} 项 · 收起` : `${n} 项 · 展开`;
});
</script>
