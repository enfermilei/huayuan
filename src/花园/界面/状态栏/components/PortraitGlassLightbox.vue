<template>
  <Teleport to="body">
    <Transition name="glass-lb">
      <div
        v-if="open"
        ref="rootRef"
        class="portrait-glass-lb"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-label="alt ? `${alt} 立绘预览` : '立绘预览'"
        @click.self="close"
      >
        <button class="portrait-glass-lb__close" type="button" aria-label="关闭立绘预览" @click.stop="close">
          ×
        </button>
        <div ref="stageRef" class="portrait-glass-lb__stage">
          <div class="portrait-glass-lb__card" :style="cardStyle" @click.stop>
            <div class="portrait-glass-lb__glare" :style="glareStyle" aria-hidden="true"></div>
            <div class="portrait-glass-lb__shine" aria-hidden="true"></div>
            <PortraitImage
              class="portrait-glass-lb__img"
              :candidates="candidates"
              :alt="alt"
              @broken="emit('broken')"
              @loaded="src => emit('loaded', src)"
            />
            <div v-if="alt" class="portrait-glass-lb__caption">{{ alt }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import PortraitImage from './PortraitImage.vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    candidates: string[];
    alt?: string;
    /** 最大偏转角（度）；宜小，过大易抖且难用 */
    maxTilt?: number;
  }>(),
  {
    alt: '',
    maxTilt: 7,
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  close: [];
  broken: [];
  loaded: [src: string];
}>();

const rootRef = ref<HTMLElement | null>(null);
const stageRef = ref<HTMLElement | null>(null);

/** 目标 / 当前值：用 rAF 阻尼插值，避免硬切 */
const targetRX = ref(0);
const targetRY = ref(0);
const targetGX = ref(50);
const targetGY = ref(42);
const currRX = ref(0);
const currRY = ref(0);
const currGX = ref(50);
const currGY = ref(42);

let rafId = 0;
let leaveTimer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

const maxTilt = computed(() => Math.min(12, Math.max(3, Number(props.maxTilt) || 7)));

/** 精细指针才启用「移出即关」；触控只靠关闭按钮 / 点遮罩 */
const canHoverClose = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
});

const cardStyle = computed(() => ({
  transform: `rotateX(${currRX.value.toFixed(3)}deg) rotateY(${currRY.value.toFixed(3)}deg) scale(1)`,
}));

const glareStyle = computed(() => ({
  backgroundPosition: `${currGX.value.toFixed(2)}% ${currGY.value.toFixed(2)}%`,
}));

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** smoothstep，边缘更柔、中心更稳 */
function smooth(t: number) {
  const x = clamp(t, -1, 1);
  const a = Math.abs(x);
  const s = a * a * (3 - 2 * a);
  return Math.sign(x) * s;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function tick() {
  // 跟手略快、回正略慢的感觉：统一用 0.14 阻尼
  const k = 0.14;
  currRX.value = lerp(currRX.value, targetRX.value, k);
  currRY.value = lerp(currRY.value, targetRY.value, k);
  currGX.value = lerp(currGX.value, targetGX.value, k);
  currGY.value = lerp(currGY.value, targetGY.value, k);

  const settled =
    Math.abs(currRX.value - targetRX.value) < 0.02 &&
    Math.abs(currRY.value - targetRY.value) < 0.02 &&
    Math.abs(currGX.value - targetGX.value) < 0.05 &&
    Math.abs(currGY.value - targetGY.value) < 0.05;

  if (!settled) {
    rafId = requestAnimationFrame(tick);
  } else {
    currRX.value = targetRX.value;
    currRY.value = targetRY.value;
    currGX.value = targetGX.value;
    currGY.value = targetGY.value;
    rafId = 0;
  }
}

function ensureAnim() {
  if (!rafId) rafId = requestAnimationFrame(tick);
}

/**
 * 相对「未旋转的舞台」算倾角，避免 getBoundingClientRect 随 3D 变形反馈抖动。
 * 指针在舞台外 → 仅桌面悬停模式准备关闭。
 */
function applyPointer(clientX: number, clientY: number) {
  const stage = stageRef.value;
  if (!stage) return;

  const rect = stage.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const pad = 8;
  const inside =
    clientX >= rect.left - pad &&
    clientX <= rect.right + pad &&
    clientY >= rect.top - pad &&
    clientY <= rect.bottom + pad;

  if (!inside) {
    resetTilt();
    if (canHoverClose.value) scheduleClose();
    return;
  }

  cancelClose();

  // 相对舞台中心 -1..1（不随卡片旋转改变）
  const nx = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
  const ny = clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);

  // 左 → rotateY 负；上 → rotateX 正；smoothstep 削弱边缘猛甩
  targetRY.value = smooth(nx) * maxTilt.value;
  targetRX.value = smooth(-ny) * maxTilt.value;
  targetGX.value = (nx * 0.5 + 0.5) * 100;
  targetGY.value = (ny * 0.5 + 0.5) * 100;
  ensureAnim();
}

function resetTilt() {
  targetRX.value = 0;
  targetRY.value = 0;
  targetGX.value = 50;
  targetGY.value = 42;
  ensureAnim();
}

function scheduleClose() {
  if (leaveTimer) return;
  // 极短宽限，避免边缘 1px 抖动误关
  leaveTimer = setTimeout(() => {
    leaveTimer = null;
    close();
  }, 60);
}

function cancelClose() {
  if (!leaveTimer) return;
  clearTimeout(leaveTimer);
  leaveTimer = null;
}

function onPointerMove(e: PointerEvent) {
  applyPointer(e.clientX, e.clientY);
}

function close() {
  cancelClose();
  resetTilt();
  emit('update:open', false);
  emit('close');
}

function bindListeners() {
  if (listening) return;
  listening = true;
  window.addEventListener('pointermove', onPointerMove, { passive: true });
}

function unbindListeners() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('pointermove', onPointerMove);
}

watch(
  () => props.open,
  open => {
    if (!open) {
      cancelClose();
      unbindListeners();
      resetTilt();
      currRX.value = 0;
      currRY.value = 0;
      currGX.value = 50;
      currGY.value = 42;
      return;
    }
    void nextTick(() => {
      rootRef.value?.focus?.();
      bindListeners();
    });
  },
);

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) close();
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  unbindListeners();
  cancelClose();
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped>
.portrait-glass-lb {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: grid;
  place-items: center;
  padding: clamp(8px, 2%, 20px);
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  outline: none;
  cursor: zoom-out;
}

.portrait-glass-lb__close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10051;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background: rgba(12, 16, 24, 0.55);
  color: rgba(255, 255, 255, 0.95);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  -webkit-tap-highlight-color: transparent;
}

.portrait-glass-lb__close:active {
  transform: scale(0.94);
}

.portrait-glass-lb__stage {
  /* 相对浮层尺寸，避免宿主 vh 把卡片撑破 iframe */
  width: min(96%, 560px);
  max-height: 92%;
  perspective: 1200px;
  perspective-origin: 50% 42%;
  transform-style: preserve-3d;
}

.portrait-glass-lb__card {
  position: relative;
  width: 100%;
  aspect-ratio: 832 / 1216;
  max-height: 92%;
  margin: 0 auto;
  border-radius: clamp(16px, 4vw, 28px);
  border: 1px solid rgba(255, 255, 255, 0.32);
  background: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 30px 70px rgba(0, 0, 0, 0.55),
    0 8px 24px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transform-style: preserve-3d;
  will-change: transform;
  cursor: default;
  /* 倾角由 JS lerp 驱动，不再用硬 transition 抢控制权 */
  transition: box-shadow 0.35s ease;
}

.portrait-glass-lb__glare {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  border-radius: inherit;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.16) 30%,
    rgba(255, 255, 255, 0) 60%
  );
  background-repeat: no-repeat;
  background-size: 160% 160%;
  mix-blend-mode: soft-light;
  opacity: 0.85;
}

.portrait-glass-lb__shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  border-radius: inherit;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.08) 36%,
    rgba(255, 255, 255, 0) 64%
  );
}

:deep(.portrait-glass-lb__img) {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  transform: translateZ(20px);
}

.portrait-glass-lb__caption {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 4;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(12, 16, 24, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.94);
  font-size: clamp(12px, 3.5vw, 14px);
  letter-spacing: 0.04em;
  text-align: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: none;
  transform: translateZ(28px);
}

.glass-lb-enter-active,
.glass-lb-leave-active {
  transition: opacity 0.32s ease;
}

.glass-lb-enter-active .portrait-glass-lb__card,
.glass-lb-leave-active .portrait-glass-lb__card {
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease;
}

.glass-lb-enter-from,
.glass-lb-leave-to {
  opacity: 0;
}

.glass-lb-enter-from .portrait-glass-lb__card,
.glass-lb-leave-to .portrait-glass-lb__card {
  opacity: 0;
  transform: scale(0.9) translateY(12px);
}

@media (max-width: 420px) {
  .portrait-glass-lb {
    padding: 8px;
  }

  .portrait-glass-lb__close {
    top: 8px;
    right: 8px;
    width: 40px;
    height: 40px;
  }

  .portrait-glass-lb__stage {
    width: min(98%, 560px);
  }
}
</style>
