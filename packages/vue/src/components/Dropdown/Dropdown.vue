<script setup lang="ts">
import { computed, ref, watch, nextTick, useId, onMounted, onUnmounted } from 'vue';
import { useControllableState } from '../../composables/useControllableState';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type DropdownSize = 's' | 'm' | 'l';
export type DropdownLayout = 'vertical' | 'horizontal';
export type DropdownVariant = 'border' | 'shadow';

const props = withDefaults(
  defineProps<{
    options: DropdownOption[];
    modelValue?: string | string[];
    defaultValue?: string | string[];
    placeholder?: string;
    label?: string;
    errorMessage?: string;
    message?: string;
    size?: DropdownSize;
    variant?: DropdownVariant;
    layout?: DropdownLayout;
    disabled?: boolean;
    multiple?: boolean;
    searchable?: boolean;
    id?: string;
  }>(),
  {
    placeholder: 'Select',
    size: 'm',
    variant: 'border',
    layout: 'vertical',
    disabled: false,
    multiple: false,
    searchable: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]];
  change: [value: string | string[]];
}>();

const autoId = useId();
const id = computed(() => props.id ?? autoId);
const labelId = computed(() => `${id.value}-label`);
const listId = computed(() => `${id.value}-list`);

// ─── Selection state ──────────────────────────────────────────────────────────
const { value: currentValue, setValue } = useControllableState<string | string[]>(
  () => props.modelValue,
  props.defaultValue ?? (props.multiple ? [] : ''),
  (v) => {
    emit('update:modelValue', v);
    emit('change', v);
  },
);

const selectedValues = computed<string[]>(() =>
  props.multiple
    ? Array.isArray(currentValue.value)
      ? currentValue.value
      : currentValue.value ? [currentValue.value as string] : []
    : [],
);
const selectedSingle = computed(() =>
  props.multiple ? '' : (currentValue.value as string) ?? '',
);
const triggerLabel = computed(() => {
  if (props.multiple) {
    return selectedValues.value.length
      ? selectedValues.value
          .map((v) => props.options.find((o) => o.value === v)?.label ?? v)
          .join(', ')
      : props.placeholder;
  }
  return selectedSingle.value
    ? props.options.find((o) => o.value === selectedSingle.value)?.label ?? selectedSingle.value
    : props.placeholder;
});
const isPlaceholder = computed(() =>
  props.multiple ? selectedValues.value.length === 0 : !selectedSingle.value,
);

function selectOption(optionValue: string) {
  if (props.multiple) {
    const next = selectedValues.value.includes(optionValue)
      ? selectedValues.value.filter((v) => v !== optionValue)
      : [...selectedValues.value, optionValue];
    setValue(next);
  } else {
    setValue(optionValue);
  }
}

function clearValue() {
  setValue(props.multiple ? [] : '');
}

// ─── UI state ────────────────────────────────────────────────────────────────
const open = ref(false);
const searchQuery = ref('');
const activeIndex = ref(-1);
const containerRef = ref<HTMLDivElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLUListElement | null>(null);

const filteredOptions = computed(() =>
  props.searchable && searchQuery.value
    ? props.options.filter((o) =>
        o.label.toLowerCase().includes(searchQuery.value.toLowerCase()),
      )
    : props.options,
);
const enabledOptions = computed(() => filteredOptions.value.filter((o) => !o.disabled));
const hasError = computed(() => Boolean(props.errorMessage));

// outside click
function handleOutsideClick(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false;
    searchQuery.value = '';
  }
}
onMounted(() => document.addEventListener('mousedown', handleOutsideClick));
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick));

// focus search on open
watch(open, (val) => {
  if (val && props.searchable) {
    nextTick(() => searchRef.value?.focus());
  }
});

function handleToggle() {
  if (props.disabled) return;
  if (open.value) {
    open.value = false;
    searchQuery.value = '';
    activeIndex.value = -1;
  } else {
    open.value = true;
  }
}

function handleSelect(optionValue: string) {
  selectOption(optionValue);
  if (!props.multiple) {
    open.value = false;
    searchQuery.value = '';
    activeIndex.value = -1;
  }
}

function handleClear(e: MouseEvent) {
  e.stopPropagation();
  searchQuery.value = '';
  clearValue();
  open.value = false;
}

function scrollActiveIntoView(index: number) {
  const val = enabledOptions.value[index]?.value;
  if (!val || !listRef.value) return;
  listRef.value
    .querySelector<HTMLElement>(`[id="${listId.value}-option-${val}"]`)
    ?.scrollIntoView({ block: 'nearest' });
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    open.value = false;
    searchQuery.value = '';
    activeIndex.value = -1;
    return;
  }
  if (
    !open.value &&
    ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)
  ) {
    e.preventDefault();
    open.value = true;
    return;
  }
  if (!open.value) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next =
      activeIndex.value + 1 < enabledOptions.value.length ? activeIndex.value + 1 : 0;
    activeIndex.value = next;
    scrollActiveIntoView(next);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const next =
      activeIndex.value - 1 >= 0
        ? activeIndex.value - 1
        : enabledOptions.value.length - 1;
    activeIndex.value = next;
    scrollActiveIntoView(next);
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (
      activeIndex.value >= 0 &&
      activeIndex.value < enabledOptions.value.length
    ) {
      handleSelect(enabledOptions.value[activeIndex.value].value);
    }
  }
}

const activeDescendant = computed(() => {
  if (!open.value || activeIndex.value < 0) return undefined;
  return `${listId.value}-option-${enabledOptions.value[activeIndex.value]?.value}`;
});
</script>

<template>
  <div
    :class="[
      $style.root,
      $style[size],
      variant === 'shadow' && $style.shadow,
      layout === 'horizontal' && $style.horizontal,
    ]"
  >
    <span
      v-if="label"
      :id="labelId"
      :class="$style.label"
      @click="(containerRef?.querySelector('[role=combobox]') as HTMLElement | null)?.focus()"
    >
      {{ label }}
    </span>

    <div ref="containerRef" :class="$style.wrapper">
      <!-- Trigger -->
      <div
        :id="id"
        :role="searchable && open ? undefined : 'combobox'"
        :aria-expanded="searchable && open ? undefined : open"
        :aria-haspopup="searchable && open ? undefined : 'listbox'"
        :aria-controls="searchable && open ? undefined : open ? listId : undefined"
        :aria-activedescendant="searchable && open ? undefined : activeDescendant"
        :aria-labelledby="label ? labelId : undefined"
        :aria-disabled="disabled"
        :tabindex="(searchable && open) || disabled ? -1 : 0"
        :class="[
          $style.trigger,
          open && $style.open,
          hasError && $style.error,
          disabled && $style.disabled,
        ]"
        @click="handleToggle"
        @keydown="!searchable || !open ? handleKeyDown : undefined"
      >
        <input
          v-if="searchable && open"
          ref="searchRef"
          role="combobox"
          aria-expanded="true"
          aria-haspopup="listbox"
          :aria-controls="listId"
          :aria-activedescendant="activeDescendant"
          aria-autocomplete="list"
          :class="$style.searchInput"
          :value="searchQuery"
          :placeholder="triggerLabel"
          @input="searchQuery = ($event.target as HTMLInputElement).value"
          @click.stop
          @keydown="handleKeyDown"
        />
        <span
          v-else
          :class="[$style.value, isPlaceholder && $style.placeholder]"
        >
          {{ triggerLabel }}
        </span>

        <span :class="$style.icons">
          <button
            v-if="searchable && open"
            type="button"
            :class="$style.clearBtn"
            aria-label="Clear"
            @click="handleClear"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11 3L3 11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span :class="$style.chevron">
            <svg v-if="open" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M14 10.0215C14 10.1427 13.9508 10.2642 13.8528 10.3574C13.6543 10.5456 13.3297 10.5478 13.1278 10.3625L8.00021 5.64966L2.87219 10.3625C2.6703 10.5478 2.34574 10.5456 2.14725 10.3574C1.94875 10.1689 1.95143 9.86587 2.15273 9.68088L7.64048 4.63726C7.84 4.45418 8.15977 4.45418 8.35929 4.63726L13.847 9.68088C13.9488 9.77433 14 9.89809 14 10.0215Z" fill="currentColor"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M2 5.97848C2 5.85728 2.0492 5.73576 2.14725 5.64262C2.34574 5.45444 2.6703 5.45221 2.8722 5.63752L8.00021 10.3503L13.1282 5.63752C13.3298 5.45221 13.6543 5.45444 13.8528 5.64262C14.0513 5.83112 14.0486 6.13413 13.8474 6.31912L8.35961 11.3627C8.16009 11.5458 7.84032 11.5458 7.6408 11.3627L2.15305 6.31912C2.05125 6.22567 2 6.10191 2 5.97848Z" fill="currentColor"/>
            </svg>
          </span>
        </span>
      </div>

      <!-- List -->
      <ul
        v-if="open"
        ref="listRef"
        :id="listId"
        role="listbox"
        :aria-multiselectable="multiple"
        :class="$style.list"
      >
        <li v-if="filteredOptions.length === 0" :class="$style.empty">검색 결과 없음</li>
        <template v-else>
          <li
            v-for="option in filteredOptions"
            :key="option.value"
            :id="`${listId}-option-${option.value}`"
            role="option"
            :aria-selected="multiple ? selectedValues.includes(option.value) : option.value === selectedSingle"
            :aria-disabled="option.disabled"
            :class="[
              $style.item,
              (multiple ? selectedValues.includes(option.value) : option.value === selectedSingle) && $style.selected,
              option.disabled && $style.itemDisabled,
            ]"
            @click="!option.disabled && handleSelect(option.value)"
          >
            <span v-if="multiple" :class="$style.checkbox">
              <template v-if="selectedValues.includes(option.value)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="16" rx="3" fill="#ec0047" />
                  <path d="M3.5 8l3.5 3.5 5.5-6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </template>
              <template v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M15 3H3V15H15V3Z" fill="white"/>
                  <path d="M15 3V15H3V3H15ZM15.2222 1H2.77778C1.8 1 1 1.8 1 2.77778V15.2222C1 16.2 1.8 17 2.77778 17H15.2222C16.2 17 17 16.2 17 15.2222V2.77778C17 1.8 16.2 1 15.2222 1Z" fill="#AAAAAA"/>
                </svg>
              </template>
            </span>
            <span>{{ option.label }}</span>
          </li>
        </template>
      </ul>
    </div>

    <p v-if="hasError" :class="$style.errorMsg">{{ errorMessage }}</p>
    <p v-else-if="message" :class="$style.msg">{{ message }}</p>
  </div>
</template>

<style module src="./Dropdown.module.css"></style>
