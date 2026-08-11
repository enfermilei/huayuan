<template>
  <!-- 着装槽位剪影：描边图标，跟随 currentColor；动效由外层 .outfit-item:hover 触发 -->
  <svg class="outfit-glyph" :class="`glyph-${slot}`" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <!-- 上衣：短袖圆领 -->
    <g
      v-if="slot === '上衣'"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M8.2 5.2 C9.1 4.2 10.4 3.6 12 3.6 C13.6 3.6 14.9 4.2 15.8 5.2" />
      <path d="M8.2 5.2 L5.2 7.4 L7.1 10.1 L9.2 8.6 L9.2 19.4 L14.8 19.4 L14.8 8.6 L16.9 10.1 L18.8 7.4 L15.8 5.2" />
      <path d="M9.6 5.6 C10.2 6.5 11 7 12 7 C13 7 13.8 6.5 14.4 5.6" />
    </g>

    <!-- 下装：宽松长裤 + 腰绳 -->
    <g
      v-else-if="slot === '下装'"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M8 5.2 H16 L17.2 20.2 H13.4 L12 12.6 L10.6 20.2 H6.8 Z" />
      <path d="M8.4 5.2 C9.2 6.4 10.5 7.1 12 7.1 C13.5 7.1 14.8 6.4 15.6 5.2" />
      <path d="M15.8 5.8 C17.2 6.1 18.4 6.8 18.8 8.1" />
    </g>

    <!-- 袜：裸足轮廓 -->
    <g
      v-else-if="slot === '袜'"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M8.2 4.8 V12.2 C8.2 13.4 7.6 14.4 6.6 15.1 L5.2 16.1 C4.2 16.8 3.8 18.1 4.2 19.3 C4.6 20.4 5.6 21.1 6.8 21.1 H14.4 C16.6 21.1 18.4 19.3 18.4 17.1 V14.8 C18.4 13.4 17.7 12.1 16.5 11.5 L14.8 10.7 V4.8"
      />
      <path d="M8.2 4.8 H14.8" />
      <path d="M10.2 16.8 H12.6" opacity="0.55" />
      <path d="M10.6 18.6 H13.4" opacity="0.45" />
    </g>

    <!-- 鞋：简洁拖鞋 -->
    <g
      v-else-if="slot === '鞋'"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M4.6 15.2 C5.2 13.4 6.8 12.2 9.2 12.2 H14.8 C17.6 12.2 19.4 13.8 19.6 16.2 C19.7 17.4 18.8 18.4 17.6 18.4 H6.4 C5.2 18.4 4.4 17.2 4.6 15.2 Z"
      />
      <path d="M8.2 12.2 C9.4 10.4 11.2 9.4 13.4 9.6 C14.6 9.7 15.5 10.6 15.8 12.2" />
      <path d="M6.2 15.6 H17.8" opacity="0.45" />
    </g>

    <!-- 配饰：项链环 + 吊坠 -->
    <g v-else fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="12" cy="8.2" rx="6.4" ry="3.2" />
      <path d="M12 11.4 V14.2" />
      <path d="M12 14.2 L10.2 17.6 H13.8 Z" />
      <circle cx="7.2" cy="18.8" r="1.35" />
      <circle cx="16.8" cy="18.8" r="1.35" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import type { OutfitSlot } from '../utils';

defineProps<{
  slot: OutfitSlot;
}>();
</script>
