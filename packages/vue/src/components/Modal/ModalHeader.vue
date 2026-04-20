<script setup lang="ts">
import { computed } from 'vue';

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    closeSize?: 'sm' | 'lg';
    textAlign?: 'left' | 'center';
    titleSize?: 'normal' | 'large';
    step?: number | string;
    /** close 버튼을 표시할지 여부. @close 이벤트와 함께 사용. */
    closable?: boolean;
  }>(),
  {
    closeSize: 'sm',
    textAlign: 'left',
    titleSize: 'normal',
  },
);

const emit = defineEmits<{
  close: [];
}>();

const slots = defineSlots<{
  icon?: () => unknown;
  action?: () => unknown;
}>();

const hasIcon = computed(() => !!slots.icon);
const hasAction = computed(() => !!slots.action);
</script>

<template>
  <div :class="$style.header">
    <template v-if="closeSize === 'sm'">
      <template v-if="hasIcon">
        <div v-if="closable" :class="$style.headerTopSm">
          <button
            type="button"
            :class="$style.closeBtn"
            aria-label="닫기"
            @click="emit('close')"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3L13 13" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 3L3 13" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div :class="$style.headerIconRow">
          <div :class="$style.headerIconEl"><slot name="icon" /></div>
          <div :class="$style.headerIconDivider" />
          <div :class="$style.headerIconBody">
            <div :class="$style.headerIconContent">
              <div
                v-if="title"
                :class="[$style.headerTitleText, titleSize === 'large' && $style.headerTitleTextLarge]"
              >
                {{ title }}
              </div>
              <div v-if="description" :class="$style.headerDesc">{{ description }}</div>
            </div>
            <div v-if="hasAction" :class="$style.headerAction"><slot name="action" /></div>
          </div>
        </div>
      </template>
      <template v-else-if="step !== undefined">
        <div :class="[$style.headerTopSm, $style.headerTopSmStep]">
          <div :class="$style.headerStep">{{ step }}</div>
          <button
            v-if="closable"
            type="button"
            :class="$style.closeBtn"
            aria-label="닫기"
            @click="emit('close')"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3L13 13" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 3L3 13" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div v-if="title || description" :class="[$style.headerContent, textAlign === 'center' && $style.headerContentCenter]">
          <div
            v-if="title"
            :class="[$style.headerTitleText, titleSize === 'large' && $style.headerTitleTextLarge]"
          >
            {{ title }}
          </div>
          <div v-if="description" :class="$style.headerDesc">{{ description }}</div>
        </div>
      </template>
      <template v-else>
        <div v-if="closable" :class="$style.headerTopSm">
          <button
            type="button"
            :class="$style.closeBtn"
            aria-label="닫기"
            @click="emit('close')"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3L13 13" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 3L3 13" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div v-if="title || description" :class="[$style.headerContent, textAlign === 'center' && $style.headerContentCenter]">
          <div
            v-if="title"
            :class="[$style.headerTitleText, titleSize === 'large' && $style.headerTitleTextLarge]"
          >
            {{ title }}
          </div>
          <div v-if="description" :class="$style.headerDesc">{{ description }}</div>
        </div>
      </template>
    </template>

    <template v-else>
      <template v-if="hasIcon">
        <div :class="$style.headerTopLg">
          <div :class="[$style.headerIconRow, $style.headerIconRowLg]">
            <div :class="$style.headerIconEl"><slot name="icon" /></div>
            <div :class="$style.headerIconDivider" />
            <div :class="$style.headerIconBody">
              <div :class="$style.headerIconContent">
                <div
                  v-if="title"
                  :class="[$style.headerTitleText, titleSize === 'large' && $style.headerTitleTextLarge]"
                >
                  {{ title }}
                </div>
                <div v-if="description" :class="$style.headerDesc">{{ description }}</div>
              </div>
              <div v-if="hasAction" :class="$style.headerAction"><slot name="action" /></div>
            </div>
          </div>
          <button
            v-if="closable"
            type="button"
            :class="[$style.closeBtn, $style.closeBtnLg]"
            aria-label="닫기"
            @click="emit('close')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L19 19" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M19 5L5 19" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </template>
      <template v-else-if="step !== undefined">
        <div :class="[$style.headerTopLg, $style.headerTopLgStep]">
          <div :class="$style.headerStepContainer">
            <div :class="$style.headerStep">{{ step }}</div>
          </div>
          <button
            v-if="closable"
            type="button"
            :class="[$style.closeBtn, $style.closeBtnLg]"
            aria-label="닫기"
            @click="emit('close')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L19 19" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M19 5L5 19" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div v-if="title || description" :class="[$style.headerContent, textAlign === 'center' && $style.headerContentCenter]">
          <div
            v-if="title"
            :class="[$style.headerTitleText, titleSize === 'large' && $style.headerTitleTextLarge]"
          >
            {{ title }}
          </div>
          <div v-if="description" :class="$style.headerDesc">{{ description }}</div>
        </div>
      </template>
      <template v-else-if="!title && !description">
        <div :class="$style.headerTopLgOnly">
          <button
            v-if="closable"
            type="button"
            :class="[$style.closeBtn, $style.closeBtnLg]"
            aria-label="닫기"
            @click="emit('close')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L19 19" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M19 5L5 19" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </template>
      <template v-else>
        <div :class="$style.headerTopLg">
          <div
            :class="[
              $style.headerTitleInRow,
              textAlign === 'center' && $style.headerTitleInRowCenter,
              titleSize === 'large' && $style.headerTitleTextLarge,
            ]"
          >
            {{ title }}
          </div>
          <button
            v-if="closable"
            type="button"
            :class="[$style.closeBtn, $style.closeBtnLg]"
            aria-label="닫기"
            @click="emit('close')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L19 19" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M19 5L5 19" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div v-if="description" :class="[$style.headerContent, textAlign === 'center' && $style.headerContentCenter]">
          <div :class="$style.headerDesc">{{ description }}</div>
        </div>
      </template>
    </template>
  </div>
</template>

<style module src="./Modal.module.css"></style>
