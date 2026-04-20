<script setup lang="ts">
import { computed } from 'vue';

export type ToastStatus = 'complete' | 'caution' | 'normal';
export type ToastType = 'a1' | 'a2' | 'b';

const props = withDefaults(
  defineProps<{
    message: string;
    description?: string;
    status?: ToastStatus;
    type?: ToastType;
    icon?: string;
  }>(),
  {
    status: 'normal',
  },
);

const resolvedType = computed<ToastType>(
  () => props.type ?? (props.description ? 'b' : props.icon !== undefined ? 'a1' : 'a2'),
);
</script>

<template>
  <div
    :class="[$style.toast, $style[status], $style[resolvedType]]"
    role="status"
    aria-live="polite"
  >
    <template v-if="resolvedType === 'b'">
      <div :class="$style.textBlock">
        <span>{{ message }}</span>
        <span v-if="description">{{ description }}</span>
      </div>
    </template>
    <template v-else-if="resolvedType === 'a1'">
      <span :class="$style.message">{{ message }}</span>
      <span :class="$style.iconWrap">
        <i v-if="icon" :class="`icon ${icon}`" aria-hidden="true" />
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2.68359 7.96289L6.7002 11.2734L13.6777 4.30273" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </template>
    <template v-else>
      <span :class="$style.message">{{ message }}</span>
    </template>
  </div>
</template>

<style module src="./Toast.module.css"></style>
