<template>
  <div class="garden-overlay id-card-overlay" @click.self="emit('close')">
    <div class="garden-modal id-card-modal" :class="{ 'is-danger': detail?.isDanger }">
      <button class="id-card-close" type="button" aria-label="关闭" @click="emit('close')">×</button>

      <template v-if="detail">
        <div class="id-card-layout">
          <!-- 左侧立绘 -->
          <aside class="id-card-portrait" :class="{ 'is-broken': broken }">
            <img :src="detail.src" :alt="detail.name" @error="broken = true" />
            <div class="portrait-fallback">
              {{ detail.name }}
              <span>立绘缺失</span>
            </div>
            <div class="id-card-portrait-veil"></div>
            <div class="id-card-portrait-meta">
              <span class="id-card-portrait-tag">{{ detail.portraitMain }}</span>
              <span v-if="detail.present" class="id-card-portrait-tag present">在场</span>
              <span v-if="detail.pregnant" class="id-card-portrait-tag warn">怀孕</span>
            </div>
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
                  <div class="outfit-row">
                    <span v-for="chip in detail.outfit" :key="chip" class="outfit-chip">{{ chip }}</span>
                    <span v-if="detail.outfit.length === 0" class="outfit-chip" style="opacity: 0.6">暂无穿戴</span>
                  </div>
                </div>
                <div class="id-section">
                  <div class="sub-section-title">背包物品</div>
                  <div class="inventory-grid id-inv-grid">
                    <div v-for="item in detail.bag" :key="item.name" class="inv-item">
                      <span class="inv-name">{{ item.name }}</span>
                      <span class="inv-desc">{{ item.desc }}</span>
                      <span class="inv-badge">{{ item.badge }}</span>
                    </div>
                    <div v-if="detail.bag.length === 0" class="inv-desc" style="opacity: 0.5; padding: 10px">
                      背包空空如也
                    </div>
                  </div>
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
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../settings';
import { useDataStore } from '../store';
import { asRecord, formatMoney, isPresent, resolvePortrait, toPercent } from '../utils';

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
const activeTab = ref<TabId>('profile');
const thoughtExpanded = ref(false);
const hoverMeter = ref<'like' | 'loyal' | null>(null);
const broken = ref(false);

watch(
  () => props.memberName,
  () => {
    activeTab.value = 'profile';
    thoughtExpanded.value = false;
    broken.value = false;
  },
);

const detail = computed(() => {
  const roster = asRecord(_.get(store.data, '成员名册', {}));
  const d = roster[props.memberName];
  if (!d) return null;

  const like = Number(_.get(d, '好感度', 0)) || 0;
  const loyal = Number(_.get(d, '忠诚度', 0)) || 0;
  const body = asRecord(_.get(d, '身体状况', {}));
  const outfitObj = asRecord(_.get(d, '着装', {}));
  const portrait = _.get(d, '立绘状态', {});
  const bag = Object.entries(asRecord(_.get(d, '背包物品', {})))
    .map(([name, item]) => {
      const cnt = Number(_.get(item, '数量', 0)) || 0;
      if (cnt <= 0) return null;
      return { name, desc: String(_.get(item, '描述', '无描述')), badge: cnt > 99 ? '99+' : String(cnt) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

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
    portraitMain: String(_.get(portrait, '主类型', '日常')),
    portraitSub: String(_.get(portrait, '次类型', '普通')),
    src: resolvePortrait(props.memberName, portrait, 'full', {
      baseUrl: settings.value.portraitBaseUrl,
      ext: settings.value.portraitExt,
    }),
    body,
    outfit: (['上衣', '下装', '袜', '鞋', '配饰'] as const)
      .map(k => String(outfitObj[k] || ''))
      .filter(v => v && v !== '待初始化'),
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

function isBodyAlert(value: unknown): boolean {
  const s = String(value || '');
  return /伤|痛|破|肿|炎|血|危|异常|不适|撕裂/.test(s);
}
</script>
