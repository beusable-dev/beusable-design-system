import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from './Table';
import type { TableColumn } from './Table';

type Row = { id: number; name: string; age: number };

const COLUMNS: TableColumn<Row>[] = [
  { key: 'id', label: 'ID', width: 60 },
  { key: 'name', label: '이름', sortable: true },
  { key: 'age', label: '나이', sortable: true, align: 'right' },
];

const DATA: Row[] = [
  { id: 1, name: '김철수', age: 30 },
  { id: 2, name: '이영희', age: 25 },
  { id: 3, name: '박민준', age: 35 },
];

function setup(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  };
}

// ─── 기본 렌더링 ──────────────────────────────────────────────────────────────

describe('Table — 기본 렌더링', () => {
  it('헤더 라벨이 렌더링된다', () => {
    render(<Table columns={COLUMNS} data={DATA} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText('나이')).toBeInTheDocument();
  });

  it('데이터 행이 렌더링된다', () => {
    render(<Table columns={COLUMNS} data={DATA} />);
    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.getByText('이영희')).toBeInTheDocument();
    expect(screen.getByText('박민준')).toBeInTheDocument();
  });

  it('데이터가 빈 배열이면 행이 없다', () => {
    render(<Table columns={COLUMNS} data={[]} />);
    expect(screen.queryByText('김철수')).not.toBeInTheDocument();
  });

  it('custom render 함수가 적용된다', () => {
    const columns: TableColumn<Row>[] = [
      ...COLUMNS,
      {
        key: 'name',
        label: '커스텀',
        render: (_value, row) => <strong data-testid={`custom-${row.id}`}>{row.name}</strong>,
      },
    ];
    render(<Table columns={columns} data={DATA} />);
    expect(screen.getByTestId('custom-1')).toBeInTheDocument();
  });
});

// ─── 정렬 ─────────────────────────────────────────────────────────────────────

describe('Table — 정렬', () => {
  it('sortable 헤더 클릭 시 onSort가 asc로 호출된다', async () => {
    const onSort = vi.fn();
    const { user } = setup(
      <Table columns={COLUMNS} data={DATA} onSort={onSort} />,
    );
    await user.click(screen.getByText('이름'));
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('이미 asc 정렬된 컬럼 클릭 시 onSort가 desc로 호출된다', async () => {
    const onSort = vi.fn();
    const { user } = setup(
      <Table columns={COLUMNS} data={DATA} sortKey="name" sortOrder="asc" onSort={onSort} />,
    );
    await user.click(screen.getByText('이름'));
    expect(onSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('sortable이 아닌 헤더 클릭 시 onSort가 호출되지 않는다', async () => {
    const onSort = vi.fn();
    const { user } = setup(
      <Table columns={COLUMNS} data={DATA} onSort={onSort} />,
    );
    await user.click(screen.getByText('ID'));
    expect(onSort).not.toHaveBeenCalled();
  });
});

// ─── 선택 (selectable) ────────────────────────────────────────────────────────

describe('Table — 선택', () => {
  it('selectable=true이면 체크박스가 렌더링된다', () => {
    render(<Table columns={COLUMNS} data={DATA} selectable rowKey="id" />);
    // 헤더 체크박스(1개) + 행 체크박스(3개) = 최소 4개
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(4);
  });

  it('행 체크박스 클릭 시 onSelectedRowKeysChange가 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <Table
        columns={COLUMNS}
        data={DATA}
        selectable
        rowKey="id"
        onSelectedRowKeysChange={onChange}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // 첫 번째 데이터 행
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it('헤더 체크박스 클릭 시 모든 행이 선택된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <Table
        columns={COLUMNS}
        data={DATA}
        selectable
        rowKey="id"
        onSelectedRowKeysChange={onChange}
      />,
    );
    const [headerCheckbox] = screen.getAllByRole('checkbox');
    await user.click(headerCheckbox);
    expect(onChange).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('controlled: selectedRowKeys prop이 선택 상태에 반영된다', () => {
    render(
      <Table
        columns={COLUMNS}
        data={DATA}
        selectable
        rowKey="id"
        selectedRowKeys={[2]}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[2]).toHaveAttribute('checked');
  });

  it('모든 행 선택 해제 시 onSelectedRowKeysChange가 빈 배열로 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <Table
        columns={COLUMNS}
        data={DATA}
        selectable
        rowKey="id"
        selectedRowKeys={[1, 2, 3]}
        onSelectedRowKeysChange={onChange}
      />,
    );
    const [headerCheckbox] = screen.getAllByRole('checkbox');
    await user.click(headerCheckbox);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

// ─── sticky ───────────────────────────────────────────────────────────────────

describe('Table — sticky 컬럼', () => {
  it('sticky=true 컬럼에 sticky 스타일이 적용된다', () => {
    const stickyColumns: TableColumn<Row>[] = [
      { key: 'id', label: 'ID', width: 60, sticky: true },
      { key: 'name', label: '이름' },
      { key: 'age', label: '나이' },
    ];
    const { container } = render(<Table columns={stickyColumns} data={DATA} />);
    const stickyCells = container.querySelectorAll('.headerCellSticky, .bodyCellSticky');
    expect(stickyCells.length).toBeGreaterThan(0);
  });

  it('stickySelectable=true이면 선택 컬럼에 sticky가 적용된다', () => {
    const { container } = render(
      <Table columns={COLUMNS} data={DATA} selectable stickySelectable rowKey="id" />,
    );
    const stickySelection = container.querySelector('.selectionHeaderCell.headerCellSticky');
    expect(stickySelection).toBeInTheDocument();
  });

  it('sticky 컬럼에 width가 없으면 fallback width로 left offset이 누적된다', () => {
    const stickyColumns: TableColumn<Row>[] = [
      { key: 'id', label: 'ID', sticky: true },
      { key: 'name', label: '이름', sticky: true },
      { key: 'age', label: '나이' },
    ];
    const { container } = render(<Table columns={stickyColumns} data={DATA} />);

    const stickyHeaderCells = container.querySelectorAll('.headerCellSticky');
    expect(stickyHeaderCells[0]).toHaveStyle({ left: '0px', width: '160px' });
    expect(stickyHeaderCells[1]).toHaveStyle({ left: '160px', width: '160px' });
  });
});

describe('Table — 컬럼 식별자', () => {
  it('같은 accessor key 컬럼이 있어도 React key 중복 경고가 발생하지 않는다', () => {
    const duplicateKeyColumns: TableColumn<Row>[] = [
      { key: 'name', label: '이름' },
      { key: 'name', label: '이름(복사)' },
    ];
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Table columns={duplicateKeyColumns} data={DATA} />);

    expect(
      consoleErrorSpy.mock.calls.some(([message]) =>
        String(message).includes('Encountered two children with the same key'),
      ),
    ).toBe(false);
    consoleErrorSpy.mockRestore();
  });
});

// ─── headerTone ───────────────────────────────────────────────────────────────

describe('Table — headerTone', () => {
  it('headerTone=dark이면 headerCellDark 클래스가 적용된다', () => {
    const { container } = render(
      <Table columns={COLUMNS} data={DATA} headerTone="dark" />,
    );
    expect(container.querySelector('.headerCellDark')).toBeInTheDocument();
  });

  it('headerTone=light이면 headerCellLight 클래스가 적용된다', () => {
    const { container } = render(
      <Table columns={COLUMNS} data={DATA} headerTone="light" />,
    );
    expect(container.querySelector('.headerCellLight')).toBeInTheDocument();
  });
});
