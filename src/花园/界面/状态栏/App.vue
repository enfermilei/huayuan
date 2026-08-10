<template>
  <div id="garden-mvu-root" :style="themeCssVars" :data-theme-mode="themeMode">
    <div class="mvu-status-bar" :class="{ 'is-main-collapsed': !settings.mainExpanded }">
      <WorldHeader />
      <div ref="bodyRef" class="main-body" :aria-hidden="!settings.mainExpanded">
        <div class="main-body-surface">
          <div class="main-grid">
            <div class="left-panel">
              <UserPanel />
              <OrgPanel />
            </div>
            <div class="right-panel">
              <CharacterList @select="openIdentity" />
              <ActionBar @open="openPanel" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <IdentityCard
      v-if="panel === 'identity' && focusName"
      :member-name="focusName"
      @close="closePanel"
      @open-roster="openRoster"
    />
    <RosterPanel v-if="panel === 'roster'" :focus-name="focusName" @close="closePanel" />
    <MapPanel v-if="panel === 'map'" @close="closePanel" @open-identity="openIdentity" @open-roster="openRoster" />
    <InventoryPanel v-if="panel === 'bag'" @close="closePanel" />
    <SettingsPanel v-if="panel === 'settings'" @close="closePanel" />
  </div>
</template>

<script setup lang="ts">
import ActionBar, { type GardenPanel } from './components/ActionBar.vue';
import CharacterList from './components/CharacterList.vue';
import IdentityCard from './components/IdentityCard.vue';
import InventoryPanel from './components/InventoryPanel.vue';
import MapPanel from './components/MapPanel.vue';
import OrgPanel from './components/OrgPanel.vue';
import RosterPanel from './components/RosterPanel.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import UserPanel from './components/UserPanel.vue';
import WorldHeader from './components/WorldHeader.vue';
import { resolveThemeCssVars, resolveThemeMode, useSettingsStore } from './settings';
import { useDataStore } from './store';

type OverlayPanel = GardenPanel | 'identity';

useDataStore();
const { settings } = storeToRefs(useSettingsStore());
const themeCssVars = computed(() =>
  resolveThemeCssVars({
    themePreset: settings.value.themePreset,
    themeAccent: settings.value.themeAccent,
    themeDark: settings.value.themeDark,
  }),
);
const themeMode = computed(() =>
  resolveThemeMode({
    themePreset: settings.value.themePreset,
    themeDark: settings.value.themeDark,
  }),
);

const panel = ref<OverlayPanel | null>(null);
const focusName = ref<string | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
let foldRo: ResizeObserver | null = null;

function openPanel(next: GardenPanel) {
  focusName.value = null;
  panel.value = next;
}

function openIdentity(name: string) {
  focusName.value = name;
  panel.value = 'identity';
}

function openRoster(name?: string) {
  focusName.value = name || focusName.value;
  panel.value = 'roster';
}

function closePanel() {
  panel.value = null;
  focusName.value = null;
}

/** 按表面 16/10.2 写入 --fold-h，供 CSS height 在 0↔像素 间过渡 */
function syncFoldHeight() {
  const el = bodyRef.value;
  if (!el) return;
  const width = el.getBoundingClientRect().width || el.clientWidth;
  if (width <= 0) return;
  el.style.setProperty('--fold-h', `${Math.ceil((width * 10.2) / 16)}px`);
}

onMounted(() => {
  void nextTick(() => {
    syncFoldHeight();
    const el = bodyRef.value;
    if (!el || typeof ResizeObserver === 'undefined') return;
    foldRo = new ResizeObserver(() => syncFoldHeight());
    foldRo.observe(el);
  });
});

onBeforeUnmount(() => {
  foldRo?.disconnect();
  foldRo = null;
});
</script>
