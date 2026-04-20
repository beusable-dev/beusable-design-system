<script setup lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  useCssModule,
  watch,
  type CSSProperties,
} from 'vue';
import Checkbox from '../Checkbox/Checkbox.vue';
import { useControllableState } from '../../composables/useControllableState';
import type {
  SortOrder,
  TableColumn,
  TableProps,
  TableRowData,
  TableRowKey,
} from './types';

const props = withDefaults(defineProps<TableProps<TableRowData>>(), {
  headerTone: 'light',
  rowHeight: 40,
  headerSideCaps: false,
  stickySelectable: false,
  showStickyShadows: true,
  selectable: false,
});

const emit = defineEmits<{
  'update:selectedRowKeys': [keys: TableRowKey[]];
  sort: [key: string, order: SortOrder];
}>();

const styles = useCssModule();
const RenderNode = defineComponent({
  props: {
    node: {
      type: null,
      required: true,
    },
  },
  setup(componentProps) {
    return () => componentProps.node as never;
  },
});

const effectiveHeaderSideCaps = computed(
  () => props.headerTone === 'dark' || props.headerSideCaps,
);

const { value: resolvedSelectedRowKeys, setValue: updateSelectedRowKeys } =
  useControllableState<TableRowKey[]>(
    () => props.selectedRowKeys,
    props.defaultSelectedRowKeys ?? [],
    (keys) => emit('update:selectedRowKeys', keys),
  );

const resolvedRowKeys = computed<TableRowKey[]>(() =>
  props.data.map((row, rowIndex) => {
    if (typeof props.rowKey === 'function') {
      return props.rowKey(row, rowIndex);
    }
    if (typeof props.rowKey === 'string') {
      return row[props.rowKey] as TableRowKey;
    }
    return rowIndex;
  }),
);

const selectedKeySet = computed(() => new Set(resolvedSelectedRowKeys.value));
const stickyHeaderSet = computed(() => new Set(props.stickyColumnHeaders ?? []));

function isStickyColumn(col: TableColumn<TableRowData>) {
  return !!col.sticky || stickyHeaderSet.value.has(col.label);
}

const hasStickyColumns = computed(() => props.columns.some((col) => isStickyColumn(col)));
const hasStickyLayout = computed(() => hasStickyColumns.value || props.stickySelectable);

const scrollContainerRef = ref<HTMLDivElement | null>(null);
const canScrollLeft = ref(false);
let resizeObserver: ResizeObserver | null = null;
let removeScrollListener: (() => void) | null = null;

function updateScrollState() {
  const el = scrollContainerRef.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 0;
}

function setupStickyScrollObserver() {
  removeScrollListener?.();
  removeScrollListener = null;
  resizeObserver?.disconnect();
  resizeObserver = null;

  const el = scrollContainerRef.value;
  if (!hasStickyLayout.value || !props.showStickyShadows || !el) {
    canScrollLeft.value = false;
    return;
  }

  updateScrollState();
  el.addEventListener('scroll', updateScrollState, { passive: true });
  resizeObserver = new ResizeObserver(updateScrollState);
  resizeObserver.observe(el);

  removeScrollListener = () => el.removeEventListener('scroll', updateScrollState);
}

onMounted(() => {
  setupStickyScrollObserver();
});

watch(
  () => [hasStickyLayout.value, props.showStickyShadows] as const,
  () => {
    setupStickyScrollObserver();
  },
);

onBeforeUnmount(() => {
  removeScrollListener?.();
  removeScrollListener = null;
  resizeObserver?.disconnect();
  resizeObserver = null;
});

const stickyBase = 0;
const selectionCellWidth = 42;

const stickyLeftOffsets = computed<Record<string, number>>(() => {
  const offsets: Record<string, number> = {};
  let offset =
    stickyBase + (props.selectable && props.stickySelectable ? selectionCellWidth : 0);

  for (const col of props.columns) {
    if (isStickyColumn(col)) {
      offsets[col.key] = offset;
      offset += col.width ?? 0;
    }
  }

  return offsets;
});

const totalStickyWidth = computed(() => {
  let offset =
    stickyBase + (props.selectable && props.stickySelectable ? selectionCellWidth : 0);

  for (const col of props.columns) {
    if (isStickyColumn(col)) {
      offset += col.width ?? 0;
    }
  }

  return offset;
});

function handleHeaderClick(col: TableColumn<TableRowData>) {
  if (!col.sortable) return;
  const nextOrder: SortOrder =
    props.sortKey === col.key && props.sortOrder === 'asc' ? 'desc' : 'asc';
  emit('sort', col.key, nextOrder);
}

const allRowsSelected = computed(
  () =>
    props.selectable &&
    props.data.length > 0 &&
    resolvedRowKeys.value.every((key) => selectedKeySet.value.has(key)),
);

const someRowsSelected = computed(
  () =>
    props.selectable &&
    resolvedRowKeys.value.some((key) => selectedKeySet.value.has(key)),
);

function handleToggleAllRows(checked: boolean) {
  updateSelectedRowKeys(checked ? [...resolvedRowKeys.value] : []);
}

function handleToggleRow(key: TableRowKey, checked: boolean) {
  if (checked) {
    updateSelectedRowKeys(Array.from(new Set([...resolvedSelectedRowKeys.value, key])));
    return;
  }

  updateSelectedRowKeys(
    resolvedSelectedRowKeys.value.filter((selectedKey) => selectedKey !== key),
  );
}

const tableStyle = computed<CSSProperties>(() => ({
  '--table-header-height': `${props.headerHeight ?? props.rowHeight}px`,
  '--table-row-height': `${props.rowHeight}px`,
}));

function getHeaderCellClass(col: TableColumn<TableRowData>, isActive: boolean) {
  const isSticky = isStickyColumn(col);
  const isTrailingMutedHeader =
    props.headerTone === 'dark' &&
    hasStickyLayout.value &&
    !isSticky &&
    (col.headerDepth === 'muted' || stickyHeaderSet.value.size > 0);

  return [
    styles.headerCell,
    props.headerTone === 'dark' ? styles.headerCellDark : styles.headerCellLight,
    isTrailingMutedHeader && styles.headerCellMuted,
    col.sortable && styles.headerCellSortable,
    col.align === 'center' && styles.headerCellCenter,
    col.align === 'right' && styles.headerCellRight,
    isSticky && styles.headerCellSticky,
    effectiveHeaderSideCaps.value &&
      !props.selectable &&
      col.key === props.columns[0]?.key &&
      styles.headerCellRoundedLeft,
    effectiveHeaderSideCaps.value &&
      col.key === props.columns[props.columns.length - 1]?.key &&
      styles.headerCellRoundedRight,
    col.headerBg !== undefined && styles.headerCellHoverable,
    col.headerBg !== undefined && isActive && styles.headerCellSelected,
  ];
}

function getHeaderCellStyle(col: TableColumn<TableRowData>) {
  return {
    ...(col.width !== undefined ? { width: `${col.width}px` } : undefined),
    ...(isStickyColumn(col) ? { left: `${stickyLeftOffsets.value[col.key]}px` } : undefined),
    ...(col.headerBg !== undefined
      ? ({ '--header-bg': col.headerBg } as CSSProperties)
      : undefined),
  };
}

function getBodyCellClass(col: TableColumn<TableRowData>) {
  return [
    styles.bodyCell,
    col.align === 'center' && styles.bodyCellCenter,
    col.align === 'right' && styles.bodyCellRight,
    isStickyColumn(col) && styles.bodyCellSticky,
  ];
}

function getBodyCellStyle(col: TableColumn<TableRowData>) {
  return {
    ...(col.width !== undefined ? { width: `${col.width}px` } : undefined),
    ...(isStickyColumn(col) ? { left: `${stickyLeftOffsets.value[col.key]}px` } : undefined),
  };
}
</script>

<template>
  <div :class="[$style.wrapper, className]" :style="[tableStyle, style]">
    <div ref="scrollContainerRef" :class="$style.scrollContainer">
      <div :class="$style.inner">
        <div :class="[$style.headerRow, headerTone === 'light' && $style.headerRowLight]">
          <div
            v-if="hasStickyLayout && effectiveHeaderSideCaps"
            aria-hidden="true"
            :class="$style.headerStickyCapCover"
            :style="{
              width: `${totalStickyWidth}px`,
              marginRight: `-${totalStickyWidth}px`,
            }"
          />

          <div
            v-if="selectable"
            :class="[
              $style.headerCell,
              $style.selectionHeaderCell,
              headerTone === 'dark' ? $style.headerCellDark : $style.headerCellLight,
              stickySelectable && $style.headerCellSticky,
              effectiveHeaderSideCaps && $style.headerCellRoundedLeft,
            ]"
            :style="stickySelectable ? { left: `${stickyBase}px` } : undefined"
          >
            <Checkbox
              :model-value="allRowsSelected"
              :indeterminate="!allRowsSelected && someRowsSelected"
              :style="{ '--selection-color': '#EC0047' }"
              @change="handleToggleAllRows"
            />
          </div>

          <div
            v-for="col in columns"
            :key="col.key"
            :class="getHeaderCellClass(col, sortKey === col.key)"
            :style="getHeaderCellStyle(col)"
            @click="handleHeaderClick(col)"
          >
            <span :class="$style.headerLabel">{{ col.label }}</span>
            <template v-if="col.sortable">
              <svg
                v-if="sortKey === col.key"
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                :class="$style.sortIcon"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="13"
                  height="17"
                  rx="3"
                  :fill="headerTone === 'dark' ? '#272727' : '#FFF'"
                  :stroke="headerTone === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(34,34,34,0.16)'"
                  stroke-width="1"
                />
                <path
                  d="M 4.843 9.286 L 4 8.539 L 8 5 L 12 8.539 L 11.157 9.286 L 8 6.493 L 4.843 9.286 Z"
                  :fill="headerTone === 'dark' ? 'white' : '#555555'"
                  :opacity="sortOrder === 'asc' ? 1 : 0.3"
                />
                <path
                  d="M 8 14.793 L 11.157 12 L 12 12.746 L 8 16.286 L 4 12.746 L 4.843 12 L 8 14.793 Z"
                  :fill="headerTone === 'dark' ? 'white' : '#555555'"
                  :opacity="sortOrder === 'desc' ? 1 : 0.3"
                />
              </svg>
              <svg
                v-else
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                :class="$style.sortIcon"
              >
                <path
                  d="M 4.843 9.286 L 4 8.539 L 8 5 L 12 8.539 L 11.157 9.286 L 8 6.493 L 4.843 9.286 Z"
                  :fill="headerTone === 'dark' ? 'white' : '#555555'"
                  opacity="0.3"
                />
                <path
                  d="M 8 14.793 L 11.157 12 L 12 12.746 L 8 16.286 L 4 12.746 L 4.843 12 L 8 14.793 Z"
                  :fill="headerTone === 'dark' ? 'white' : '#555555'"
                  opacity="0.3"
                />
              </svg>
            </template>
          </div>
        </div>

        <div :class="$style.body">
          <div
            v-for="(row, rowIndex) in data"
            :key="String(resolvedRowKeys[rowIndex])"
            :class="$style.bodyRow"
          >
            <div
              v-if="selectable"
              :class="[
                $style.bodyCell,
                $style.selectionBodyCell,
                stickySelectable && $style.bodyCellSticky,
              ]"
              :style="stickySelectable ? { left: `${stickyBase}px` } : undefined"
            >
              <Checkbox
                :model-value="selectedKeySet.has(resolvedRowKeys[rowIndex])"
                :style="{ '--selection-color': '#EC0047' }"
                @change="(checked: boolean) => handleToggleRow(resolvedRowKeys[rowIndex], checked)"
              />
            </div>

            <div
              v-for="col in columns"
              :key="col.key"
              :class="getBodyCellClass(col)"
              :style="getBodyCellStyle(col)"
            >
              <RenderNode
                v-if="col.render"
                :node="col.render(row[col.key], row, rowIndex)"
              />
              <span
                v-else
                :class="[
                  $style.cellText,
                  col.align === 'center' && $style.cellTextCenter,
                  col.align === 'right' && $style.cellTextRight,
                ]"
              >
                {{ String(row[col.key] ?? '') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="hasStickyLayout && showStickyShadows"
      :class="[$style.scrollShadow, canScrollLeft && $style.scrollShadowScrolled]"
      :style="{ left: `${totalStickyWidth}px` }"
      aria-hidden="true"
    />
  </div>
</template>

<style module src="./Table.module.css"></style>
