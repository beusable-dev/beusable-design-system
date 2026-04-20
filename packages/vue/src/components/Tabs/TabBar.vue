<script setup lang="ts">
import { useControllableState } from '../../composables/useControllableState';

export interface TabBarItem {
  label: string;
  value: string;
  disabled?: boolean;
}

const props = defineProps<{
  items: TabBarItem[];
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
        $style.item,
        currentValue === item.value && $style.selected,
        item.disabled && $style.itemDisabled,
      ]"
      :disabled="item.disabled"
      @click="!item.disabled && handleSelect(item.value)"
    >
      <span :class="$style.label">{{ item.label }}</span>
      <span :class="$style.bar" />
    </button>
  </div>
</template>

<style module src="./TabBar.module.css"></style>
