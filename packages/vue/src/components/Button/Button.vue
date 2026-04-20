<script setup lang="ts">
import { computed, useAttrs, useCssModule, type VNode } from 'vue';

export type ButtonVariant =
  | 'primary'
  | 'primary-outline'
  | 'primary-surface'
  | 'primary-ghost'
  | 'secondary'
  | 'secondary-surface'
  | 'secondary-ghost'
  | 'action'
  | 'action-surface'
  | 'action-ghost'
  | 'accent'
  | 'accent-surface'
  | 'accent-ghost';

export type ButtonSize = 'xs' | 's' | 'm' | 'l';
export type ButtonShape = 'pill' | 'rounded';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    shape?: ButtonShape;
    loading?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'm',
    shape: 'pill',
    loading: false,
    fullWidth: false,
    disabled: false,
  },
);

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const styles = useCssModule();

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  'primary':           'primary',
  'primary-outline':   'primaryOutline',
  'primary-surface':   'primarySurface',
  'primary-ghost':     'primaryGhost',
  'secondary':         'secondary',
  'secondary-surface': 'secondarySurface',
  'secondary-ghost':   'secondaryGhost',
  'action':            'action',
  'action-surface':    'actionSurface',
  'action-ghost':      'actionGhost',
  'accent':            'accent',
  'accent-surface':    'accentSurface',
  'accent-ghost':      'accentGhost',
};

const hasLeft = computed(() => {
  const content = slots.leftIcon?.() as VNode[] | undefined;
  return !!content && content.length > 0;
});
const hasRight = computed(() => {
  const content = slots.rightIcon?.() as VNode[] | undefined;
  return !!content && content.length > 0;
});
const iconOnly = computed(() => {
  const content = slots.default?.() as VNode[] | undefined;
  return !content || content.length === 0;
});

const buttonClass = computed(() => [
  styles.btn,
  styles[props.size],
  styles[props.shape],
  styles[VARIANT_CLASS[props.variant!]],
  hasLeft.value && styles.hasLeft,
  hasRight.value && styles.hasRight,
  iconOnly.value && styles.iconOnly,
  props.fullWidth && styles.fullWidth,
  props.loading && styles.loading,
]);

const slots = defineSlots<{
  default?: () => unknown;
  leftIcon?: () => unknown;
  rightIcon?: () => unknown;
}>();
</script>

<template>
  <button
    type="button"
    v-bind="attrs"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :class="buttonClass"
  >
    <template v-if="loading">
      <svg
        :class="$style.spinner"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M22.3601 12.9996C22.3601 12.0975 22.2325 11.2251 21.9943 10.3996C20.8676 6.4952 17.2674 3.63965 13.0001 3.63965C7.83075 3.63965 3.64014 7.83026 3.64014 12.9996C3.64014 18.169 7.83075 22.3596 13.0001 22.3596C13.8081 22.3596 14.5922 22.2573 15.3401 22.0648"
          stroke="currentColor"
          stroke-width="3.64"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </template>
    <template v-else>
      <span v-if="hasLeft" :class="$style.icon"><slot name="leftIcon" /></span>
      <slot />
      <span v-if="hasRight" :class="$style.icon"><slot name="rightIcon" /></span>
    </template>
  </button>
</template>

<style module src="./Button.module.css"></style>
