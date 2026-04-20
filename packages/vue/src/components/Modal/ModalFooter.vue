<script setup lang="ts">
defineSlots<{
  default?: () => unknown;
  checkbox?: () => unknown;
  leftAction?: () => unknown;
}>();
</script>

<template>
  <div :class="$style.footer">
    <div v-if="$slots.checkbox" :class="$style.footerCheckbox">
      <slot name="checkbox" />
    </div>
    <div v-if="$slots.default" :class="$style.buttonsRow">
      <div :class="$style.buttonsRowLeft">
        <slot name="leftAction" />
      </div>
      <div :class="$style.buttonsRowCenter">
        <slot />
      </div>
      <div :class="$style.buttonsRowRight" />
    </div>
  </div>
</template>

<style module src="./Modal.module.css"></style>
