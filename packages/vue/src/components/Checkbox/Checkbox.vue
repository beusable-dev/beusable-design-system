<script setup lang="ts">
import { computed, useId } from 'vue';
import { useControllableState } from '../../composables/useControllableState';

export type CheckboxSize = 's' | 'm' | 'l';
export type CheckboxColor = 'primary' | 'secondary' | 'action';

const COLOR_MAP: Record<CheckboxColor, string> = {
  primary: '#EC0047',
  secondary: '#2f2f2f',
  action: '#57ab00',
};

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    label?: string;
    size?: CheckboxSize;
    color?: CheckboxColor;
    name?: string;
    value?: string;
    id?: string;
  }>(),
  {
    indeterminate: false,
    disabled: false,
    size: 'm',
    color: 'primary',
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

const selectionColor = computed(() => COLOR_MAP[props.color]);
</script>

<template>
  <label
    :for="id"
    :class="[$style.wrapper, $style[size], disabled && $style.disabled]"
    :style="{ '--selection-color': selectionColor }"
  >
    <input
      :id="id"
      type="checkbox"
      :class="$style.input"
      :checked="isChecked"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-checked="indeterminate ? 'mixed' : isChecked"
      @change="handleChange"
    />
    <span :class="$style.control">
      <!-- disabled + indeterminate -->
      <svg v-if="disabled && indeterminate" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="1" y="1" width="18" height="18" rx="2" fill="#d7d7d7"/>
        <path d="M6 10H14" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <!-- disabled + checked -->
      <svg v-else-if="disabled && isChecked" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="1" y="1" width="18" height="18" rx="2" fill="#d7d7d7"/>
        <path d="M5 10.5L8.5 14L15.5 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <!-- indeterminate -->
      <svg v-else-if="indeterminate" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13.2503 2.75H2.75V13.2503H13.2503V2.75Z" fill="white"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4448 0.999756H2.5556C1.70002 0.999756 1 1.69978 1 2.55536V13.4446C1 14.3002 1.70002 15.0002 2.5556 15.0002H13.4448C14.3004 15.0002 15.0004 14.3002 15.0004 13.4446V2.55536C15.0004 1.69978 14.3004 0.999756 13.4448 0.999756ZM3.62508 7.12495H12.3754V8.875H3.62508V7.12495Z" fill="var(--selection-color, #EC0047)"/>
      </svg>
      <!-- checked -->
      <svg v-else-if="isChecked" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13.3337 2.66675H2.66699V13.3334H13.3337V2.66675Z" fill="white"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4448 0.999756H2.5556C1.70002 0.999756 1 1.69978 1 2.55536V13.4446C1 14.3002 1.70002 15.0002 2.5556 15.0002H13.4448C14.3004 15.0002 15.0004 14.3002 15.0004 13.4446V2.55536C15.0004 1.69978 14.3004 0.999756 13.4448 0.999756ZM6.50017 11.5001L2.75005 7.71391L3.80009 6.65378L6.50017 9.37982L12.2003 3.62484L13.2504 4.68497L6.50017 11.5001Z" fill="var(--selection-color, #EC0047)"/>
      </svg>
      <!-- empty -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M16.75 3.24999V16.75H3.24999V3.24999H16.75ZM17 1H2.99999C1.9 1 1 1.9 1 2.99999V17C1 18.0999 1.9 18.9999 2.99999 18.9999H17C18.0999 18.9999 18.9999 18.0999 18.9999 17V2.99999C18.9999 1.9 18.0999 1 17 1Z" fill="currentColor"/>
        <path d="M16.75 3.25H3.25V16.75H16.75V3.25Z" fill="var(--cb-inner, white)"/>
      </svg>
    </span>
    <span v-if="label" :class="$style.label">{{ label }}</span>
  </label>
</template>

<style module src="./Checkbox.module.css"></style>
