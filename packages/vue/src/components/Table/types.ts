import type { StyleValue, VNodeChild } from 'vue';

export type SortOrder = 'asc' | 'desc';
export type TableHeaderTone = 'dark' | 'light';
export type TableRowHeight = number;
export type TableRowKey = string | number;
export type TableRowData = Record<string, unknown>;

export interface TableColumn<T = TableRowData> {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  headerDepth?: 'default' | 'muted';
  headerBg?: string;
  sticky?: boolean;
  render?: (value: unknown, row: T, rowIndex: number) => VNodeChild;
}

export interface TableProps<T = TableRowData> {
  columns: TableColumn<T>[];
  data: T[];
  sortKey?: string;
  sortOrder?: SortOrder;
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
  className?: string;
  style?: StyleValue;
}
