<template>
  <div class="garden-overlay" @click.self="emit('close')">
    <div class="garden-modal settings-modal">
      <div class="modal-header">
        <h3 class="modal-title">设置</h3>
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

        <label class="settings-row">
          <span>
            <span class="settings-label">安全模式</span>
            <span class="settings-hint">开启后隐藏性事/裸体立绘，改显示日常-普通</span>
          </span>
          <input v-model="settings.safeMode" type="checkbox" />
        </label>

        <section class="settings-portrait-section">
          <div class="settings-portrait-head">
            <div>
              <span class="settings-label">自定义立绘</span>
              <span class="settings-hint"
                >本机保存，优先于官方图。新角色缺图、或想替换现有立绘时在此添加。建议 832×1216，支持 png/jpg/webp</span
              >
            </div>
          </div>

          <div class="portrait-form">
            <label class="portrait-field">
              <span>角色名</span>
              <input
                v-model="form.character"
                class="settings-input"
                type="text"
                list="garden-roster-names"
                placeholder="如：天音纯"
              />
              <datalist id="garden-roster-names">
                <option v-for="name in rosterNames" :key="name" :value="name" />
              </datalist>
            </label>

            <label class="portrait-field">
              <span>主类型</span>
              <select v-model="form.main" class="settings-input">
                <option v-for="m in PORTRAIT_MAINS" :key="m" :value="m">{{ m }}</option>
              </select>
            </label>

            <label class="portrait-field">
              <span>次类型</span>
              <select v-model="form.sub" class="settings-input">
                <option v-for="s in subOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </label>

            <label class="portrait-field">
              <span>差分</span>
              <select v-model="form.diff" class="settings-input">
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </label>

            <label class="portrait-field portrait-field-file">
              <span>图片文件</span>
              <input
                ref="fileInput"
                class="settings-input"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                @change="onFileChange"
              />
            </label>

            <div class="portrait-form-actions">
              <button class="action-btn" type="button" :disabled="saving" @click="savePortrait">
                {{ saving ? '保存中…' : form.file ? '保存立绘' : '选择图片后保存' }}
              </button>
            </div>
            <p v-if="formHint" class="portrait-form-hint" :class="{ error: formError }">{{ formHint }}</p>
            <p class="portrait-stem-preview">将写入：{{ previewStem }}</p>
          </div>

          <div v-if="customList.length" class="portrait-override-list">
            <article v-for="item in customList" :key="item.stem" class="portrait-override-item">
              <img :src="customUrls[item.stem]" :alt="item.stem" />
              <div class="portrait-override-meta">
                <strong>{{ item.character }}</strong>
                <span>{{ item.stem }}</span>
              </div>
              <div class="portrait-override-actions">
                <button class="modal-close" type="button" @click="replaceItem(item.stem)">替换</button>
                <button class="modal-close" type="button" @click="removeItem(item.stem)">删除</button>
              </div>
            </article>
          </div>
          <p v-else class="portrait-empty">尚未添加自定义立绘</p>
        </section>

        <div class="settings-actions">
          <button class="action-btn" type="button" @click="reset">恢复默认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCustomPortraitsStore } from '../customPortraits';
import { PORTRAIT_MAINS, PORTRAIT_SUBS, PORTRAIT_SUB_FALLBACK, type PortraitMain } from '../portrait';
import { useSettingsStore } from '../settings';
import { useDataStore } from '../store';
import { asRecord } from '../utils';

const emit = defineEmits<{ close: [] }>();
const store = useSettingsStore();
const { settings } = storeToRefs(store);
const { reset } = store;

const dataStore = useDataStore();
const customStore = useCustomPortraitsStore();
const { urls: customUrls, list: customList } = storeToRefs(customStore);

const fileInput = ref<HTMLInputElement | null>(null);
const saving = ref(false);
const formHint = ref('');
const formError = ref(false);
const replaceTarget = ref<string | null>(null);

const form = reactive({
  character: '',
  main: '日常' as PortraitMain,
  sub: '普通',
  diff: '1' as '1' | '2',
  file: null as File | null,
});

const rosterNames = computed(() => Object.keys(asRecord(_.get(dataStore.data, '成员名册', {}))).sort());

const subOptions = computed(() => [...PORTRAIT_SUBS[form.main]]);

watch(
  () => form.main,
  main => {
    if (!PORTRAIT_SUBS[main].includes(form.sub)) {
      form.sub = PORTRAIT_SUB_FALLBACK[main];
    }
  },
);

const previewStem = computed(() => {
  const name = form.character.trim() || '角色名';
  return `${name}-${form.main}-${form.sub}-${form.diff}`;
});

function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement;
  form.file = input.files?.[0] ?? null;
  formHint.value = '';
  formError.value = false;
  if (form.file && replaceTarget.value) {
    void savePortrait();
  }
}

async function savePortrait() {
  const character = form.character.trim();
  if (!character) {
    formHint.value = '请填写角色名';
    formError.value = true;
    return;
  }
  if (!form.file) {
    formHint.value = '请选择图片文件';
    formError.value = true;
    return;
  }

  saving.value = true;
  formHint.value = '';
  formError.value = false;
  try {
    const stem = replaceTarget.value || previewStem.value;
    if (replaceTarget.value) {
      await customStore.upsert(stem, form.file);
      replaceTarget.value = null;
    } else {
      await customStore.upsertFor(character, { 主类型: form.main, 次类型: form.sub, 差分序号: form.diff }, form.file);
    }
    form.file = null;
    if (fileInput.value) fileInput.value.value = '';
    formHint.value = `已保存「${stem}」`;
    toastr.success(`自定义立绘已保存：${stem}`);
  } catch (error) {
    console.error('[花园状态栏] 保存自定义立绘失败', error);
    formHint.value = error instanceof Error ? error.message : '保存失败';
    formError.value = true;
    toastr.error('自定义立绘保存失败');
  } finally {
    saving.value = false;
  }
}

function replaceItem(stem: string) {
  const parts = stem.split('-');
  // stem: 角色名-主类型-次类型-差分；角色名可能不含 `-`，主类型在已知集合中
  const diff = parts[parts.length - 1];
  const main = parts[parts.length - 3] as PortraitMain;
  const sub = parts[parts.length - 2];
  const character = parts.slice(0, -3).join('-');
  if (PORTRAIT_MAINS.includes(main)) {
    form.character = character;
    form.main = main;
    form.sub = PORTRAIT_SUBS[main].includes(sub) ? sub : PORTRAIT_SUB_FALLBACK[main];
    form.diff = diff === '2' ? '2' : '1';
  }
  replaceTarget.value = stem;
  formHint.value = `替换模式：请选择新图片后保存（${stem}）`;
  formError.value = false;
  fileInput.value?.click();
}

async function removeItem(stem: string) {
  try {
    await customStore.remove(stem);
    if (replaceTarget.value === stem) replaceTarget.value = null;
    toastr.info(`已删除自定义立绘：${stem}`);
  } catch (error) {
    console.error('[花园状态栏] 删除自定义立绘失败', error);
    toastr.error('删除失败');
  }
}
</script>
