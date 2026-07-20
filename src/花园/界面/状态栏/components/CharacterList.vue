<template>
  <section class="panel character-list-wrapper">
    <h3 class="panel-title" style="padding: 0 6px">在场成员</h3>
    <div class="character-list">
      <article
        v-for="(char, index) in characters"
        :key="char.name"
        class="character-card"
        :class="{ 'fade-in-up': settings.enableEnterAnim, 'danger-glow': char.isDanger }"
        :style="settings.enableEnterAnim ? { animationDelay: `${(0.05 + index * 0.07).toFixed(2)}s` } : undefined"
        @click="emit('select', char.name)"
      >
        <div class="portrait-area" :class="{ 'is-broken': brokenPortraits.has(char.name) }">
          <img :src="char.src" :alt="char.name" @error="brokenPortraits.add(char.name)" />
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
              <div class="fill pink animate-in" :style="{ '--target-width': `${char.likePct}%` }"></div>
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
                :style="{ '--target-width': `${char.loyalPct}%` }"
              ></div>
            </div>
          </div>
        </div>
      </article>
      <div v-if="characters.length === 0" style="opacity: 0.5; padding: 20px; margin: auto">
        当前没有在宅邸内的组织成员
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../settings';
import { useDataStore } from '../store';
import { asRecord, isPresent, resolvePortrait, toPercent } from '../utils';

const emit = defineEmits<{ select: [name: string] }>();

const store = useDataStore();
const { settings } = storeToRefs(useSettingsStore());
const brokenPortraits = reactive(new Set<string>());

type CharCard = {
  name: string;
  loc: string;
  like: number;
  loyal: number;
  likePct: number;
  loyalPct: number;
  isDanger: boolean;
  snippet: string;
  src: string;
};

const characters = computed(() => {
  const baseUrl = settings.value.portraitBaseUrl;
  const ext = settings.value.portraitExt;
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
      src: resolvePortrait(name, _.get(d, '立绘状态', {}), 'card', { baseUrl, ext }),
    });
  });

  return list;
});

watch(
  () => characters.value.map(c => c.src).join('|'),
  () => brokenPortraits.clear(),
);
</script>
