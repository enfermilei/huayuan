<template>
  <div class="garden-overlay id-card-overlay" @click.self="emit('close')">
    <div class="garden-modal id-card-modal" :class="{ 'is-danger': detail?.isDanger }">
      <button class="id-card-close" type="button" aria-label="关闭" @click="emit('close')">×</button>

      <template v-if="detail">
        <div class="id-card-layout">
          <!-- 左侧立绘：点击/悬停打开 3D 玻璃浮层；底部标签按钮不触发 -->
          <aside
            class="id-card-portrait cursor-zoom-in"
            :class="{ 'is-broken': broken }"
            :title="broken ? undefined : `查看 ${detail.name} 立体立绘`"
            @click="openGlassLightbox"
            @mouseenter="onPortraitHover"
            @mouseleave="cancelPortraitHover"
          >
            <PortraitImage
              :candidates="detail.srcs"
              :alt="detail.name"
              @broken="broken = true"
              @loaded="broken = false"
            />
            <div class="portrait-fallback">
              {{ detail.name }}
              <span>{{ settings.safeMode && detail.portraitR18 ? '安全模式已隐藏' : '立绘缺失' }}</span>
              <button class="portrait-upload-btn" type="button" @click.stop="pickPortrait">上传立绘</button>
            </div>
            <div class="id-card-portrait-veil"></div>
            <div class="id-card-portrait-meta" @click.stop @mouseenter.stop="cancelPortraitHover">
              <span class="id-card-portrait-tag">{{ detail.portraitMain }}</span>
              <span class="id-card-portrait-tag">{{ detail.portraitSub }}</span>
              <span v-if="detail.portraitLocked" class="id-card-portrait-tag locked">已锁定</span>
              <span v-if="detail.present" class="id-card-portrait-tag present">在场</span>
              <span v-if="detail.pregnant" class="id-card-portrait-tag warn">怀孕</span>
              <button class="id-card-portrait-tag upload" type="button" @click.stop="pickPortrait">
                {{ broken ? '上传立绘' : '替换立绘' }}
              </button>
              <button class="id-card-portrait-tag lock" type="button" @click.stop="togglePortraitLock">
                {{ detail.portraitLocked ? '解锁立绘' : '锁定立绘' }}
              </button>
            </div>
            <input
              ref="portraitFileInput"
              class="portrait-file-hidden"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              @change="onPortraitFile"
            />
          </aside>

          <!-- 右侧信息 -->
          <section class="id-card-info">
            <header class="id-card-header">
              <div class="id-card-eyebrow">MEMBER IDENTITY</div>
              <h2 class="id-card-name">
                {{ detail.name }}
                <span v-if="detail.isDanger" class="loyalty-warn">⚠️</span>
              </h2>
              <p class="id-card-subtitle">{{ detail.role }} · {{ detail.age }} 岁</p>
              <p class="id-card-location">
                <span class="id-card-loc-dot"></span>
                {{ detail.loc }}
              </p>
            </header>

            <div class="id-card-meters">
              <div class="id-meter" @mouseenter="hoverMeter = 'like'" @mouseleave="hoverMeter = null">
                <div class="id-meter-top">
                  <span>好感度</span>
                  <span class="font-mono">{{ detail.like }}</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="fill pink"
                    :class="{ 'is-hover': hoverMeter === 'like' }"
                    :style="{ width: `${detail.likePct}%` }"
                  ></div>
                </div>
              </div>
              <div class="id-meter" @mouseenter="hoverMeter = 'loyal'" @mouseleave="hoverMeter = null">
                <div class="id-meter-top">
                  <span>忠诚度</span>
                  <span class="font-mono">{{ detail.loyal }}</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="fill"
                    :class="[detail.isDanger ? 'danger' : 'gold', { 'is-hover': hoverMeter === 'loyal' }]"
                    :style="{ width: `${detail.loyalPct}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <nav class="id-card-tabs" role="tablist">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                role="tab"
                class="id-tab"
                :class="{ active: activeTab === tab.id }"
                :aria-selected="activeTab === tab.id"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </nav>

            <div :key="activeTab" class="id-card-panel" role="tabpanel">
              <template v-if="activeTab === 'profile'">
                <div class="id-stat-grid">
                  <div class="id-stat">
                    <span class="data-label">贡献度</span>
                    <span class="data-value font-mono">{{ detail.contrib }}</span>
                  </div>
                  <div class="id-stat">
                    <span class="data-label">资金</span>
                    <span class="data-value font-mono">{{ detail.fund }}</span>
                  </div>
                  <div class="id-stat">
                    <span class="data-label">立绘主类型</span>
                    <span class="data-value">{{ detail.portraitMain }}</span>
                  </div>
                  <div class="id-stat">
                    <span class="data-label">立绘次类型</span>
                    <span class="data-value">{{ detail.portraitSub }}</span>
                  </div>
                </div>
                <blockquote
                  class="id-thought"
                  :class="{ expanded: thoughtExpanded }"
                  @click="thoughtExpanded = !thoughtExpanded"
                >
                  <span class="id-thought-label">内心想法</span>
                  <p>{{ detail.thought }}</p>
                  <span class="id-thought-hint">{{ thoughtExpanded ? '收起' : '展开' }}</span>
                </blockquote>
              </template>

              <template v-else-if="activeTab === 'goals'">
                <div class="id-goal-list">
                  <article v-for="g in detail.goals" :key="g.label" class="id-goal">
                    <div class="id-goal-label">{{ g.label }}</div>
                    <p>{{ g.text }}</p>
                  </article>
                </div>
              </template>

              <template v-else-if="activeTab === 'body'">
                <div class="id-body-grid">
                  <div v-for="(v, k) in detail.body" :key="k" class="id-body-cell" :class="{ alert: isBodyAlert(v) }">
                    <span class="id-body-key">{{ k }}</span>
                    <span class="id-body-val">{{ v }}</span>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="id-section">
                  <div class="sub-section-title">今日着装</div>
                  <div class="outfit-list">
                    <div
                      v-for="chip in detail.outfit"
                      :key="chip.slot"
                      class="outfit-item"
                      :data-slot="chip.slot"
                    >
                      <span class="gear-icon-slot" aria-hidden="true">
                        <OutfitGlyph :slot="chip.slot" />
                      </span>
                      <span class="outfit-item-text">{{ chip.text }}</span>
                    </div>
                    <div v-if="detail.outfit.length === 0" class="outfit-item is-empty">
                      <span class="outfit-item-text">暂无穿戴</span>
                    </div>
                  </div>
                </div>
                <div class="id-section">
                  <div class="sub-section-title">背包</div>
                  <InventoryGrid :items="detail.bag" compact empty-text="背包空空如也" />
                </div>
              </template>
            </div>

            <footer class="id-card-footer">
              <button class="id-footer-btn ghost" type="button" @click="emit('openRoster', detail.name)">
                打开名册
              </button>
              <button class="id-footer-btn" type="button" @click="emit('close')">收起身份卡</button>
            </footer>
          </section>
        </div>
      </template>

      <div v-else class="id-card-missing">
        <p>未找到成员「{{ memberName }}」的资料</p>
        <button class="modal-close" type="button" @click="emit('close')">关闭</button>
      </div>
    </div>

    <PortraitGlassLightbox
      v-model:open="glassOpen"
      :candidates="detail?.srcs || []"
      :alt="detail?.name || memberName"
    />
  </div>
</template>

<script setup lang="ts">
import { useCustomPortraitsStore } from '../customPortraits';
import { parseInventory } from '../inventory';
import { isR18Portrait, normalizePortraitState } from '../portrait';
import { usePortraitLocksStore } from '../portraitLocks';
import { useSettingsStore } from '../settings';
import { useDataStore } from '../store';
import { asRecord, formatMoney, isPresent, parseOutfitChips, resolvePortraitCandidates, toPercent } from '../utils';
import InventoryGrid from './InventoryGrid.vue';
import OutfitGlyph from './OutfitGlyph.vue';
import PortraitGlassLightbox from './PortraitGlassLightbox.vue';
import PortraitImage from './PortraitImage.vue';

const props = defineProps<{ memberName: string }>();
const emit = defineEmits<{ close: []; openRoster: [name: string] }>();

type TabId = 'profile' | 'goals' | 'body' | 'gear';

const tabs: { id: TabId; label: string }[] = [
  { id: 'profile', label: '档案' },
  { id: 'goals', label: '目标' },
  { id: 'body', label: '状态' },
  { id: 'gear', label: '随身' },
];

const store = useDataStore();
const { settings } = storeToRefs(useSettingsStore());
const customPortraits = useCustomPortraitsStore();
const portraitLocks = usePortraitLocksStore();
const activeTab = ref<TabId>('profile');
const thoughtExpanded = ref(false);
const hoverMeter = ref<'like' | 'loyal' | null>(null);
const broken = ref(false);
const glassOpen = ref(false);
const portraitFileInput = ref<HTMLInputElement | null>(null);
let hoverOpenTimer: ReturnType<typeof setTimeout> | null = null;

function openGlassLightbox() {
  if (!detail.value || broken.value) return;
  glassOpen.value = true;
}

function onPortraitHover() {
  // 触控设备无悬停；避免误开浮层
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
  if (hoverOpenTimer) clearTimeout(hoverOpenTimer);
  hoverOpenTimer = setTimeout(() => openGlassLightbox(), 420);
}

function cancelPortraitHover() {
  if (hoverOpenTimer) {
    clearTimeout(hoverOpenTimer);
    hoverOpenTimer = null;
  }
}

watch(
  () => props.memberName,
  () => {
    activeTab.value = 'profile';
    thoughtExpanded.value = false;
    broken.value = false;
    glassOpen.value = false;
    cancelPortraitHover();
  },
);

onBeforeUnmount(cancelPortraitHover);

const memberData = computed(() => {
  const roster = asRecord(_.get(store.data, '成员名册', {}));
  return roster[props.memberName] ?? null;
});

const currentPortraitState = computed(() => _.get(memberData.value, '立绘状态', {}));

/** 实际用于展示/替换的立绘状态：有锁定则用锁定值 */
const displayPortraitState = computed(() => {
  void portraitLocks.revision;
  return portraitLocks.getLock(props.memberName) ?? normalizePortraitState(currentPortraitState.value);
});

const detail = computed(() => {
  void settings.value.safeMode;
  void portraitLocks.revision;
  const d = memberData.value;
  if (!d) return null;

  const like = Number(_.get(d, '好感度', 0)) || 0;
  const loyal = Number(_.get(d, '忠诚度', 0)) || 0;
  const body = asRecord(_.get(d, '身体状况', {}));
  const outfitObj = asRecord(_.get(d, '着装', {}));
  const portrait = currentPortraitState.value;
  const display = displayPortraitState.value;
  const locked = portraitLocks.isLocked(props.memberName);
  const bag = parseInventory(_.get(d, '背包物品', {}));
  const thoughtRaw = String(_.get(d, '内心想法', '无') || '无');

  return {
    name: props.memberName,
    role: String(_.get(d, '职务', '待初始化')),
    age: Number(_.get(d, '年龄', 0)) || 0,
    loc: String(_.get(d, '当前位置', '待初始化')),
    present: isPresent(_.get(d, '是否在场', false)),
    pregnant: Boolean(_.get(d, '是否怀孕', false)),
    like,
    loyal,
    likePct: toPercent(like),
    loyalPct: toPercent(loyal),
    isDanger: loyal < 0,
    contrib: (Number(_.get(d, '贡献度', 0)) || 0).toLocaleString('en-US'),
    fund: formatMoney(_.get(d, '资金', 0)),
    thought: thoughtRaw,
    portraitMain: display.主类型,
    portraitSub: display.次类型,
    portraitR18: isR18Portrait(display),
    portraitLocked: locked,
    srcs: resolvePortraitCandidates(props.memberName, portrait, 'full'),
    body,
    outfit: parseOutfitChips(outfitObj),
    bag,
    goals: [
      { label: '短期目标', text: String(_.get(d, '短期目标', '无')) },
      { label: '中期目标', text: String(_.get(d, '中期目标', '无')) },
      { label: '之后行程', text: String(_.get(d, '之后行程', '无')) },
    ],
  };
});

watch(
  () => detail.value?.src,
  () => {
    broken.value = false;
  },
);

function pickPortrait() {
  portraitFileInput.value?.click();
}

function togglePortraitLock() {
  try {
    if (portraitLocks.isLocked(props.memberName)) {
      portraitLocks.unlock(props.memberName);
      toastr.info(`已解锁「${props.memberName}」立绘`);
      return;
    }
    // 锁定当前正在显示的立绘（含已锁定时则刷新为当前 MVU；未锁定则锁 MVU 当前态）
    portraitLocks.lock(props.memberName, currentPortraitState.value);
    const state = normalizePortraitState(currentPortraitState.value);
    toastr.success(`已锁定「${props.memberName}」立绘：${state.主类型}-${state.次类型}-${state.差分序号}`);
  } catch (error) {
    console.error('[花园状态栏] 锁定立绘失败', error);
    toastr.error('锁定立绘失败');
  }
}

async function onPortraitFile(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  try {
    // 替换针对当前展示用的状态（锁定时改锁定那张）
    const stem = await customPortraits.upsertFor(props.memberName, displayPortraitState.value, file);
    broken.value = false;
    toastr.success(`已替换立绘：${stem}`);
  } catch (error) {
    console.error('[花园状态栏] 身份卡上传立绘失败', error);
    toastr.error('立绘上传失败');
  }
}

function isBodyAlert(value: unknown): boolean {
  const s = String(value || '');
  return /伤|痛|破|肿|炎|血|危|异常|不适|撕裂/.test(s);
}
</script>
