<template>
  <section class="panel character-list-wrapper">
    <h3 class="panel-title" style="padding: 0 6px">在场成员</h3>
    <div ref="listEl" class="character-list" :class="{ 'is-dragging': dragging }">
      <article
        v-for="(char, index) in characters"
        :key="char.name"
        class="character-card"
        :class="{ 'fade-in-up': settings.enableEnterAnim, 'danger-glow': char.isDanger }"
        :style="settings.enableEnterAnim ? { animationDelay: `${(0.05 + index * 0.07).toFixed(2)}s` } : undefined"
        @pointerdown="onCardPointerDown(char.name, $event)"
      >
        <div class="portrait-area" :class="{ 'is-broken': brokenPortraits.has(char.name) }">
          <PortraitImage
            :candidates="char.srcs"
            :alt="char.name"
            :draggable="false"
            @broken="brokenPortraits.add(char.name)"
            @loaded="brokenPortraits.delete(char.name)"
          />
          <div class="portrait-fallback">
            {{ char.name }}
            <span style="font-size: 0.7rem; opacity: 0.6">立绘缺失</span>
          </div>
        </div>
        <div class="card-body">
          <div class="card-identity">
            <div class="char-name">
              <span class="cn-name">{{ char.name }}</span>
              <span v-if="char.isDanger" class="loyalty-warn">⚠️</span>
            </div>
            <div class="char-location">{{ char.loc }}</div>
            <div v-if="settings.showThoughts" class="thought-snippet">{{ char.snippet }}</div>
            <div v-else class="thought-snippet"></div>
          </div>
          <div class="progress-with-label">
            <div class="top">
              <span class="name">好感度</span>
              <span class="num font-mono">{{ char.like }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="fill pink animate-in"
                :style="{ width: `${char.likePct}%`, '--target-width': `${char.likePct}%` }"
              ></div>
            </div>
          </div>
          <div class="progress-with-label">
            <div class="top">
              <span class="name">忠诚度</span>
              <span class="num font-mono">{{ char.loyal }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="fill animate-in"
                :class="char.isDanger ? 'danger' : 'gold'"
                :style="{ width: `${char.loyalPct}%`, '--target-width': `${char.loyalPct}%` }"
              ></div>
            </div>
          </div>
        </div>
      </article>
      <div v-if="characters.length === 0" class="roster-empty">当前没有在场的组织成员</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../settings';
import { useDataStore } from '../store';
import { asRecord, isPresent, resolvePortraitCandidates, toPercent } from '../utils';
import PortraitImage from './PortraitImage.vue';

const emit = defineEmits<{ select: [name: string] }>();

const store = useDataStore();
const { settings } = storeToRefs(useSettingsStore());
const brokenPortraits = reactive(new Set<string>());
const listEl = ref<HTMLElement | null>(null);
const dragging = ref(false);

const DRAG_THRESHOLD = 12;

type Gesture = {
  pointerId: number;
  name: string;
  startX: number;
  startScrollLeft: number;
  moved: boolean;
};

let gesture: Gesture | null = null;

type CharCard = {
  name: string;
  loc: string;
  like: number;
  loyal: number;
  likePct: number;
  loyalPct: number;
  isDanger: boolean;
  snippet: string;
  srcs: string[];
};

const characters = computed(() => {
  void settings.value.safeMode;
  const roster = asRecord(_.get(store.data, '成员名册', {}));
  const list: CharCard[] = [];

  Object.entries(roster).forEach(([name, d]) => {
    if (!isPresent(_.get(d, '是否在场', false))) return;
    const like = Number(_.get(d, '好感度', 0)) || 0;
    const loyal = Number(_.get(d, '忠诚度', 0)) || 0;
    const rawThought = String(_.get(d, '内心想法', '') || '');
    const snippet = rawThought && rawThought !== '无' ? `「${rawThought.substring(0, 16)}…」` : '';

    list.push({
      name,
      loc: String(_.get(d, '当前位置', '待初始化')),
      like,
      loyal,
      likePct: toPercent(like),
      loyalPct: toPercent(loyal),
      isDanger: loyal < 0,
      snippet,
      srcs: resolvePortraitCandidates(name, _.get(d, '立绘状态', {}), 'card'),
    });
  });

  return list;
});

watch(
  () => characters.value.map(c => c.srcs[0] || '').join('|'),
  () => brokenPortraits.clear(),
);

onMounted(() => {
  listEl.value?.addEventListener('wheel', onWheel as EventListener, { passive: false });
});

onBeforeUnmount(() => {
  listEl.value?.removeEventListener('wheel', onWheel as EventListener);
  endGesture(false);
});

function detachListeners() {
  window.removeEventListener('pointermove', onPointerMove, true);
  window.removeEventListener('pointerup', onPointerUp, true);
  window.removeEventListener('pointercancel', onPointerCancel, true);
}

function endGesture(open: boolean) {
  const g = gesture;
  gesture = null;
  dragging.value = false;
  detachListeners();
  if (open && g && !g.moved) {
    emit('select', g.name);
  }
}

function onCardPointerDown(name: string, ev: PointerEvent) {
  if (ev.button !== 0 || !listEl.value) return;

  // 若上次手势残留，先清掉
  endGesture(false);

  gesture = {
    pointerId: ev.pointerId,
    name,
    startX: ev.clientX,
    startScrollLeft: listEl.value.scrollLeft,
    moved: false,
  };

  // 用捕获阶段挂在 window，松手在卡片外也能收到
  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerup', onPointerUp, true);
  window.addEventListener('pointercancel', onPointerCancel, true);
}

function onPointerMove(ev: PointerEvent) {
  const g = gesture;
  if (!g || ev.pointerId !== g.pointerId || !listEl.value) return;

  const dx = ev.clientX - g.startX;
  if (!g.moved && Math.abs(dx) > DRAG_THRESHOLD) {
    g.moved = true;
    dragging.value = true;
  }
  if (!g.moved) return;

  listEl.value.scrollLeft = g.startScrollLeft - dx;
  ev.preventDefault();
}

function onPointerUp(ev: PointerEvent) {
  const g = gesture;
  if (!g || ev.pointerId !== g.pointerId) return;
  endGesture(true);
}

function onPointerCancel(ev: PointerEvent) {
  const g = gesture;
  if (!g || ev.pointerId !== g.pointerId) return;
  endGesture(false);
}

function onWheel(ev: WheelEvent) {
  const el = listEl.value;
  if (!el) return;
  if (Math.abs(ev.deltaY) >= Math.abs(ev.deltaX) && ev.deltaY !== 0) {
    ev.preventDefault();
    el.scrollLeft += ev.deltaY;
  }
}
</script>
