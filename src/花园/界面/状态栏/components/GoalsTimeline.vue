<template>
  <section class="fate-thread" aria-label="目标与行程">
    <div class="fate-rail" aria-hidden="true"></div>
    <article v-for="g in goals" :key="g.label" class="fate-beat">
      <span class="fate-node" aria-hidden="true"></span>
      <div class="fate-card">
        <div class="fate-label">{{ g.label }}</div>
        <p class="fate-text">{{ g.text }}</p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  goals: Array<{ label: string; text: string }>;
}>();
</script>

<style scoped>
.fate-thread {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.fate-thread::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.fate-rail {
  position: absolute;
  left: 4px;
  top: 16px;
  bottom: 16px;
  width: 1px;
  background: rgba(0, 0, 0, 0.08);
  pointer-events: none;
}

.fate-beat {
  position: relative;
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  transition:
    opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),
    filter 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.fate-node {
  position: relative;
  z-index: 1;
  width: 9px;
  height: 9px;
  margin-top: 14px;
  border-radius: 50%;
  border: 1px solid rgba(160, 140, 142, 0.38);
  background: rgba(255, 255, 255, 0.4);
  box-shadow: none;
  transition:
    border-color 0.45s cubic-bezier(0.25, 0.1, 0.25, 1),
    box-shadow 0.45s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.fate-node::after {
  content: '';
  position: absolute;
  inset: 1.5px;
  border-radius: 50%;
  background: #f4c2c2;
  box-shadow: 0 0 8px rgba(244, 194, 194, 0.6);
  opacity: 0;
  transform: scale(0.35);
  transition:
    opacity 0.45s cubic-bezier(0.25, 0.1, 0.25, 1),
    transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.fate-card {
  min-width: 0;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.35);
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.6);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 6px 16px rgba(160, 130, 140, 0.04);
  transition:
    transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1),
    box-shadow 0.45s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.fate-label {
  margin-bottom: 6px;
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 2px;
  color: rgba(120, 110, 110, 0.6);
}

.fate-text {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.02em;
  color: #5a5555;
}

.fate-thread:hover .fate-beat:not(:hover) {
  opacity: 0.6;
  filter: grayscale(20%);
}

.fate-beat:hover .fate-card {
  transform: translateX(6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.fate-beat:hover .fate-node {
  border-color: rgba(244, 194, 194, 0.8);
  box-shadow: 0 0 6px rgba(244, 194, 194, 0.35);
}

.fate-beat:hover .fate-node::after {
  opacity: 1;
  transform: scale(1);
}

@media (hover: none) {
  .fate-thread:hover .fate-beat:not(:hover) {
    opacity: 1;
    filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fate-beat,
  .fate-card,
  .fate-node,
  .fate-node::after {
    transition-duration: 0.15s !important;
  }

  .fate-beat:hover .fate-card {
    transform: none;
  }
}
</style>
