<template>
  <div id="garden-mvu-root">
    <div class="mvu-status-bar">
      <WorldHeader />
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

    <IdentityCard
      v-if="panel === 'identity' && focusName"
      :member-name="focusName"
      @close="closePanel"
      @open-roster="openRoster"
    />
    <RosterPanel v-if="panel === 'roster'" :focus-name="focusName" @close="closePanel" />
    <MapPanel v-if="panel === 'map'" @close="closePanel" @open-identity="openIdentity" @open-roster="openRoster" />
    <SettingsPanel v-if="panel === 'settings'" @close="closePanel" />
  </div>
</template>

<script setup lang="ts">
import ActionBar, { type GardenPanel } from './components/ActionBar.vue';
import CharacterList from './components/CharacterList.vue';
import IdentityCard from './components/IdentityCard.vue';
import MapPanel from './components/MapPanel.vue';
import OrgPanel from './components/OrgPanel.vue';
import RosterPanel from './components/RosterPanel.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import UserPanel from './components/UserPanel.vue';
import WorldHeader from './components/WorldHeader.vue';
import { useDataStore } from './store';

type OverlayPanel = GardenPanel | 'identity';

useDataStore();

const panel = ref<OverlayPanel | null>(null);
const focusName = ref<string | null>(null);

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
</script>
