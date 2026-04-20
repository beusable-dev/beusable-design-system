<script setup lang="ts">
import { computed } from 'vue';

export type TooltipArrow =
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'top-left'    | 'top-center'    | 'top-right'
  | 'left'        | 'right';

const ARROW_CLASS: Record<TooltipArrow, string> = {
  'bottom-left':   'arrowBottomLeft',
  'bottom-center': 'arrowBottomCenter',
  'bottom-right':  'arrowBottomRight',
  'top-left':      'arrowTopLeft',
  'top-center':    'arrowTopCenter',
  'top-right':     'arrowTopRight',
  'left':          'arrowLeft',
  'right':         'arrowRight',
};

const props = withDefaults(
  defineProps<{
    content?: string;
    arrow?: TooltipArrow;
    actionLabel?: string;
    linkLabel?: string;
    linkHref?: string;
    textAlign?: 'left' | 'center' | 'justify';
    maxWidth?: number;
    /** close 버튼을 표시할지 여부. @close 이벤트와 함께 사용. */
    closable?: boolean;
  }>(),
  { maxWidth: 500 },
);

const emit = defineEmits<{
  close: [];
  action: [];
}>();

const hasAction = computed(() => !!props.actionLabel);
const hasLink = computed(() => !!(props.linkLabel && props.linkHref));
const arrowClass = computed(() => props.arrow ? ARROW_CLASS[props.arrow] : null);

const SAFE_URL_RE = /^(https?:|mailto:|tel:|\/|#|\.)/i;

const safeLinkHref = computed(() => {
  if (!props.linkHref) return props.linkHref;
  if (SAFE_URL_RE.test(props.linkHref)) return props.linkHref;
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[Tooltip] Unsafe linkHref blocked: "${props.linkHref}"`);
  }
  return '#';
});
</script>

<template>
  <div
    :class="[
      $style.wrapper,
      arrowClass && $style[arrowClass],
      closable && $style.hasClose,
      hasAction && $style.hasAction,
    ]"
    :style="{ maxWidth: `${maxWidth}px` }"
  >
    <span v-if="arrow" :class="$style.arrow" />

    <div
      :class="[$style.content, hasLink && $style.contentWithLink]"
      :style="textAlign ? { textAlign } : undefined"
    >
      <div><slot>{{ content }}</slot></div>
      <a
        v-if="hasLink"
        :href="safeLinkHref"
        :class="$style.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.5 3.5H3.5C2.94772 3.5 2.5 3.94772 2.5 4.5V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H11.5C12.0523 13.5 12.5 13.0523 12.5 12.5V9.5" stroke="#0074FF" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 2.5H13.5V7" stroke="#0074FF" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.5 2.5L7.5 8.5" stroke="#0074FF" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ linkLabel }}</span>
      </a>
    </div>

    <button
      v-if="closable"
      type="button"
      :class="$style.closeBtn"
      aria-label="닫기"
      @click="emit('close')"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L11 11" stroke="#888" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11 3L3 11" stroke="#888" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button
      v-if="hasAction"
      type="button"
      :class="$style.actionBtn"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<style module src="./Tooltip.module.css"></style>
