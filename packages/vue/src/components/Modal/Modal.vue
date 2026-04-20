<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  width?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const containerRef = ref<HTMLDivElement | null>(null);

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

let previousFocused: HTMLElement | null = null;

function trapFocus(e: KeyboardEvent) {
  if (!props.open) return;
  if (e.key === 'Escape') {
    emit('close');
    return;
  }
  if (e.key !== 'Tab') return;

  const focusable = Array.from(
    containerRef.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
  );
  if (focusable.length === 0) {
    e.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocused = document.activeElement as HTMLElement | null;
      document.addEventListener('keydown', trapFocus);
      await nextTick();
      const firstFocusable =
        containerRef.value?.querySelectorAll<HTMLElement>(FOCUSABLE)[0];
      firstFocusable?.focus();
      return;
    }

    document.removeEventListener('keydown', trapFocus);
    previousFocused?.focus();
    previousFocused = null;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', trapFocus);
  previousFocused?.focus();
});
</script>

<template>
  <div v-if="open" :class="$style.overlay" @click="emit('close')">
    <div
      ref="containerRef"
      role="dialog"
      aria-modal="true"
      :class="$style.modal"
      :style="width ? { width: `${width}px` } : undefined"
      @click.stop
    >
      <slot />
    </div>
  </div>
</template>

<style module src="./Modal.module.css"></style>
