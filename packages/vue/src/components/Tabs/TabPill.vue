<script setup lang="ts">
import { computed } from 'vue';
import { useControllableState } from '../../composables/useControllableState';

export interface TabPillItem {
  label: string;
  value: string;
  icon?: unknown;
  disabled?: boolean;
}

const props = defineProps<{
  items: TabPillItem[];
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

const hasIcons = computed(() => props.items.some((item) => !!item.icon));

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
        hasIcons ? $style.withIcon : $style.textOnly,
        item.disabled && $style.itemDisabled,
      ]"
      :disabled="item.disabled"
      @click="!item.disabled && handleSelect(item.value)"
    >
      <span v-if="item.icon" :class="[$style.icon, item.disabled && $style.iconDisabled]">
        <component :is="item.icon" />
      </span>
      <span :class="$style.label">{{ item.label }}</span>
    </button>
  </div>
</template>

<style module src="./TabPill.module.css"></style>
