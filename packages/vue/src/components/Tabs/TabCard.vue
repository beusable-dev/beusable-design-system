<script setup lang="ts">
import { useControllableState } from '../../composables/useControllableState';

export interface TabCardItem {
  label: string;
  value: string;
  color?: 'primary' | 'accent';
  icon?: unknown;
}

const props = defineProps<{
  items: TabCardItem[];
  modelValue?: string;
  defaultValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const { value: currentValue, setValue } = useControllableState(
  () => props.modelValue,
  props.defaultValue ?? props.items[0]?.value ?? '',
  (value) => {
    emit('update:modelValue', value);
    emit('change', value);
  },
);

function handleSelect(itemValue: string) {
  setValue(itemValue);
}
</script>

<template>
  <div :class="$style.wrapper" role="tablist">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      role="tab"
      :aria-selected="currentValue === item.value"
      :class="[
        $style.card,
        $style[item.color ?? 'primary'],
      ]"
      @click="handleSelect(item.value)"
    >
      <span :class="$style.label">{{ item.label }}</span>
      <span :class="$style.arrow">
        <component :is="item.icon" v-if="item.icon" />
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>
  </div>
</template>

<style module src="./TabCard.module.css"></style>
