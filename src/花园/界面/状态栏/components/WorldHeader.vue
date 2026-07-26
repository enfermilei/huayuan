<template>
  <header class="world-header" :class="[mood, `period-${period}`, `weather-${weatherKind}`, { weekend: weekend }]">
    <div class="world-header-glow" aria-hidden="true"></div>

    <div class="world-info-pill pill-date" :class="{ weekend: weekend }" style="--pill-i: 0">
      <div class="pill-sheen" aria-hidden="true"></div>
      <div class="pill-icon icon-date" aria-hidden="true">
        <span class="wh-glyph wh-date">
          <span class="wh-date-bind"></span>
          <span class="wh-date-page"></span>
          <span class="wh-date-lines"></span>
          <span class="wh-date-dot"></span>
        </span>
      </div>
      <div class="pill-text">
        <span class="pill-label">DATE</span>
        <span class="pill-value">{{ date }}</span>
      </div>
    </div>

    <div class="world-info-pill pill-time" :class="`period-${period}`" style="--pill-i: 1">
      <div class="pill-sheen" aria-hidden="true"></div>
      <div class="pill-icon icon-time" :class="`t-${period}`" aria-hidden="true">
        <span class="wh-glyph wh-time">
          <span class="wh-time-halo"></span>
          <span v-if="period === 'day' || period === 'evening'" class="wh-time-rays"></span>
          <span v-if="period === 'night' || period === 'latenight'" class="wh-time-stars">
            <i></i>
            <i></i>
            <i></i>
          </span>
          <span class="wh-time-core"></span>
        </span>
      </div>
      <div class="pill-text">
        <span class="pill-label">
          TIME
          <em class="pill-hint">{{ periodHint }}</em>
        </span>
        <span class="pill-value">{{ time }}</span>
      </div>
    </div>

    <div class="world-info-pill pill-week" :class="{ weekend: weekend }" style="--pill-i: 2">
      <div class="pill-sheen" aria-hidden="true"></div>
      <div class="pill-icon icon-week" :style="{ '--week-i': weekI }" aria-hidden="true">
        <span class="wh-glyph wh-week">
          <span class="wh-week-ring"></span>
          <span
            v-for="i in 7"
            :key="i"
            class="wh-week-mark"
            :class="{ active: weekI === i - 1 }"
            :style="{ '--i': i - 1 }"
          ></span>
        </span>
      </div>
      <div class="pill-text">
        <span class="pill-label">WEEK</span>
        <span class="pill-value">{{ week }}</span>
      </div>
    </div>

    <div class="world-info-pill pill-weather" :class="`w-${weatherKind}`" style="--pill-i: 3">
      <div class="pill-sheen" aria-hidden="true"></div>
      <div class="pill-icon icon-weather" :class="`w-${weatherKind}`" aria-hidden="true">
        <span class="wh-glyph" :class="`wh-weather-${weatherKind}`">
          <span class="wh-w-a"></span>
          <span class="wh-w-b"></span>
          <span class="wh-w-c"></span>
        </span>
      </div>
      <div class="pill-text">
        <span class="pill-label">WEATHER</span>
        <span class="pill-value">{{ weather }}</span>
      </div>
    </div>

    <div
      class="world-info-pill pill-temp"
      :class="`temp-${tempKind}`"
      :style="{ '--pill-i': 4, '--temp-level': tempFill }"
    >
      <div class="pill-sheen" aria-hidden="true"></div>
      <div class="pill-icon icon-temp" :class="`temp-${tempKind}`" aria-hidden="true">
        <span class="wh-glyph wh-temp">
          <span class="wh-temp-ring"></span>
          <span class="wh-temp-core">
            <span class="wh-temp-mercury"></span>
          </span>
        </span>
      </div>
      <div class="pill-text">
        <span class="pill-label">TEMP</span>
        <span class="pill-value font-mono" :class="tempTextClass">{{ temp }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useDataStore } from '../store';
import {
  classifyPeriod,
  classifyTemp,
  classifyWeather,
  headerMood,
  isWeekend,
  periodLabel,
  tempLevel,
  weekIndex,
} from '../worldAtmosphere';

const store = useDataStore();

const date = computed(() => String(_.get(store.data, '系统.日期', '未知')));
const week = computed(() => String(_.get(store.data, '系统.星期', '未知')));
const time = computed(() => String(_.get(store.data, '系统.时间', '未知')));
const weather = computed(() => String(_.get(store.data, '系统.天气', '未知')));
const temp = computed(() => String(_.get(store.data, '系统.温度', '未知°')));
/** 若卡内有「时段」字段则优先，否则用时间字符串推断 */
const periodRaw = computed(() => String(_.get(store.data, '系统.时段', '') || time.value));

const weatherKind = computed(() => classifyWeather(weather.value));
const period = computed(() => classifyPeriod(periodRaw.value, time.value));
const tempKind = computed(() => classifyTemp(temp.value));
const mood = computed(() => headerMood(period.value, weatherKind.value));
const weekI = computed(() => weekIndex(week.value));
const weekend = computed(() => isWeekend(week.value));
const periodHint = computed(() => periodLabel(period.value));
const tempFill = computed(() => tempLevel(temp.value).toFixed(3));

const tempTextClass = computed(() => {
  if (tempKind.value === 'hot') return 'text-temp-hot';
  if (tempKind.value === 'cold') return 'text-temp-cold';
  return 'text-temp-normal';
});
</script>
