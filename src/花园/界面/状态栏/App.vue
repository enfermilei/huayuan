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

/** 按表面 16/10.2 写入 --fold-h（桌面折叠动画用）；窄屏改 height:auto，不再依赖该变量 */
function syncFoldHeight() {
  const el = bodyRef.value;
  if (!el) return;
  const width = el.getBoundingClientRect().width || el.clientWidth;
  if (width <= 0) return;

  // 窄屏用内容撑开，不走 --fold-h 高度动画
  if (width <= 720) return;

  el.style.setProperty('--fold-h', `${Math.ceil((width * 10.2) / 16)}px`);
}

/** 折叠后按实际根节点高度写回宿主 iframe，避免大片空白 */
function bumpHostFrameResize() {
  requestAnimationFrame(() => {
    try {
      const root = document.getElementById('garden-mvu-root');
      const nextH = Math.ceil(
        Math.max(
          root?.getBoundingClientRect().height || 0,
          document.documentElement.scrollHeight || 0,
          document.body.scrollHeight || 0,
        ),
      );
      const frame = window.frameElement as HTMLIFrameElement | null;
      if (frame && nextH > 0) {
        frame.style.height = `${nextH}px`;
      }
      window.dispatchEvent(new Event('resize'));
    } catch {
      /* ignore */
    }
  });
}

watch(
  () => settings.value.mainExpanded,
  () => {
    void nextTick(() => {
      syncFoldHeight();
      // 等一帧布局完成再量高；窄屏无 height 过渡，稍短即可
      window.setTimeout(bumpHostFrameResize, 50);
      window.setTimeout(bumpHostFrameResize, 220);
    });
  },
);

onMounted(() => {
  void nextTick(() => {
    syncFoldHeight();
    const el = bodyRef.value;
    if (!el || typeof ResizeObserver === 'undefined') return;
    foldRo = new ResizeObserver(() => syncFoldHeight());
    foldRo.observe(el);
    const surface = el.querySelector('.main-body-surface');
    if (surface) foldRo.observe(surface);
  });
});

onBeforeUnmount(() => {
  foldRo?.disconnect();
  foldRo = null;
});
</script>
