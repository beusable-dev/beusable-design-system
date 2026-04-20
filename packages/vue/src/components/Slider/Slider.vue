<script setup lang="ts">
import { computed, useId } from 'vue';
import { useControllableState } from '../../composables/useControllableState';

export type SliderVariant = 'extended' | 'simplified';

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    variant?: SliderVariant;
    disabled?: boolean;
    id?: string;
  }>(),
  {
    defaultValue: 0,
    min: 0,
    max: 100,
    step: 1,
    variant: 'extended',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: number];
  change: [value: number];
}>();

const autoId = useId();
const id = computed(() => props.id ?? autoId);

const { value: currentValue, setValue } = useControllableState(
  () => props.modelValue,
  props.defaultValue,
  (v) => {
    emit('update:modelValue', v);
    emit('change', v);
  },
);

const percentage = computed(() =>
  props.max === props.min
    ? 0
    : ((currentValue.value - props.min) / (props.max - props.min)) * 100,
);

function updateValue(newValue: number) {
  const clamped = Math.min(props.max, Math.max(props.min, newValue));
  const stepped = Math.round((clamped - props.min) / props.step) * props.step + props.min;
  setValue(Math.min(props.max, Math.max(props.min, stepped)));
}

function handleInputChange(e: Event) {
  updateValue(Number((e.target as HTMLInputElement).value));
}

function handleDecrement() {
  if (!props.disabled) updateValue(currentValue.value - props.step);
}

function handleIncrement() {
  if (!props.disabled) updateValue(currentValue.value + props.step);
}
</script>

<template>
  <div
    :class="[
      $style.wrapper,
      $style[variant],
      disabled && $style.disabled,
    ]"
  >
    <button
      v-if="variant === 'extended'"
      type="button"
      :class="$style.iconButton"
      :disabled="disabled"
      aria-label="Decrease"
      @click="handleDecrement"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5.5" width="8" height="1" rx="0.5" fill="currentColor" />
      </svg>
    </button>

    <div :class="$style.trackArea">
      <div :class="$style.track" />
      <div :class="$style.handle" :style="{ left: `${percentage}%` }" />
      <input
        :id="id"
        type="range"
        :class="$style.input"
        :min="min"
        :max="max"
        :step="step"
        :value="currentValue"
        :disabled="disabled"
        @input="handleInputChange"
      />
    </div>

    <button
      v-if="variant === 'extended'"
      type="button"
      :class="$style.iconButton"
      :disabled="disabled"
      aria-label="Increase"
      @click="handleIncrement"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5.5" width="8" height="1" rx="0.5" fill="currentColor" />
        <rect x="5.5" y="2" width="1" height="8" rx="0.5" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>

<style module src="./Slider.module.css"></style>
