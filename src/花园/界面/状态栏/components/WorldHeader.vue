<template>
  <header class="world-header">
    <div class="world-info-pill">
      <div class="pill-icon icon-date"></div>
      <div class="pill-text">
        <span class="pill-label">DATE</span>
        <span class="pill-value">{{ date }}</span>
      </div>
    </div>
    <div class="world-info-pill">
      <div class="pill-icon icon-time" :class="timeClass"></div>
      <div class="pill-text">
        <span class="pill-label">TIME</span>
        <span class="pill-value">{{ time }}</span>
      </div>
    </div>
    <div class="world-info-pill">
      <div class="pill-icon icon-week"></div>
      <div class="pill-text">
        <span class="pill-label">WEEK</span>
        <span class="pill-value">{{ week }}</span>
      </div>
    </div>
    <div class="world-info-pill">
      <div class="pill-icon icon-weather" :class="weatherClass"></div>
      <div class="pill-text">
        <span class="pill-label">WEATHER</span>
        <span class="pill-value">{{ weather }}</span>
      </div>
    </div>
    <div class="world-info-pill">
      <div class="pill-icon icon-temp"></div>
      <div class="pill-text">
        <span class="pill-label">TEMP</span>
        <span class="pill-value font-mono" :class="tempCls">{{ temp }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useDataStore } from '../store';
import { tempClass, timeIconClass, weatherIconClass } from '../utils';

const store = useDataStore();

const date = computed(() => String(_.get(store.data, '系统.日期', '未知')));
const week = computed(() => String(_.get(store.data, '系统.星期', '未知')));
const time = computed(() => String(_.get(store.data, '系统.时间', '未知')));
const weather = computed(() => String(_.get(store.data, '系统.天气', '未知')));
const temp = computed(() => String(_.get(store.data, '系统.温度', '未知°')));

const timeClass = computed(() => timeIconClass(time.value));
const weatherClass = computed(() => weatherIconClass(weather.value));
const tempCls = computed(() => tempClass(temp.value));
</script>
