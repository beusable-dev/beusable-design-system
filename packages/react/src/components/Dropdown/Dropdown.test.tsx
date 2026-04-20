import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from './Dropdown';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'grape', label: 'Grape' },
];

function setup(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  };
}

// ─── 기본 렌더링 ──────────────────────────────────────────────────────────────

describe('Dropdown — 기본 렌더링', () => {
  it('placeholder가 보인다', () => {
    render(<Dropdown options={OPTIONS} placeholder="선택해주세요" />);
    expect(screen.getByText('선택해주세요')).toBeInTheDocument();
  });

  it('label이 렌더링된다', () => {
    render(<Dropdown options={OPTIONS} label="과일 선택" />);
    expect(screen.getByText('과일 선택')).toBeInTheDocument();
  });

  it('errorMessage가 있으면 에러 문구가 보인다', () => {
    render(<Dropdown options={OPTIONS} errorMessage="필수 항목입니다" />);
    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
  });

  it('message가 있으면 도움말이 보인다', () => {
    render(<Dropdown options={OPTIONS} message="하나를 선택하세요" />);
    expect(screen.getByText('하나를 선택하세요')).toBeInTheDocument();
  });

  it('disabled 상태에서는 트리거 클릭이 무시된다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} disabled />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

// ─── 열기/닫기 ────────────────────────────────────────────────────────────────

describe('Dropdown — 열기/닫기', () => {
  it('트리거 클릭 시 listbox가 열린다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('트리거 재클릭 시 listbox가 닫힌다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('외부 클릭 시 listbox가 닫힌다', async () => {
    const { user } = setup(
      <div>
        <Dropdown options={OPTIONS} />
        <button>Outside</button>
      </div>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByText('Outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Escape 키로 listbox가 닫힌다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

// ─── 단일 선택 ────────────────────────────────────────────────────────────────

describe('Dropdown — 단일 선택', () => {
  it('옵션 클릭 시 해당 값이 트리거에 표시된다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Apple'));
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('onChange가 선택된 값으로 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Dropdown options={OPTIONS} onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith('banana');
  });

  it('disabled 옵션은 클릭해도 선택되지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Dropdown options={OPTIONS} onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Cherry'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('controlled: value prop이 트리거 표시에 반영된다', () => {
    render(<Dropdown options={OPTIONS} value="banana" />);
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('controlled: value 변경 시 표시가 업데이트된다', () => {
    const { rerender } = render(<Dropdown options={OPTIONS} value="apple" />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    rerender(<Dropdown options={OPTIONS} value="grape" />);
    expect(screen.getByText('Grape')).toBeInTheDocument();
  });
});

// ─── 다중 선택 ────────────────────────────────────────────────────────────────

describe('Dropdown — 다중 선택 (multiple)', () => {
  it('여러 옵션을 선택할 수 있다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <Dropdown options={OPTIONS} multiple onChange={onChange} />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Apple'));
    expect(onChange).toHaveBeenCalledWith(['apple']);

    await user.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith(['apple', 'banana']);
  });

  it('이미 선택된 항목을 클릭하면 해제된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <Dropdown options={OPTIONS} multiple value={['apple', 'banana']} onChange={onChange} />,
    );
    await user.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    await user.click(within(listbox).getByText('Apple'));
    expect(onChange).toHaveBeenCalledWith(['banana']);
  });

  it('선택 후 listbox가 닫히지 않는다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} multiple />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Apple'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('선택된 항목들이 트리거에 콤마로 표시된다', () => {
    render(<Dropdown options={OPTIONS} multiple value={['apple', 'banana']} />);
    expect(screen.getByText('Apple, Banana')).toBeInTheDocument();
  });
});

// ─── 키보드 네비게이션 ───────────────────────────────────────────────────────

describe('Dropdown — 키보드 네비게이션', () => {
  it('ArrowDown으로 listbox가 열린다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} />);
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('Enter로 listbox가 열린다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} />);
    screen.getByRole('combobox').focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('ArrowDown/Up으로 포커스 이동 후 Enter로 선택된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Dropdown options={OPTIONS} onChange={onChange} />);
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}'); // open
    await user.keyboard('{ArrowDown}'); // index 0 → Apple
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  it('disabled 옵션은 ArrowDown 이동 시 건너뛴다', async () => {
    // Cherry(index 2)가 disabled — ArrowDown 2번이면 Grape(index 3)로 가야 함
    const onChange = vi.fn();
    const { user } = setup(<Dropdown options={OPTIONS} onChange={onChange} />);
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}'); // open
    await user.keyboard('{ArrowDown}'); // Apple
    await user.keyboard('{ArrowDown}'); // Banana
    await user.keyboard('{ArrowDown}'); // Cherry is disabled → Grape
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('grape');
  });
});

// ─── 검색 (searchable) ───────────────────────────────────────────────────────

describe('Dropdown — 검색 (searchable)', () => {
  it('열리면 검색 input이 포커스된다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} searchable />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('검색어 입력 시 매칭 옵션만 표시된다', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} searchable />);
    await user.click(screen.getByRole('combobox'));
    const input = screen.getByRole('combobox');
    await user.type(input, 'ap');
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Grape')).toBeInTheDocument();
    expect(within(listbox).queryByText('Banana')).not.toBeInTheDocument();
  });

  it('검색 결과 없으면 "검색 결과 없음" 표시', async () => {
    const { user } = setup(<Dropdown options={OPTIONS} searchable />);
    await user.click(screen.getByRole('combobox'));
    const input = screen.getByRole('combobox');
    await user.type(input, 'zzz');
    expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();
  });
});
