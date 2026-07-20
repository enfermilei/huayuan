<template>
  <div class="garden-overlay" @click.self="emit('close')">
    <div class="garden-modal roster-modal">
      <div class="modal-header">
        <h3 class="modal-title">成员名册</h3>
        <button class="modal-close" type="button" @click="emit('close')">关闭</button>
      </div>

      <div class="roster-body">
        <aside class="roster-sidebar">
          <input v-model="keyword" class="roster-search" type="search" placeholder="搜索姓名 / 职务 / 位置" />
          <div class="roster-list">
            <button
              v-for="m in filteredMembers"
              :key="m.name"
              type="button"
              class="roster-item"
              :class="{ active: selected === m.name, present: m.present }"
              @click="selected = m.name"
            >
              <span class="roster-item-name">{{ m.name }}</span>
              <span class="roster-item-meta">{{ m.role }} · {{ m.loc }}</span>
              <span v-if="m.present" class="roster-item-tag">在场</span>
            </button>
            <div v-if="filteredMembers.length === 0" class="roster-empty">没有匹配的成员</div>
          </div>
        </aside>

        <section v-if="detail" class="roster-detail">
          <div class="detail-hero">
            <div class="detail-portrait">
              <img :src="detail.src" :alt="detail.name" @error="broken.add(detail.name)" />
              <div v-if="broken.has(detail.name)" class="portrait-fallback">{{ detail.name }}</div>
            </div>
            <div class="detail-identity">
              <div class="detail-name">
                {{ detail.name }}
                <span v-if="detail.loyal < 0" class="loyalty-warn">⚠️</span>
              </div>
              <div class="detail-sub">{{ detail.role }} · {{ detail.age }} 岁</div>
              <div class="detail-sub">位置：{{ detail.loc }}</div>
              <div class="detail-chips">
                <span class="outfit-chip">{{ detail.present ? '在场' : '外出' }}</span>
                <span v-if="detail.pregnant" class="outfit-chip">怀孕</span>
                <span class="outfit-chip">立绘 · {{ detail.portraitMain }}/{{ detail.portraitSub }}</span>
              </div>
            </div>
          </div>

          <div class="detail-grid">
            <div class="user-info-item">
              <span class="data-label">好感度</span>
              <span class="data-value font-mono">{{ detail.like }}</span>
            </div>
            <div class="user-info-item">
              <span class="data-label">忠诚度</span>
              <span class="data-value font-mono">{{ detail.loyal }}</span>
            </div>
            <div class="user-info-item">
              <span class="data-label">贡献度</span>
              <span class="data-value font-mono">{{ detail.contrib }}</span>
            </div>
            <div class="user-info-item">
              <span class="data-label">资金</span>
              <span class="data-value font-mono">{{ detail.fund }}</span>
            </div>
          </div>

          <div class="progress-with-label">
            <div class="top">
              <span class="name">好感</span><span class="num font-mono">{{ detail.like }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="fill pink"
                :style="{ '--target-width': `${detail.likePct}%`, width: `${detail.likePct}%` }"
              ></div>
            </div>
          </div>
          <div class="progress-with-label">
            <div class="top">
              <span class="name">忠诚</span><span class="num font-mono">{{ detail.loyal }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="fill"
                :class="detail.loyal < 0 ? 'danger' : 'gold'"
                :style="{ '--target-width': `${detail.loyalPct}%`, width: `${detail.loyalPct}%` }"
              ></div>
            </div>
          </div>

          <div class="detail-block">
            <div class="sub-section-title">目标与行程</div>
            <div class="affair-desc"><b>短期：</b>{{ detail.shortGoal }}</div>
            <div class="affair-desc"><b>中期：</b>{{ detail.midGoal }}</div>
            <div class="affair-desc"><b>之后：</b>{{ detail.nextPlan }}</div>
          </div>

          <div class="detail-block">
            <div class="sub-section-title">内心想法</div>
            <div class="affair-desc">{{ detail.thought }}</div>
          </div>

          <div class="detail-block">
            <div class="sub-section-title">身体状况</div>
            <div class="outfit-row">
              <span v-for="(v, k) in detail.body" :key="k" class="outfit-chip">{{ k }}：{{ v }}</span>
            </div>
          </div>

          <div class="detail-block">
            <div class="sub-section-title">着装</div>
            <div class="outfit-row">
              <span v-for="chip in detail.outfit" :key="chip" class="outfit-chip">{{ chip }}</span>
              <span v-if="detail.outfit.length === 0" class="outfit-chip" style="opacity: 0.6">暂无穿戴</span>
            </div>
          </div>

          <div class="detail-block">
            <div class="sub-section-title">背包</div>
            <div class="inventory-grid">
              <div v-for="item in detail.bag" :key="item.name" class="inv-item">
                <span class="inv-name">{{ item.name }}</span>
                <span class="inv-desc">{{ item.desc }}</span>
                <span class="inv-badge">{{ item.badge }}</span>
              </div>
              <div v-if="detail.bag.length === 0" class="inv-desc" style="opacity: 0.5; padding: 10px">空</div>
            </div>
          </div>
        </section>
        <section v-else class="roster-detail roster-empty-detail">选择左侧成员查看详情</section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../settings';
import { useDataStore } from '../store';
import { asRecord, formatMoney, isPresent, resolvePortrait, toPercent } from '../utils';

const props = defineProps<{ focusName?: string | null }>();
const emit = defineEmits<{ close: [] }>();

const store = useDataStore();
const { settings } = storeToRefs(useSettingsStore());
const keyword = ref('');
const selected = ref(props.focusName || '');
const broken = reactive(new Set<string>());

watch(
  () => props.focusName,
  name => {
    if (name) selected.value = name;
  },
  { immediate: true },
);

const members = computed(() => {
  const roster = asRecord(_.get(store.data, '成员名册', {}));
  return Object.entries(roster)
    .map(([name, d]) => ({
      name,
      role: String(_.get(d, '职务', '待初始化')),
      loc: String(_.get(d, '当前位置', '待初始化')),
      present: isPresent(_.get(d, '是否在场', false)),
      raw: d,
    }))
    .sort((a, b) => {
      if (settings.value.rosterPreferPresent) {
        const byPresent = Number(b.present) - Number(a.present);
        if (byPresent !== 0) return byPresent;
      }
      return a.name.localeCompare(b.name, 'zh');
    });
});

const filteredMembers = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return members.value;
  return members.value.filter(
    m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.loc.toLowerCase().includes(q),
  );
});

watch(filteredMembers, list => {
  if (!list.some(m => m.name === selected.value)) {
    selected.value = list[0]?.name || '';
  }
});

const detail = computed(() => {
  const m = members.value.find(x => x.name === selected.value);
  if (!m) return null;
  const d = m.raw;
  const like = Number(_.get(d, '好感度', 0)) || 0;
  const loyal = Number(_.get(d, '忠诚度', 0)) || 0;
  const body = asRecord(_.get(d, '身体状况', {}));
  const outfitObj = asRecord(_.get(d, '着装', {}));
  const bag = Object.entries(asRecord(_.get(d, '背包物品', {})))
    .map(([name, item]) => {
      const cnt = Number(_.get(item, '数量', 0)) || 0;
      if (cnt <= 0) return null;
      return { name, desc: String(_.get(item, '描述', '无描述')), badge: cnt > 99 ? '99+' : String(cnt) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return {
    name: m.name,
    role: m.role,
    loc: m.loc,
    present: m.present,
    age: Number(_.get(d, '年龄', 0)) || 0,
    like,
    loyal,
    likePct: toPercent(like),
    loyalPct: toPercent(loyal),
    contrib: (Number(_.get(d, '贡献度', 0)) || 0).toLocaleString('en-US'),
    fund: formatMoney(_.get(d, '资金', 0)),
    shortGoal: String(_.get(d, '短期目标', '无')),
    midGoal: String(_.get(d, '中期目标', '无')),
    nextPlan: String(_.get(d, '之后行程', '无')),
    thought: String(_.get(d, '内心想法', '无')),
    pregnant: Boolean(_.get(d, '是否怀孕', false)),
    portraitMain: String(_.get(d, '立绘状态.主类型', '日常')),
    portraitSub: String(_.get(d, '立绘状态.次类型', '普通')),
    src: resolvePortrait(m.name, _.get(d, '立绘状态', {}), 'card', {
      baseUrl: settings.value.portraitBaseUrl,
      ext: settings.value.portraitExt,
    }),
    body,
    outfit: (['上衣', '下装', '袜', '鞋', '配饰'] as const)
      .map(k => String(outfitObj[k] || ''))
      .filter(v => v && v !== '待初始化'),
    bag,
  };
});
</script>
