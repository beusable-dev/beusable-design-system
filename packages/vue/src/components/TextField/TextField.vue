<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { useCountdownTimer } from '../../composables/useCountdownTimer';

export type TextFieldLayout = 'vertical' | 'horizontal';
export type TextFieldSize = 's' | 'm' | 'l';
export type TextFieldTheme = 'light' | 'dark';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultValue?: string;
    label?: string;
    size?: TextFieldSize;
    layout?: TextFieldLayout;
    theme?: TextFieldTheme;
    errorMessage?: string;
    message?: string;
    clearable?: boolean;
    valid?: boolean;
    timer?: string;
    timerSeconds?: number;
    multiline?: boolean;
    maxLength?: number;
    showCount?: boolean;
    rows?: number;
    disabled?: boolean;
    placeholder?: string;
    type?: string;
    id?: string;
    name?: string;
    readonly?: boolean;
  }>(),
  {
    size: 'm',
    layout: 'vertical',
    theme: 'light',
    clearable: false,
    valid: false,
    multiline: false,
    showCount: false,
    rows: 4,
    disabled: false,
    type: 'text',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
  clear: [];
  timerEnd: [];
}>();

const autoId = useId();
const id = computed(() => props.id ?? autoId);

const focused = ref(false);
const showPassword = ref(false);

const isPassword = computed(() => props.type === 'password');
const inputType = computed(() => {
  if (!isPassword.value) return props.type;
  return showPassword.value ? 'text' : 'password';
});

const { displayTimer: countdownTimer } = useCountdownTimer(
  () => props.timerSeconds,
  () => emit('timerEnd'),
);

const displayTimer = computed(() =>
  props.timerSeconds != null ? countdownTimer.value : props.timer,
);

// internal value for uncontrolled mode
const internalValue = ref(props.defaultValue ?? '');
const isControlled = computed(() => props.modelValue !== undefined);
const currentValue = computed(() =>
  isControlled.value ? (props.modelValue ?? '') : internalValue.value,
);

const slots = defineSlots<{
  rightIcon?: () => unknown;
}>();

const hasRightIcon = computed(() => {
  const content = slots.rightIcon?.();
  return Array.isArray(content) ? content.length > 0 : !!content;
});

const hasError = computed(() => Boolean(props.errorMessage));
const showClear = computed(
  () =>
    props.clearable &&
    !props.disabled &&
    !props.valid &&
    !displayTimer.value &&
    currentValue.value.length > 0,
);
const showRightSlot = computed(
  () =>
    showClear.value ||
    props.valid ||
    isPassword.value ||
    !!displayTimer.value ||
    hasRightIcon.value,
);

function handleInput(e: Event) {
  const val = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
  if (!isControlled.value) internalValue.value = val;
  emit('update:modelValue', val);
  emit('change', val);
}

function handleClear() {
  if (!isControlled.value) internalValue.value = '';
  emit('update:modelValue', '');
  emit('clear');
}

function togglePassword() {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <div
    :class="[
      $style.root,
      $style[size],
      $style[theme],
      layout === 'horizontal' && $style.horizontal,
    ]"
  >
    <label v-if="label" :for="id" :class="$style.label">{{ label }}</label>

    <div :class="$style.fieldWrap">
      <div
        :class="[
          $style.inputWrap,
          multiline && $style.multiline,
          focused && $style.focused,
          hasError && $style.error,
          valid && $style.valid,
          disabled && $style.disabled,
        ]"
      >
        <!-- multiline -->
        <template v-if="multiline">
          <div :class="$style.textareaInner">
            <textarea
              :id="id"
              :class="[$style.input, $style.textarea]"
              :value="currentValue"
              :disabled="disabled"
              :maxlength="maxLength"
              :rows="rows"
              :placeholder="placeholder"
              :name="name"
              :readonly="readonly"
              @input="handleInput"
              @focus="focused = true"
              @blur="focused = false"
            />
            <p v-if="showCount && maxLength" :class="$style.count">
              ({{ currentValue.length }}/{{ maxLength }})
            </p>
          </div>
        </template>

        <!-- single-line -->
        <template v-else>
          <input
            :id="id"
            :class="$style.input"
            :type="inputType"
            :value="currentValue"
            :disabled="disabled"
            :maxlength="maxLength"
            :placeholder="placeholder"
            :name="name"
            :readonly="readonly"
            @input="handleInput"
            @focus="focused = true"
            @blur="focused = false"
          />

          <div v-if="showRightSlot" :class="$style.iconArea">
            <span v-if="displayTimer" :class="$style.timer">{{ displayTimer }}</span>
            <template v-else-if="valid">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M20.0335 4.54289C20.4182 4.21291 20.9982 4.22118 21.3733 4.57805C21.7483 4.93508 21.7855 5.51445 21.4749 5.91496L21.4085 5.99211L11.3001 16.6093C10.1952 17.7698 8.37327 17.8579 7.16237 16.8085L2.02858 12.3593L1.95534 12.288C1.60798 11.9192 1.58924 11.3404 1.92799 10.9491C2.26713 10.558 2.84352 10.4935 3.25807 10.7851L3.33913 10.8476L8.47291 15.2968C8.87655 15.6464 9.48361 15.6172 9.85182 15.2304L19.9592 4.6132L20.0335 4.54289Z" fill="currentColor" />
              </svg>
            </template>
            <button
              v-else-if="showClear"
              type="button"
              :class="$style.clearBtn"
              aria-label="Clear"
              @click="handleClear"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <span v-else-if="hasRightIcon" :class="$style.slotIcon"><slot name="rightIcon" /></span>
            <button
              v-else-if="isPassword"
              type="button"
              :class="$style.iconBtn"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="togglePassword"
            >
              <!-- eye-off -->
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M7.82827 9.24219C7.30466 10.0327 7.00014 10.9808 7.00014 12C7.00014 14.7614 9.23872 17 12.0001 17C13.0192 16.9999 13.9666 16.6944 14.757 16.1709L16.6359 18.0498C15.2849 18.7104 13.7348 19.1503 12.0001 19.1504C7.44404 19.1504 4.15863 16.1209 2.42006 14.0059C1.44885 12.8243 1.44885 11.1757 2.42006 9.99414C3.18538 9.06312 4.24974 7.95388 5.59096 7.00488L7.82827 9.24219Z" fill="currentColor" />
                <path d="M12.0001 4.84961C16.5562 4.84977 19.8418 7.87918 21.5802 9.99414C22.5513 11.1756 22.5513 12.8244 21.5802 14.0059C20.8149 14.9369 19.7487 16.0441 18.4074 16.9932L16.1701 14.7559C16.6935 13.9655 17.0001 13.0189 17.0001 12C17.0001 9.23868 14.7614 7.00017 12.0001 7C10.981 7 10.0328 7.30457 9.24233 7.82812L7.3644 5.9502C8.71538 5.28962 10.2655 4.84961 12.0001 4.84961Z" fill="currentColor" />
                <path d="M12 9.02051C13.6875 9.02057 15.0557 10.3547 15.0557 12C15.0556 13.6453 13.6875 14.9794 12 14.9795C10.3125 14.9795 8.94441 13.6453 8.94437 12C8.94437 10.3547 10.3125 9.02051 12 9.02051Z" fill="currentColor" />
              </svg>
              <!-- eye -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M12 9.02051C13.6875 9.02057 15.0557 10.3547 15.0557 12C15.0556 13.6453 13.6875 14.9794 12 14.9795C10.3125 14.9795 8.9444 13.6453 8.94436 12C8.94436 10.3547 10.3125 9.02051 12 9.02051Z" fill="currentColor" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4.84961C16.5562 4.84969 19.8416 7.87915 21.5801 9.99414C22.5513 11.1757 22.5513 12.8243 21.5801 14.0059C19.8416 16.1208 16.5562 19.1503 12 19.1504C7.44385 19.1504 4.15849 16.1209 2.41994 14.0059C1.44872 12.8243 1.44872 11.1757 2.41994 9.99414C4.15848 7.87913 7.44383 4.84961 12 4.84961ZM12 7C9.2386 7 7.00002 9.23858 7.00002 12C7.00002 14.7614 9.2386 17 12 17C14.7613 16.9999 17 14.7614 17 12C17 9.23864 14.7613 7.00011 12 7Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </template>
      </div>

      <p v-if="hasError" :class="$style.errorMsg">{{ errorMessage }}</p>
      <p v-else-if="message" :class="$style.msg">{{ message }}</p>
    </div>
  </div>
</template>

<style module src="./TextField.module.css"></style>
