import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BeTable, type TableColumn, type SortOrder } from '@beusable-dev/react';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: BeTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

function LinkPopupIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6.5 3.5H12.5V9.5" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4L7.5 8.5" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 12.5H4C3.44772 12.5 3 12.0523 3 11.5V5.5C3 4.94772 3.44772 4.5 4 4.5H8" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagDot() {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: '#8bc34a',
        display: 'inline-block',
      }}
    />
  );
}

function TwoLineSampleCell() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 13,
          lineHeight: 1.2,
          color: '#444444',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        UX Heatmaps_Beusable
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          minWidth: 0,
        }}
      >
        <LinkPopupIcon />
        <span
          style={{
            height: 20,
            padding: '0 5px',
            borderRadius: 4,
            backgroundColor: '#ffffff',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.16)',
            color: '#767676',
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          www
        </span>
        <span
          style={{
            fontSize: 13,
            lineHeight: 1.2,
            color: '#666666',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          UX Heatmaps_Beusable
        </span>
      </div>
    </div>
  );
}

/* ── 공통 샘플 데이터 ── */
const sampleData = Array.from({ length: 12 }, (_, i) => ({
  no: i + 1,
  id: 'sampleid8372',
  session: '12,325,000',
  sample: '(주) 베리베리아요',
  sampleText: 'sample Text',
  plan: 'Everyone',
  total: '2,700,000',
  lastLogin: '2025-12-12',
  joinDate: '2025-12-12',
  email: 'sample@bebebebe212.com',
  joinDate2: '2025-12-12',
}));

const baseColumns: TableColumn[] = [
  { key: 'no', label: 'No', width: 68, align: 'center', sortable: true },
  { key: 'id', label: 'ID', width: 130, sortable: true },
  { key: 'session', label: 'Session', width: 110, sortable: true },
  { key: 'sample', label: 'Sample', width: 110, sortable: true },
  { key: 'plan', label: '플랜', width: 110, sortable: true },
  { key: 'total', label: '총 결제액', width: 110, sortable: true },
  { key: 'lastLogin', label: '마지막 로그인', width: 130, sortable: true },
  { key: 'joinDate', label: '가입일', width: 110, sortable: true },
  { key: 'email', label: '이메일', width: 110, sortable: true },
  { key: 'joinDate2', label: '가입일2', width: 110, sortable: true },
];

const figmaDefaultColumns: TableColumn[] = [
  { key: 'no', label: 'No', width: 68, align: 'center', sortable: true },
  { key: 'id', label: 'ID', width: 129, sortable: true },
  { key: 'session', label: 'Session', width: 110, sortable: true },
  { key: 'sample', label: 'Sample', width: 110, sortable: true },
  { key: 'plan', label: '플랜', width: 110, sortable: true },
  { key: 'total', label: '총 결제액', width: 110, sortable: true },
  { key: 'lastLogin', label: '마지막 로그인', width: 115, sortable: true },
  { key: 'joinDate', label: '가입일', width: 110, sortable: true },
];

const figma5688Columns: TableColumn[] = [
  { key: 'no', label: 'No', width: 68, align: 'center', sortable: true },
  { key: 'id', label: 'ID', width: 130, sortable: true },
  {
    key: 'tag',
    label: 'Tag',
    width: 80,
    align: 'center',
    render: () => <TagDot />,
  },
  {
    key: 'sampleTwoLine',
    label: '2Line\nSample',
    width: 292,
    sortable: true,
    render: () => <TwoLineSampleCell />,
  },
  { key: 'total', label: '총 결제액', width: 110, sortable: true },
  { key: 'lastLogin', label: '마지막 로그인', width: 115, sortable: true },
  { key: 'joinDate', label: '가입일', width: 110, sortable: true },
  { key: 'email', label: '이메일', width: 110, sortable: true },
  { key: 'joinDate2', label: '가입일2', width: 110, sortable: true },
];

/* ── Figma 56 / 88 ── */
export const Default: Story = {
  render: () => {
    const [sortKey, setSortKey] = useState<string>('no');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const handleSort = (key: string, order: SortOrder) => {
      setSortKey(key);
      setSortOrder(order);
    };

    return (
      <BeTable
        columns={figma5688Columns}
        data={sampleData}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        headerTone="dark"
        headerHeight={56}
        rowHeight={88}
        headerSideCaps
      />
    );
  },
};

export const Dark_40_40: Story = {
  name: 'Dark 40/40',
  render: () => {
    const [sortKey, setSortKey] = useState<string>('no');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    return (
      <BeTable
        columns={[
          { key: 'no', label: 'No', width: 68, align: 'center', sortable: true },
          { key: 'id', label: 'ID', width: 130, sortable: true },
          { key: 'session', label: 'Session', width: 110, sortable: true },
          { key: 'sample', label: 'Sample', width: 110, sortable: true },
          { key: 'plan', label: '플랜', width: 110, sortable: true },
          { key: 'total', label: '총 결제액', width: 110, sortable: true },
          { key: 'lastLogin', label: '마지막 로그인', width: 115, sortable: true },
          { key: 'joinDate', label: '가입일', width: 110, sortable: true },
          { key: 'email', label: '이메일', width: 110, sortable: true },
          { key: 'joinDate2', label: '가입일2', width: 110, sortable: true },
        ]}
        data={sampleData}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={(key, order) => { setSortKey(key); setSortOrder(order); }}
        headerTone="dark"
        headerHeight={40}
        rowHeight={40}
        headerSideCaps
      />
    );
  },
};

export const Dark_52_48: Story = {
  name: 'Dark 52/48 (Selectable)',
  render: () => {
    const [sortKey, setSortKey] = useState<string>('no');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([1, 3]);

    return (
      <BeTable
        columns={[
          { key: 'no', label: 'No', width: 68, align: 'center', sortable: true },
          { key: 'id', label: 'ID', width: 130, sortable: true },
          { key: 'session', label: 'Session', width: 110, sortable: true },
          { key: 'sample', label: 'Sample', width: 110, sortable: true },
          { key: 'plan', label: '플랜', width: 110, sortable: true },
          { key: 'total', label: '총 결제액', width: 110, sortable: true },
          { key: 'lastLogin', label: '마지막 로그인', width: 115, sortable: true },
          { key: 'joinDate', label: '가입일', width: 110, sortable: true },
          { key: 'email', label: '이메일', width: 110, sortable: true },
          { key: 'joinDate2', label: '가입일2', width: 110, sortable: true },
        ]}
        data={sampleData}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={(key, order) => { setSortKey(key); setSortOrder(order); }}
        selectable
        rowKey="no"
        selectedRowKeys={selectedRowKeys}
        onSelectedRowKeysChange={setSelectedRowKeys}
        headerTone="dark"
        headerHeight={52}
        rowHeight={48}
        headerSideCaps
      />
    );
  },
};

/* ── Figma: Type B - Data Table - 40 / 41 (light header, no bars) ── */
export const TypeB_Light: Story = {
  name: 'Type B Light 40/40',
  render: () => {
    const [sortKey, setSortKey] = useState<string>('no');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    return (
      <BeTable
        columns={figmaDefaultColumns}
        data={sampleData}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={(key, order) => { setSortKey(key); setSortOrder(order); }}
        headerTone="light"
        headerHeight={40}
        rowHeight={40}
      />
    );
  },
};

/* ── Header focused color ── */
export const HeaderFocusedColor: Story = {
  name: 'Header Focused Color',
  render: () => {
    const [sortKey, setSortKey] = useState<string>('session');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const darkColumns = baseColumns.slice(0, 5).map((col) =>
      col.key === 'session' ? { ...col, headerBg: '#6b8e23' } : col,
    );
    const lightColumns = baseColumns.slice(0, 5).map((col) =>
      col.key === 'session' ? { ...col, headerBg: '#ffd900' } : col,
    );
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <BeTable
          columns={darkColumns}
          data={sampleData.slice(0, 4)}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={(key, order) => { setSortKey(key); setSortOrder(order); }}
          headerTone="dark"
        />
        <BeTable
          columns={lightColumns}
          data={sampleData.slice(0, 4)}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={(key, order) => { setSortKey(key); setSortOrder(order); }}
          headerTone="light"
        />
      </div>
    );
  },
};

/* ── 정렬 없는 테이블 ── */
export const NoSort: Story = {
  render: () => (
    <BeTable
      columns={baseColumns.map((col) => ({ ...col, sortable: false }))}
      data={sampleData.slice(0, 6)}
      headerTone="dark"
      headerSideCaps
    />
  ),
};

/* ── 커스텀 렌더 ── */
export const CustomRender: Story = {
  render: () => {
    const columns: TableColumn[] = [
      { key: 'no', label: 'No', width: 68, align: 'center', sortable: true },
      { key: 'id', label: 'ID', width: 130 },
      {
        key: 'plan',
        label: '플랜',
        width: 120,
        render: (value: unknown) => (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 4,
              background: value === 'Everyone' ? '#e8f5e9' : '#fff3e0',
              color: value === 'Everyone' ? '#57ab00' : '#f46200',
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {String(value)}
          </span>
        ),
      },
      { key: 'email', label: '이메일', width: 200 },
      { key: 'joinDate', label: '가입일', width: 110 },
    ];

    return (
      <BeTable
        columns={columns}
        data={sampleData.slice(0, 8)}
        sortKey="no"
        sortOrder="asc"
      />
    );
  },
};

/* ── 횡스크롤 + sticky 열 ── */
export const StickyColumns: Story = {
  name: 'Sticky Columns + Horizontal Scroll',
  render: () => {
    const [sortKey, setSortKey] = useState<string>('no');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);

    const columns: TableColumn[] = [
      { key: 'no', label: 'No', width: 68, align: 'center', sortable: true },
      { key: 'id', label: 'ID', width: 129, sortable: true },
      { key: 'session', label: 'Session', width: 110, sortable: true },
      { key: 'sample', label: 'Sample', width: 109, sortable: true },
      { key: 'total', label: '총 결제액', width: 110, sortable: true, headerDepth: 'muted' },
      { key: 'lastLogin', label: '마지막 로그인', width: 115, sortable: true, headerDepth: 'muted' },
      { key: 'joinDate', label: '가입일', width: 110, sortable: true, headerDepth: 'muted' },
      { key: 'email', label: '이메일', width: 110, sortable: true, headerDepth: 'muted' },
      { key: 'joinDate2', label: '가입일2', width: 110, sortable: true, headerDepth: 'muted' },
      { key: 'sampleText', label: 'Sample', width: 110, sortable: true, headerDepth: 'muted' },
    ];

    return (
      <div style={{ width: 820 }}>
        <BeTable
          columns={columns}
          data={sampleData}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={(key, order) => { setSortKey(key); setSortOrder(order); }}
          selectable
          stickySelectable
          stickyColumnHeaders={['No', 'ID']}
          rowKey="no"
          selectedRowKeys={selectedRowKeys}
          onSelectedRowKeysChange={setSelectedRowKeys}
          headerTone="dark"
          headerHeight={52}
          rowHeight={48}
          headerSideCaps
        />
      </div>
    );
  },
};

/* ── 긴 텍스트 말줄임 ── */
export const Overflow: Story = {
  render: () => {
    const data = Array.from({ length: 5 }, (_, i) => ({
      no: i + 1,
      id: 'very-long-identifier-that-does-not-fit-in-the-column-width',
      email: 'very.long.email.address.that.overflows@example-company.com',
      note: '이것은 매우 긴 텍스트로 셀 너비를 초과하여 말줄임표가 나타나야 합니다.',
    }));

    const columns: TableColumn[] = [
      { key: 'no', label: 'No', width: 60, align: 'center' },
      { key: 'id', label: 'ID', width: 120 },
      { key: 'email', label: '이메일', width: 150 },
      { key: 'note', label: '비고', width: 250 },
    ];

    return (
      <div style={{ maxWidth: 580 }}>
        <BeTable columns={columns} data={data} />
      </div>
    );
  },
};
