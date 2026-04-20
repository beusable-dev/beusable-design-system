<script setup lang="ts">
import { useControllableState } from '../../composables/useControllableState';

export interface SegmentItem {
  label: string;
  value: string;
  icon?: unknown;
  disabled?: boolean;
}

export type SegmentControlSize = 's' | 'm';

const props = withDefaults(
  defineProps<{
    items: SegmentItem[];
    modelValue?: string;
    defaultValue?: string;
    size?: SegmentControlSize;
  }>(),
  {
    size: 's',
  },
);

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
  <div :class="[$style.wrapper, $style[size]]" role="tablist">
    <button
      v-for="(item, index) in items"
      :key="item.value"
      type="button"
      role="tab"
      :aria-selected="currentValue === item.value"
      :class="[
        $style.item,
        currentValue === item.value && $style.selected,
        index === 0 && $style.first,
        index === items.length - 1 && $style.last,
        item.disabled && $style.itemDisabled,
      ]"
      :disabled="item.disabled"
      @click="!item.disabled && handleSelect(item.value)"
    >
      <span v-if="currentValue === item.value" :class="$style.selectedBg" />
      <span v-if="item.icon" :class="$style.icon">
        <component :is="item.icon" />
      </span>
      <span :class="$style.label">{{ item.label }}</span>
    </button>
  </div>
</template>

<style module src="./SegmentControl.module.css"></style>
