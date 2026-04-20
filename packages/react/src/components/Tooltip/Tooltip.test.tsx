import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

function setup(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  };
}

// ─── 기본 렌더링 ──────────────────────────────────────────────────────────────

describe('Tooltip — 기본 렌더링', () => {
  it('content가 렌더링된다', () => {
    render(<Tooltip content="도움말 텍스트" />);
    expect(screen.getByText('도움말 텍스트')).toBeInTheDocument();
  });

  it('maxWidth 기본값이 500px이다', () => {
    const { container } = render(<Tooltip content="툴팁" />);
    expect(container.firstChild).toHaveStyle({ maxWidth: '500px' });
  });

  it('maxWidth를 커스텀 설정할 수 있다', () => {
    const { container } = render(<Tooltip content="툴팁" maxWidth={300} />);
    expect(container.firstChild).toHaveStyle({ maxWidth: '300px' });
  });
});

// ─── 닫기 버튼 ────────────────────────────────────────────────────────────────

describe('Tooltip — 닫기 버튼', () => {
  it('onClose가 있으면 닫기 버튼이 렌더링된다', () => {
    render(<Tooltip content="툴팁" onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    const { user } = setup(<Tooltip content="툴팁" onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('onClose가 없으면 닫기 버튼이 렌더링되지 않는다', () => {
    render(<Tooltip content="툴팁" />);
    expect(screen.queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
  });
});

// ─── 액션 버튼 ────────────────────────────────────────────────────────────────

describe('Tooltip — 액션 버튼', () => {
  it('actionLabel + onAction이 있으면 버튼이 렌더링된다', () => {
    render(<Tooltip content="툴팁" actionLabel="확인" onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });

  it('액션 버튼 클릭 시 onAction이 호출된다', async () => {
    const onAction = vi.fn();
    const { user } = setup(
      <Tooltip content="툴팁" actionLabel="확인" onAction={onAction} />,
    );
    await user.click(screen.getByRole('button', { name: '확인' }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('actionLabel만 있고 onAction 없으면 버튼이 렌더링되지 않는다', () => {
    render(<Tooltip content="툴팁" actionLabel="확인" />);
    expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
  });
});

// ─── 링크 ─────────────────────────────────────────────────────────────────────

describe('Tooltip — 링크', () => {
  it('linkLabel + linkHref가 있으면 링크가 렌더링된다', () => {
    render(<Tooltip content="툴팁" linkLabel="자세히 보기" linkHref="https://example.com" />);
    const link = screen.getByRole('link', { name: /자세히 보기/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('linkHref에 javascript: 가 포함되면 # 으로 치환된다', () => {
    render(<Tooltip content="툴팁" linkLabel="링크" linkHref="javascript:alert(1)" />);
    expect(screen.getByRole('link', { name: /링크/i })).toHaveAttribute('href', '#');
  });

  it('앞에 공백이 있는 javascript: URL도 차단된다', () => {
    render(<Tooltip content="툴팁" linkLabel="링크" linkHref=" javascript:alert(1)" />);
    expect(screen.getByRole('link', { name: /링크/i })).toHaveAttribute('href', '#');
  });

  it('linkLabel만 있고 linkHref 없으면 링크가 렌더링되지 않는다', () => {
    render(<Tooltip content="툴팁" linkLabel="자세히 보기" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('외부 링크에 target="_blank"와 rel="noopener noreferrer"가 있다', () => {
    render(<Tooltip content="툴팁" linkLabel="링크" linkHref="https://example.com" />);
    const link = screen.getByRole('link', { name: /링크/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

// ─── 화살표 방향 ──────────────────────────────────────────────────────────────

describe('Tooltip — arrow', () => {
  const arrows = [
    'bottom-left', 'bottom-center', 'bottom-right',
    'top-left', 'top-center', 'top-right',
    'left', 'right',
  ] as const;

  it.each(arrows)('arrow="%s" 렌더링', (arrow) => {
    render(<Tooltip content="툴팁" arrow={arrow} />);
    expect(screen.getByText('툴팁')).toBeInTheDocument();
  });
});
