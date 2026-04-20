<script setup lang="ts">
export type SnackbarVariant = 'notice' | 'tip' | 'alert';
export type SnackbarSize = 's' | 'm';

withDefaults(
  defineProps<{
    variant?: SnackbarVariant;
    size?: SnackbarSize;
    message: string;
    actionLabel?: string;
    rounded?: boolean;
    icon?: string;
    /** close 버튼을 표시할지 여부. @close 이벤트와 함께 사용. */
    closable?: boolean;
  }>(),
  {
    variant: 'notice',
    size: 's',
    rounded: true,
  },
);

const emit = defineEmits<{
  action: [];
  close: [];
}>();
</script>

<template>
  <div
    :class="[
      $style.wrapper,
      $style[variant],
      $style[size],
      rounded && $style.rounded,
    ]"
  >
    <span :class="$style.icon">
      <i v-if="icon" :class="`icon ${icon}`" aria-hidden="true" />
      <template v-else-if="variant === 'notice'">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z" fill="white"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M10 4.5C7.79086 4.5 6 6.11177 6 8.1C6 12.3 4.5 13.5 4.5 13.5H15.5C15.5 13.5 14 12.3 14 8.1C14 6.11177 12.2091 4.5 10 4.5Z" stroke="#0E90A5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8.55035 13.9862C8.55581 14.3628 8.7022 14.7377 8.98953 15.025C9.57531 15.6108 10.5251 15.6108 11.1108 15.025C11.412 14.7238 11.5584 14.3265 11.5498 13.9318" stroke="#0E90A5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </template>
      <template v-else-if="variant === 'tip'">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10Z" fill="white"/>
          <path d="M8.56665 7.69238H6.46069V13.5H5.29639V7.69238H3.20898V6.74609H8.56665V7.69238ZM10.6912 13.5H9.52222V6.74609H10.6912V13.5ZM14.7175 6.74609C15.4721 6.74609 16.0712 6.94246 16.515 7.33521C16.9588 7.72795 17.1807 8.24747 17.1807 8.8938C17.1807 9.55559 16.9634 10.0705 16.5289 10.4385C16.0944 10.8065 15.486 10.9905 14.7036 10.9905H13.3074V13.5H12.1338V6.74609H14.7175ZM14.75 7.69238H13.3074V10.0488H14.7175C15.135 10.0488 15.4535 9.95064 15.6731 9.75427C15.8927 9.5579 16.0024 9.27417 16.0024 8.90308C16.0024 8.53817 15.8911 8.24671 15.6685 8.02869C15.4458 7.81067 15.1397 7.69857 14.75 7.69238Z" fill="#0E90A5"/>
        </svg>
      </template>
      <template v-else>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z" fill="white"/>
          <path d="M10 11V5" stroke="#E92020" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 14C9.44772 14 9 14.4477 9 15C9 15.5523 9.44772 16 10 16C10.5523 16 11 15.5523 11 15C11 14.4477 10.5523 14 10 14Z" fill="#E92020"/>
        </svg>
      </template>
    </span>

    <span :class="$style.message">{{ message }}</span>

    <button
      v-if="actionLabel && size === 's'"
      type="button"
      :class="[$style.actionText, $style[`actionText_${variant}`]]"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>

    <button
      v-if="actionLabel && size === 'm'"
      type="button"
      :class="$style.actionBtn"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>

    <button
      v-if="closable"
      type="button"
      :class="$style.closeBtn"
      aria-label="닫기"
      @click="emit('close')"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L11 11" stroke="#444444" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11 3L3 11" stroke="#444444" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<style module src="./Snackbar.module.css"></style>
