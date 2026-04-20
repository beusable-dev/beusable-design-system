<script setup lang="ts">
import { computed, ref, useId, onMounted, onUnmounted } from 'vue';
import { useControllableState } from '../../composables/useControllableState';

export type RadioSize = 's' | 'm' | 'l';
export type RadioColor = 'primary' | 'secondary' | 'action';

const COLOR_MAP: Record<RadioColor, string> = {
  primary: '#EC0047',
  secondary: '#2f2f2f',
  action: '#57ab00',
};

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    label?: string;
    size?: RadioSize;
    color?: RadioColor;
    name?: string;
    value?: string;
    id?: string;
  }>(),
  {
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
const inputRef = ref<HTMLInputElement | null>(null);

const { value: isChecked, setValue } = useControllableState(
  () => props.modelValue,
  props.defaultChecked ?? false,
  (v) => {
    emit('update:modelValue', v);
    emit('change', v);
  },
);

const selectionColor = computed(() => COLOR_MAP[props.color]);

function handleChange(e: Event) {
  setValue((e.target as HTMLInputElement).checked);
}

// 같은 name 그룹에서 다른 Radio 선택 시 이 Radio 해제 (uncontrolled 모드)
function handleGroupChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (
    target.type === 'radio' &&
    target.name === props.name &&
    target !== inputRef.value &&
    props.modelValue === undefined
  ) {
    setValue(false);
  }
}

onMounted(() => {
  if (props.name) document.addEventListener('change', handleGroupChange);
});
onUnmounted(() => {
  if (props.name) document.removeEventListener('change', handleGroupChange);
});
</script>

<template>
  <label
    :for="id"
    :class="[$style.wrapper, $style[size], disabled && $style.disabled]"
    :style="{ '--selection-color': selectionColor }"
  >
    <input
      :id="id"
      ref="inputRef"
      type="radio"
      :class="$style.input"
      :checked="isChecked"
      :disabled="disabled"
      :name="name"
      :value="value"
      @change="handleChange"
    />
    <span
      :class="[
        $style.control,
        isChecked && $style.checked,
        disabled && $style.controlDisabled,
      ]"
    >
      <span v-if="isChecked" :class="$style.dot" />
    </span>
    <span v-if="label" :class="$style.label">{{ label }}</span>
  </label>
</template>

<style module src="./Radio.module.css"></style>
