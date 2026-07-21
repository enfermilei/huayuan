<template>
  <div class="garden-overlay" @click.self="emit('close')">
    <div class="garden-modal settings-modal">
      <div class="modal-header">
        <h3 class="modal-title">终端设置</h3>
        <button class="modal-close" type="button" @click="emit('close')">关闭</button>
      </div>

      <div class="settings-body">
        <label class="settings-row">
          <span>
            <span class="settings-label">显示内心想法摘要</span>
            <span class="settings-hint">在场成员卡片底部显示想法片段</span>
          </span>
          <input v-model="settings.showThoughts" type="checkbox" />
        </label>

        <label class="settings-row">
          <span>
            <span class="settings-label">入场动画</span>
            <span class="settings-hint">成员卡片淡入上浮动画</span>
          </span>
          <input v-model="settings.enableEnterAnim" type="checkbox" />
        </label>

        <label class="settings-row">
          <span>
            <span class="settings-label">名册优先展示在场成员</span>
            <span class="settings-hint">打开名册时在场成员排在前面</span>
          </span>
          <input v-model="settings.rosterPreferPresent" type="checkbox" />
        </label>

        <label class="settings-row settings-row-stack">
          <span>
            <span class="settings-label">立绘资源基址</span>
            <span class="settings-hint"
              >资源根目录；路径为 {基址}/{角色名}/{角色名}-主类型-次类型-差分.png。本地可改
              http://127.0.0.1:5500/portraits；留空则恢复 CDN 默认</span
            >
          </span>
          <input
            v-model="settings.portraitBaseUrl"
            class="settings-input"
            type="url"
            placeholder="https://testingcf.jsdelivr.net/gh/enfermilei/huayuan@main/portraits"
          />
        </label>

        <label class="settings-row">
          <span>
            <span class="settings-label">立绘扩展名</span>
            <span class="settings-hint">不含点，默认 png</span>
          </span>
          <input v-model="settings.portraitExt" class="settings-input settings-input-sm" type="text" maxlength="8" />
        </label>

        <div class="settings-actions">
          <button class="action-btn" type="button" @click="reset">恢复默认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../settings';

const emit = defineEmits<{ close: [] }>();
const store = useSettingsStore();
const { settings } = storeToRefs(store);
const { reset } = store;
</script>
