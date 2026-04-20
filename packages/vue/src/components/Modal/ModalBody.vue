<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    fadeout?: boolean;
  }>(),
  {
    fadeout: false,
  },
);

const bodyRef = ref<HTMLDivElement | null>(null);
const showTop = ref(false);
const showBottom = ref(false);

let resizeObserver: ResizeObserver | null = null;

function updateFadeState() {
  const el = bodyRef.value;
  if (!el) return;
  showTop.value = el.scrollTop > 0;
  showBottom.value = Math.ceil(el.scrollTop) + el.clientHeight < el.scrollHeight;
}

function bindScrollable() {
  if (!props.fadeout) return;
  const el = bodyRef.value;
  if (!el) return;
  updateFadeState();
  el.addEventListener('scroll', updateFadeState, { passive: true });
  resizeObserver = new ResizeObserver(updateFadeState);
  resizeObserver.observe(el);
}

function unbindScrollable() {
  const el = bodyRef.value;
  if (el) {
    el.removeEventListener('scroll', updateFadeState);
  }
  resizeObserver?.disconnect();
  resizeObserver = null;
}

onMounted(async () => {
  if (!props.fadeout) return;
  await nextTick();
  bindScrollable();
});

watch(
  () => props.fadeout,
  async (enabled) => {
    unbindScrollable();
    if (enabled) {
      await nextTick();
      bindScrollable();
    }
  },
);

onBeforeUnmount(() => {
  unbindScrollable();
});
</script>

<template>
  <div v-if="!fadeout" :class="$style.body">
    <slot />
  </div>
  <div v-else :class="$style.bodyOuter">
    <div ref="bodyRef" :class="[$style.body, $style.bodyScrollable]">
      <slot />
    </div>
    <div :class="[$style.fadeTop, showTop && $style.fadeVisible]" />
    <div :class="[$style.fadeBottom, showBottom && $style.fadeVisible]" />
  </div>
</template>

<style module src="./Modal.module.css"></style>
