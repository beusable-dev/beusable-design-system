import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties, type ReactNode } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import clsx from 'clsx';
import styles from './Table.module.css';
import { Checkbox } from '../Checkbox';

export type SortOrder = 'asc' | 'desc';
export type TableHeaderTone = 'dark' | 'light';
export type TableRowHeight = number;
export type TableRowKey = string | number;
const STICKY_FALLBACK_WIDTH = 160;

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  headerDepth?: 'default' | 'muted';
  headerBg?: string;
  sticky?: boolean;
  render?: (value: unknown, row: T, rowIndex: number) => ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  sortKey?: string;
  sortOrder?: SortOrder;
  onSort?: (key: string, order: SortOrder) => void;
  headerTone?: TableHeaderTone;
  headerHeight?: number;
  rowHeight?: TableRowHeight;
  headerSideCaps?: boolean;
  stickyColumnHeaders?: string[];
  stickySelectable?: boolean;
  showStickyShadows?: boolean;
  selectable?: boolean;
  rowKey?: keyof T | ((row: T, rowIndex: number) => TableRowKey);
  selectedRowKeys?: TableRowKey[];
  defaultSelectedRowKeys?: TableRowKey[];
  onSelectedRowKeysChange?: (keys: TableRowKey[]) => void;
  className?: string;
  style?: CSSProperties;
}

function SortIcon({
  active,
  order,
  tone,
}: {
  active: boolean;
  order?: SortOrder;
  tone: TableHeaderTone;
}) {
  const upOpacity = active && order === 'asc' ? 1 : 0.3;
  const downOpacity = active && order === 'desc' ? 1 : 0.3;
  const arrowColor = tone === 'dark' ? 'white' : '#555555';

  if (active) {
    const rectFill = tone === 'dark' ? '#272727' : '#FFF';
    const rectStroke = tone === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(34,34,34,0.16)';
    return (
      <svg
        width="16" height="20" viewBox="0 0 16 20"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        className={styles.sortIcon}
      >
        <rect x="1.5" y="1.5" width="13" height="17" rx="3"
          fill={rectFill} stroke={rectStroke} strokeWidth="1" />
        <path d="M 4.843 9.286 L 4 8.539 L 8 5 L 12 8.539 L 11.157 9.286 L 8 6.493 L 4.843 9.286 Z"
          fill={arrowColor} opacity={upOpacity} />
        <path d="M 8 14.793 L 11.157 12 L 12 12.746 L 8 16.286 L 4 12.746 L 4.843 12 L 8 14.793 Z"
          fill={arrowColor} opacity={downOpacity} />
      </svg>
    );
  }

  return (
    <svg
      width="16" height="20" viewBox="0 0 16 20"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className={styles.sortIcon}
    >
      <path d="M 4.843 9.286 L 4 8.539 L 8 5 L 12 8.539 L 11.157 9.286 L 8 6.493 L 4.843 9.286 Z"
        fill={arrowColor} opacity={upOpacity} />
      <path d="M 8 14.793 L 11.157 12 L 12 12.746 L 8 16.286 L 4 12.746 L 4.843 12 L 8 14.793 Z"
        fill={arrowColor} opacity={downOpacity} />
    </svg>
  );
}

/**
 * sticky column, selectable row, sortable header를 지원하는 범용 테이블 컴포넌트다.
 */
export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  sortKey,
  sortOrder,
  onSort,
  headerTone = 'light',
  headerHeight,
  rowHeight = 40,
  headerSideCaps = false,
  stickyColumnHeaders,
  stickySelectable = false,
  showStickyShadows = true,
  selectable = false,
  rowKey,
  selectedRowKeys,
  defaultSelectedRowKeys,
  onSelectedRowKeysChange,
  className,
  style,
}: TableProps<T>) {
  const effectiveHeaderSideCaps = headerTone === 'dark' || headerSideCaps;

  const [resolvedSelectedRowKeys, setResolvedSelectedRowKeys] = useControllableState<TableRowKey[]>(
    selectedRowKeys,
    defaultSelectedRowKeys ?? [],
    onSelectedRowKeysChange,
  );

  const resolvedRowKeys = useMemo(
    () =>
      data.map((row, rowIndex) => {
        if (typeof rowKey === 'function') return rowKey(row, rowIndex);
        if (typeof rowKey === 'string') return row[rowKey] as TableRowKey;
        return rowIndex;
      }),
    [data, rowKey],
  );

  const selectedKeySet = useMemo(
    () => new Set(resolvedSelectedRowKeys),
    [resolvedSelectedRowKeys],
  );

  const stickyHeaderSet = useMemo(
    () => new Set(stickyColumnHeaders ?? []),
    [stickyColumnHeaders],
  );

  const isStickyColumn = useCallback(
    (col: TableColumn<T>) => col.sticky || stickyHeaderSet.has(col.label),
    [stickyHeaderSet],
  );

  const hasStickyColumns = columns.some((col) => isStickyColumn(col));
  const hasStickyLayout = hasStickyColumns || stickySelectable;

  const normalizedColumns = useMemo(
    () =>
      columns.map((col, colIndex) => ({
        col,
        colIndex,
        renderKey: `${col.key}:${colIndex}`,
      })),
    [columns],
  );

  // Scroll shadow state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  /**
   * sticky shadow 표시 여부를 현재 스크롤 위치 기준으로 갱신한다.
   */
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
  }, []);

  useEffect(() => {
    if (!hasStickyLayout || !showStickyShadows) {
      setCanScrollLeft(false);
      return;
    }

    updateScrollState();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [hasStickyLayout, showStickyShadows, updateScrollState]);

  // Sticky column offsets
  const stickyBase = 0;
  const selectionCellWidth = 42;

  // 선택 컬럼을 포함한 sticky 컬럼들의 left offset과 총 폭을 미리 계산한다.
  const { stickyLeftOffsets, totalStickyWidth } = useMemo(() => {
    const offsets: Record<string, number> = {};
    let offset = stickyBase + (selectable && stickySelectable ? selectionCellWidth : 0);
    for (const normalized of normalizedColumns) {
      if (isStickyColumn(normalized.col)) {
        offsets[normalized.renderKey] = offset;
        offset += normalized.col.width ?? STICKY_FALLBACK_WIDTH;
      }
    }
    return { stickyLeftOffsets: offsets, totalStickyWidth: offset };
  }, [isStickyColumn, normalizedColumns, selectable, stickyBase, stickySelectable]);

  /**
   * sortable 헤더 클릭 시 다음 정렬 방향을 계산해 외부로 전달한다.
   *
   * @param col - 클릭한 헤더 컬럼 정의.
   */
  const handleHeaderClick = (col: TableColumn<T>) => {
    if (!col.sortable || !onSort) return;
    const nextOrder: SortOrder =
      sortKey === col.key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(col.key, nextOrder);
  };

  /**
   * 선택 키 배열을 controllable state로 일원화해 반영한다.
   *
   * @param keys - 새로 확정할 선택 키 목록.
   */
  const updateSelectedRowKeys = (keys: TableRowKey[]) => {
    setResolvedSelectedRowKeys(keys);
  };

  const allRowsSelected = selectable && data.length > 0 && resolvedRowKeys.every((key) => selectedKeySet.has(key));
  const someRowsSelected = selectable && resolvedRowKeys.some((key) => selectedKeySet.has(key));

  /**
   * 헤더 체크박스로 현재 페이지의 모든 행을 선택 또는 해제한다.
   *
   * @param checked - 전체 선택 여부.
   */
  const handleToggleAllRows = (checked: boolean) => {
    updateSelectedRowKeys(checked ? [...resolvedRowKeys] : []);
  };

  /**
   * 개별 행의 선택 상태를 토글한다.
   *
   * @param key - 대상 행의 고유 키.
   * @param checked - 토글 후 선택 여부.
   */
  const handleToggleRow = (key: TableRowKey, checked: boolean) => {
    if (checked) {
      updateSelectedRowKeys(Array.from(new Set([...resolvedSelectedRowKeys, key])));
      return;
    }
    updateSelectedRowKeys(resolvedSelectedRowKeys.filter((selectedKey) => selectedKey !== key));
  };

  const tableVars = {
    '--table-header-height': `${headerHeight ?? rowHeight}px`,
    '--table-row-height': `${rowHeight}px`,
  } as CSSProperties;

  return (
    <div className={clsx(styles.wrapper, className)} style={{ ...tableVars, ...style }}>
      <div className={styles.scrollContainer} ref={scrollContainerRef}>
      <div className={styles.inner}>
          <div
            className={clsx(
              styles.headerRow,
              headerTone === 'light' && styles.headerRowLight,
            )}
          >
            {hasStickyLayout && effectiveHeaderSideCaps && (
              <div
                aria-hidden="true"
                className={styles.headerStickyCapCover}
                style={{
                  width: `${totalStickyWidth}px`,
                  marginRight: `-${totalStickyWidth}px`,
                }}
              />
            )}
            {selectable && (
              <div
                className={clsx(
                  styles.headerCell,
                  styles.selectionHeaderCell,
                  headerTone === 'dark' ? styles.headerCellDark : styles.headerCellLight,
                  stickySelectable && styles.headerCellSticky,
                  effectiveHeaderSideCaps && styles.headerCellRoundedLeft,
                )}
                style={stickySelectable ? { left: stickyBase } : undefined}
              >
                <Checkbox
                  checked={allRowsSelected}
                  indeterminate={!allRowsSelected && someRowsSelected}
                  onChange={(e) => handleToggleAllRows(e.target.checked)}
                  style={{ '--selection-color': '#EC0047' } as CSSProperties}
                />
              </div>
            )}
            {normalizedColumns.map(({ col, colIndex, renderKey }) => {
              const isActive = sortKey === col.key;
              const isSticky = isStickyColumn(col);
              const resolvedColumnWidth = col.width ?? (isSticky ? STICKY_FALLBACK_WIDTH : undefined);
              const isTrailingMutedHeader =
                headerTone === 'dark' &&
                hasStickyLayout &&
                !isSticky &&
                (col.headerDepth === 'muted' || stickyHeaderSet.size > 0);
              return (
                <div
                  key={renderKey}
                  className={clsx(
                    styles.headerCell,
                    headerTone === 'dark' ? styles.headerCellDark : styles.headerCellLight,
                    isTrailingMutedHeader && styles.headerCellMuted,
                    col.sortable && styles.headerCellSortable,
                    col.align === 'center' && styles.headerCellCenter,
                    col.align === 'right' && styles.headerCellRight,
                    isSticky && styles.headerCellSticky,
                    effectiveHeaderSideCaps && !selectable && colIndex === 0 && styles.headerCellRoundedLeft,
                    effectiveHeaderSideCaps && colIndex === normalizedColumns.length - 1 && styles.headerCellRoundedRight,
                    col.headerBg !== undefined && styles.headerCellHoverable,
                    col.headerBg !== undefined && isActive && styles.headerCellSelected,
                  )}
                  style={{
                    ...(resolvedColumnWidth !== undefined ? { width: `${resolvedColumnWidth}px` } : undefined),
                    ...(isSticky ? { left: `${stickyLeftOffsets[renderKey]}px` } : undefined),
                    ...(col.headerBg !== undefined ? { '--header-bg': col.headerBg } as CSSProperties : undefined),
                  }}
                  onClick={() => handleHeaderClick(col)}
                >
                  <span className={styles.headerLabel}>{col.label}</span>
                  {col.sortable && (
                    <SortIcon
                      active={isActive}
                      order={isActive ? sortOrder : undefined}
                      tone={headerTone}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.body}>
            {data.map((row, rowIndex) => {
              const currentRowKey = resolvedRowKeys[rowIndex];
              const isSelected = selectedKeySet.has(currentRowKey);

              return (
                <div key={String(currentRowKey)} className={styles.bodyRow}>
                  {selectable && (
                    <div
                      className={clsx(
                        styles.bodyCell,
                        styles.selectionBodyCell,
                        stickySelectable && styles.bodyCellSticky,
                      )}
                      style={stickySelectable ? { left: stickyBase } : undefined}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleToggleRow(currentRowKey, e.target.checked)}
                        style={{ '--selection-color': '#EC0047' } as CSSProperties}
                      />
                    </div>
                  )}
                  {normalizedColumns.map(({ col, renderKey }) => {
                    const value = row[col.key];
                    const isSticky = isStickyColumn(col);
                    const resolvedColumnWidth = col.width ?? (isSticky ? STICKY_FALLBACK_WIDTH : undefined);
                    return (
                      <div
                        key={renderKey}
                        className={clsx(
                          styles.bodyCell,
                          col.align === 'center' && styles.bodyCellCenter,
                          col.align === 'right' && styles.bodyCellRight,
                          isSticky && styles.bodyCellSticky,
                        )}
                        style={{
                          ...(resolvedColumnWidth !== undefined ? { width: `${resolvedColumnWidth}px` } : undefined),
                          ...(isSticky ? { left: `${stickyLeftOffsets[renderKey]}px` } : undefined),
                        }}
                      >
                        {col.render ? (
                          col.render(value, row, rowIndex)
                        ) : (
                          <span className={clsx(
                            styles.cellText,
                            col.align === 'center' && styles.cellTextCenter,
                            col.align === 'right' && styles.cellTextRight,
                          )}>{String(value ?? '')}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {hasStickyLayout && showStickyShadows && (
        <div
          className={clsx(styles.scrollShadow, canScrollLeft && styles.scrollShadowScrolled)}
          style={{ left: `${totalStickyWidth}px` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
