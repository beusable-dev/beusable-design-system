<script setup lang="ts">
import { computed, useId } from 'vue';
import { useControllableState } from '../../composables/useControllableState';

export type ToggleSize = 'm' | 's' | 'xs';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    size?: ToggleSize;
    label?: string;
    showText?: boolean;
    id?: string;
  }>(),
  {
    disabled: false,
    size: 'm',
    showText: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [value: boolean];
}>();

const autoId = useId();
const id = computed(() => props.id ?? autoId);

const { value: isChecked, setValue } = useControllableState(
  () => props.modelValue,
  props.defaultChecked ?? false,
  (v) => {
    emit('update:modelValue', v);
    emit('change', v);
  },
);

function handleChange(e: Event) {
  setValue((e.target as HTMLInputElement).checked);
}
</script>

<template>
  <label
    :for="id"
    :class="[$style.wrapper, disabled && $style.disabled]"
  >
    <input
      :id="id"
      type="checkbox"
      role="switch"
      :class="$style.input"
      :checked="isChecked"
      :disabled="disabled"
      :aria-checked="isChecked"
      @change="handleChange"
    />
    <span
      :class="[
        $style.track,
        $style[size],
        isChecked ? $style.on : $style.off,
        disabled && $style.trackDisabled,
        !showText && $style.noText,
      ]"
    >
      <span v-if="showText" :class="$style.onText">ON</span>
      <span :class="$style.knob" />
      <span v-if="showText" :class="$style.offText">OFF</span>
    </span>
    <span v-if="label" :class="$style.label">{{ label }}</span>
  </label>
</template>

<style module src="./Toggle.module.css"></style>
