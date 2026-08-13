<template>
  <section class="body-veil" aria-label="身体状况">
    <article
      v-for="(part, i) in parts"
      :key="part.key"
      class="body-veil-card"
      :class="{ alert: part.alert, 'is-revealed': revealedKey === part.key }"
      :style="{ '--blush-duration': part.duration, '--blush-delay': `${i * 0.55}s` }"
      tabindex="0"
      @click="onCardActivate(part.key)"
    >
      <header class="body-veil-head">
        <span class="sensual-icon" :data-glyph="part.glyph" aria-hidden="true">
          <svg class="sensual-svg" viewBox="0 0 24 24" focusable="false">
            <!-- 总体：花心 -->
            <g v-if="part.glyph === 'bloom'">
              <path
                d="M12 7.2 C13.2 4.6 16.6 5.2 16.4 8.1 C18.8 7.6 20.2 10.8 17.8 12 C20.2 13.2 18.8 16.4 16.4 15.9 C16.6 18.8 13.2 19.4 12 16.8 C10.8 19.4 7.4 18.8 7.6 15.9 C5.2 16.4 3.8 13.2 6.2 12 C3.8 10.8 5.2 7.6 7.6 8.1 C7.4 5.2 10.8 4.6 12 7.2 Z"
              />
              <circle cx="12" cy="12" r="1.7" />
            </g>
            <!-- 口部：水滴 -->
            <g v-else-if="part.glyph === 'drop'">
              <path d="M12 3.6 C12 3.6 6.8 11.2 6.8 15.1 C6.8 18.1 9.1 20.4 12 20.4 C14.9 20.4 17.2 18.1 17.2 15.1 C17.2 11.2 12 3.6 12 3.6 Z" />
            </g>
            <!-- 胸部：双瓣 -->
            <g v-else-if="part.glyph === 'petal'">
              <path d="M8.6 18.4 C5.4 16.2 4.6 11.4 8.2 8.8 C10.4 7.2 12.2 8.6 12.2 11.4 C12.2 8.6 14 7.2 16.2 8.8 C19.8 11.4 19 16.2 15.8 18.4 C14.2 19.5 12.8 19.6 12.2 18.6 C11.6 19.6 10.2 19.5 8.6 18.4 Z" />
            </g>
            <!-- 小穴：花蕊 -->
            <g v-else-if="part.glyph === 'stamen'">
              <path d="M12 5.2 C13.8 8.2 17.6 8.6 18.4 12 C17.6 15.4 13.8 15.8 12 18.8 C10.2 15.8 6.4 15.4 5.6 12 C6.4 8.6 10.2 8.2 12 5.2 Z" />
              <circle cx="12" cy="12" r="1.55" />
            </g>
            <!-- 足部：露珠 -->
            <g v-else-if="part.glyph === 'dew'">
              <circle cx="12" cy="13.2" r="6.2" />
              <path d="M12 4.4 C12.8 7.2 14.6 9.2 16.6 10.2" fill="none" stroke="currentColor" stroke-width="1.4" />
            </g>
            <!-- 后庭：单瓣丝绸 -->
            <g v-else>
              <path d="M12.2 4.8 C16.8 7.2 19.2 12.4 16.6 16.8 C14.6 20.2 10.2 20.4 8.4 16.6 C6.8 13.2 9.2 8.8 12.2 4.8 Z" />
            </g>
          </svg>
        </span>
        <span class="body-veil-title">{{ part.label }}</span>
      </header>
      <div class="body-veil-secret">
        <p class="body-veil-desc">{{ part.text }}</p>
        <span class="body-veil-hint" aria-hidden="true"></span>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
const BODY_PARTS = [
  { key: '总体', label: '总体', glyph: 'bloom', duration: '5.4s' },
  { key: '口', label: '口部', glyph: 'drop', duration: '4.8s' },
  { key: '胸', label: '胸部', glyph: 'petal', duration: '5.8s' },
  { key: '小穴', label: '小穴', glyph: 'stamen', duration: '4.6s' },
  { key: '足', label: '足部', glyph: 'dew', duration: '6s' },
  { key: '后庭', label: '后庭', glyph: 'silk', duration: '5.2s' },
] as const;

const props = defineProps<{
  body: Record<string, unknown>;
}>();

const revealedKey = ref<string | null>(null);

const parts = computed(() =>
  BODY_PARTS.map(meta => {
    const text = String(props.body?.[meta.key] ?? '未知').trim() || '未知';
    return {
      ...meta,
      text,
      alert: /伤|痛|破|肿|炎|血|危|异常|不适|撕裂/.test(text),
    };
  }),
);

function onCardActivate(key: string) {
  if (typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  revealedKey.value = revealedKey.value === key ? null : key;
}
</script>

<style scoped>
.body-veil {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.body-veil-card {
  --blush-duration: 5.2s;
  --blush-delay: 0s;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  outline: none;
  background: rgba(255, 240, 245, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom-color: rgba(255, 255, 255, 0.2);
  border-right-color: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 10px 25px rgba(220, 140, 160, 0.15),
    inset 0 4px 12px rgba(255, 255, 255, 0.5),
    inset 0 -4px 15px rgba(255, 180, 195, 0.3);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  animation: blushBreathing var(--blush-duration) ease-in-out var(--blush-delay) infinite;
  transition:
    transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),
    border-color 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),
    background 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),
    box-shadow 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.body-veil-card.alert {
  box-shadow:
    0 10px 25px rgba(220, 140, 160, 0.2),
    inset 0 4px 12px rgba(255, 255, 255, 0.45),
    inset 0 -6px 18px rgba(255, 160, 180, 0.42);
}

/* 液体流光：极淡玫瑰丝绸 */
.body-veil-card::before {
  content: '';
  position: absolute;
  inset: -50% -80%;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    118deg,
    transparent 28%,
    rgba(255, 220, 230, 0.18) 42%,
    rgba(255, 182, 193, 0.38) 50%,
    rgba(255, 210, 220, 0.22) 58%,
    transparent 72%
  );
  transform: translateX(-46%) rotate(18deg);
  opacity: 0;
  mix-blend-mode: multiply;
  transition: opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.body-veil-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 36px rgba(255, 182, 193, 0);
  transition: box-shadow 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.body-veil-head,
.body-veil-secret {
  position: relative;
  z-index: 1;
}

.body-veil-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.body-veil-title {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: #4a1d29;
}

.sensual-icon {
  position: relative;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  color: #9a6b79;
  filter: drop-shadow(0 0 3px rgba(220, 160, 180, 0.35));
  transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.sensual-icon::before {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffe4ec 0%, #e8a0b4 55%, transparent 72%);
  box-shadow: 0 0 8px 2px rgba(255, 182, 193, 0.55);
  opacity: 0.85;
}

.sensual-svg {
  position: relative;
  z-index: 1;
  width: 16px;
  height: 16px;
  fill: currentColor;
  opacity: 0.92;
}

.body-veil-secret {
  position: relative;
}

.body-veil-desc {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: 0.04em;
  color: #4a1d29;
  filter: blur(6px);
  opacity: 0.2;
  transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.body-veil-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  font-size: 0.6rem;
  font-weight: 300;
  letter-spacing: 0.16em;
  color: #9a6b79;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.body-veil-hint::before {
  content: '轻抚揭开';
}

.body-veil-card:hover,
.body-veil-card:focus-visible,
.body-veil-card.is-revealed {
  transform: translateY(-2px);
  background: rgba(255, 240, 245, 0.4);
  animation-play-state: paused;
  box-shadow:
    0 16px 36px rgba(220, 140, 160, 0.22),
    inset 0 4px 14px rgba(255, 255, 255, 0.65),
    inset 0 -6px 18px rgba(255, 180, 195, 0.4);
}

.body-veil-card:hover::before,
.body-veil-card:focus-visible::before,
.body-veil-card.is-revealed::before {
  opacity: 1;
  animation: liquidShimmer 3.2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
}

.body-veil-card:hover::after,
.body-veil-card:focus-visible::after,
.body-veil-card.is-revealed::after {
  box-shadow: inset 0 -8px 20px rgba(255, 180, 195, 0.16);
}

.body-veil-card:hover .sensual-icon,
.body-veil-card:focus-visible .sensual-icon,
.body-veil-card.is-revealed .sensual-icon {
  color: #4a1d29;
  filter: drop-shadow(0 0 6px rgba(220, 160, 180, 0.55));
  transform: scale(1.12);
}

.body-veil-card:hover .sensual-icon::before,
.body-veil-card:focus-visible .sensual-icon::before,
.body-veil-card.is-revealed .sensual-icon::before {
  opacity: 1;
  box-shadow: 0 0 12px 3px rgba(255, 182, 193, 0.85);
}

.body-veil-card:hover .body-veil-desc,
.body-veil-card:focus-visible .body-veil-desc,
.body-veil-card.is-revealed .body-veil-desc {
  filter: blur(0);
  opacity: 1;
}

.body-veil-card:hover .body-veil-hint,
.body-veil-card:focus-visible .body-veil-hint,
.body-veil-card.is-revealed .body-veil-hint {
  opacity: 0;
}

@keyframes blushBreathing {
  0%,
  100% {
    box-shadow:
      0 10px 25px rgba(220, 140, 160, 0.15),
      inset 0 4px 12px rgba(255, 255, 255, 0.5),
      inset 0 -4px 15px rgba(255, 180, 195, 0.3);
  }
  50% {
    box-shadow:
      0 12px 30px rgba(220, 140, 160, 0.22),
      inset 0 4px 14px rgba(255, 255, 255, 0.62),
      inset 0 -6px 18px rgba(255, 180, 195, 0.42);
  }
}

@keyframes liquidShimmer {
  0% {
    transform: translateX(-52%) rotate(18deg);
  }
  100% {
    transform: translateX(52%) rotate(18deg);
  }
}

@media (max-width: 720px) {
  .body-veil {
    grid-template-columns: 1fr 1fr;
    padding: 0;
    gap: 8px;
  }
}

@media (hover: none) {
  .body-veil-hint::before {
    content: '点按揭开';
  }
}

@media (prefers-reduced-motion: reduce) {
  .body-veil-card,
  .body-veil-card::before,
  .body-veil-desc,
  .body-veil-hint,
  .sensual-icon {
    animation: none !important;
    transition-duration: 0.2s !important;
  }

  .body-veil-desc {
    filter: blur(3px);
    opacity: 0.35;
  }
}
</style>
