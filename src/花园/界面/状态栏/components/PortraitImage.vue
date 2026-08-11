<template>
  <img v-if="currentSrc" :src="currentSrc" :alt="alt" :draggable="draggable" @error="onError" @load="onLoad" />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    candidates: string[];
    alt?: string;
    draggable?: boolean;
  }>(),
  {
    alt: '',
    draggable: false,
  },
);

const emit = defineEmits<{
  broken: [];
  loaded: [src: string];
}>();

const index = ref(0);

const currentSrc = computed(() => {
  const list = props.candidates.filter(Boolean);
  if (!list.length) return '';
  return list[Math.min(index.value, list.length - 1)] || '';
});

watch(
  () => props.candidates.join('|'),
  () => {
    index.value = 0;
  },
);

function onError() {
  const list = props.candidates.filter(Boolean);
  if (index.value < list.length - 1) {
    index.value += 1;
    return;
  }
  emit('broken');
}

function onLoad() {
  if (currentSrc.value) emit('loaded', currentSrc.value);
}
</script>
