<template>
  <div class="bag-root" :class="{ compact, 'has-selection': !!selected }">
    <div class="bag-toolbar">
      <div class="bag-summary">
        <span class="bag-summary-main">{{ summary.kinds }} 种</span>
        <span class="bag-summary-sep">·</span>
        <span>共 {{ summary.stacks }} 件</span>
        <span v-if="summary.important" class="bag-summary-hot">· 重要 {{ summary.important }}</span>
      </div>
      <div v-if="!compact && categories.length > 1" class="bag-filters">
        <button
          type="button"
          class="bag-filter"
          :class="{ active: filter === '全部' }"
          @click="filter = '全部'"
        >
          全部
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="bag-filter"
          :class="{ active: filter === cat }"
          @click="filter = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div v-if="filtered.length" class="bag-grid">
      <button
        v-for="item in filtered"
        :key="item.name"
        type="button"
        class="bag-slot"
        :class="{
          active: selected?.name === item.name,
          important: isImportant(item),
          [`cat-${categorizeItem(item)}`]: true,
        }"
        :title="item.name"
        @click="toggle(item)"
      >
        <span class="bag-slot-glyph" aria-hidden="true">{{ categoryGlyph(categorizeItem(item)) }}</span>
        <span class="bag-slot-name">{{ item.name }}</span>
        <span class="bag-slot-count">×{{ formatCount(item.count) }}</span>
        <span v-if="isImportant(item)" class="bag-slot-flag">重</span>
      </button>
    </div>
    <div v-else class="bag-empty">
      <span class="bag-empty-mark" aria-hidden="true">空</span>
      <span>{{ emptyText }}</span>
    </div>

    <Transition name="bag-detail">
      <article v-if="selected" class="bag-detail">
        <header class="bag-detail-head">
          <span class="bag-detail-glyph" aria-hidden="true">{{ categoryGlyph(categorizeItem(selected)) }}</span>
          <div class="bag-detail-titles">
            <strong>{{ selected.name }}</strong>
            <span>
              {{ categorizeItem(selected) }} · ×{{ formatCount(selected.count) }}
              <template v-if="isImportant(selected)"> · 重要</template>
            </span>
          </div>
          <button class="bag-detail-close" type="button" aria-label="收起" @click="selected = null">×</button>
        </header>
        <p class="bag-detail-desc">{{ selected.desc }}</p>
      </article>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  categorizeItem,
  categoryGlyph,
  formatCount,
  inventorySummary,
  isImportant,
  type InvCategory,
  type InvItem,
} from '../inventory';

const props = withDefaults(
  defineProps<{
    items: InvItem[];
    compact?: boolean;
    emptyText?: string;
  }>(),
  {
    compact: false,
    emptyText: '背包空空如也',
  },
);

const filter = ref<'全部' | InvCategory>('全部');
const selected = ref<InvItem | null>(null);

const summary = computed(() => inventorySummary(props.items));

const categories = computed(() => {
  const set = new Set(props.items.map(categorizeItem));
  return (['文件', '钥匙', '消耗', '装备', '贵重', '其他'] as InvCategory[]).filter(c => set.has(c));
});

const filtered = computed(() => {
  if (filter.value === '全部') return props.items;
  return props.items.filter(item => categorizeItem(item) === filter.value);
});

watch(
  () => props.items,
  items => {
    if (selected.value && !items.some(i => i.name === selected.value?.name)) {
      selected.value = null;
    }
    if (filter.value !== '全部' && !categories.value.includes(filter.value)) {
      filter.value = '全部';
    }
  },
);

function toggle(item: InvItem) {
  selected.value = selected.value?.name === item.name ? null : item;
}
</script>
