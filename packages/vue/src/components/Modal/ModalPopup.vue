<script setup lang="ts">
withDefaults(
  defineProps<{
    narrow?: boolean;
  }>(),
  {
    narrow: false,
  },
);
</script>

<template>
  <div :class="[$style.popup, narrow && $style.popupNarrow]">
    <slot />
  </div>
</template>

<style module src="./Modal.module.css"></style>
