import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalDivider } from '.';

function setup(ui: React.ReactElement) {
  return { user: userEvent.setup(), ...render(ui) };
}

// ─── Modal — 열기/닫기 ────────────────────────────────────────────────────────

describe('Modal — 열기/닫기', () => {
  it('open=false이면 렌더링되지 않는다', () => {
    render(<Modal open={false}><p>내용</p></Modal>);
    expect(screen.queryByText('내용')).not.toBeInTheDocument();
  });

  it('open=true이면 children이 렌더링된다', () => {
    render(<Modal open><p>모달 내용</p></Modal>);
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('오버레이 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    const { user } = setup(
      <Modal open onClose={onClose}>
        <p>내용</p>
      </Modal>,
    );
    // dialog role의 바깥 overlay를 클릭 — overlay는 dialog의 부모
    const dialog = screen.getByRole('dialog');
    // overlay = dialog의 부모 div
    await user.click(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('모달 내부 클릭 시 onClose가 호출되지 않는다', async () => {
    const onClose = vi.fn();
    const { user } = setup(
      <Modal open onClose={onClose}>
        <p>내용</p>
      </Modal>,
    );
    await user.click(screen.getByText('내용'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Escape 키 입력 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    const { user } = setup(
      <Modal open onClose={onClose}>
        <button>포커스 대상</button>
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });
});

// ─── Modal — ARIA ─────────────────────────────────────────────────────────────

describe('Modal — ARIA', () => {
  it('dialog role이 있다', () => {
    render(<Modal open><p>내용</p></Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('aria-modal이 true이다', () => {
    render(<Modal open><p>내용</p></Modal>);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

// ─── ModalHeader ──────────────────────────────────────────────────────────────

describe('ModalHeader', () => {
  it('title이 표시된다', () => {
    render(
      <Modal open>
        <ModalHeader title="확인" />
      </Modal>,
    );
    expect(screen.getByText('확인')).toBeInTheDocument();
  });

  it('description이 표시된다', () => {
    render(
      <Modal open>
        <ModalHeader title="제목" description="설명 텍스트" />
      </Modal>,
    );
    expect(screen.getByText('설명 텍스트')).toBeInTheDocument();
  });

  it('onClose가 있으면 닫기 버튼이 표시된다', () => {
    render(
      <Modal open>
        <ModalHeader onClose={() => {}} />
      </Modal>,
    );
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    const { user } = setup(
      <Modal open>
        <ModalHeader title="제목" onClose={onClose} />
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('step prop이 있으면 스텝 뱃지가 표시된다', () => {
    render(
      <Modal open>
        <ModalHeader step={2} />
      </Modal>,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

// ─── ModalBody ───────────────────────────────────────────────────────────────

describe('ModalBody', () => {
  it('children이 렌더링된다', () => {
    render(
      <Modal open>
        <ModalBody>
          <p>본문 내용</p>
        </ModalBody>
      </Modal>,
    );
    expect(screen.getByText('본문 내용')).toBeInTheDocument();
  });
});

// ─── ModalFooter ─────────────────────────────────────────────────────────────

describe('ModalFooter', () => {
  it('children(버튼)이 렌더링된다', () => {
    render(
      <Modal open>
        <ModalFooter>
          <button>확인</button>
        </ModalFooter>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });

  it('leftAction이 렌더링된다', () => {
    render(
      <Modal open>
        <ModalFooter leftAction={<button>뒤로</button>}>
          <button>다음</button>
        </ModalFooter>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: '뒤로' })).toBeInTheDocument();
  });
});

// ─── ModalDivider ────────────────────────────────────────────────────────────

describe('ModalDivider', () => {
  it('divider 요소가 렌더링된다', () => {
    const { container } = render(
      <Modal open>
        <ModalDivider />
      </Modal>,
    );
    // ModalDivider는 <div className="divider" />로 구현됨
    expect(container.querySelector('.divider')).toBeInTheDocument();
  });
});

// ─── 포커스 트랩 ──────────────────────────────────────────────────────────────

describe('Modal — 포커스 트랩', () => {
  it('open 시 모달 내 첫 번째 focusable 요소에 포커스가 잡힌다', async () => {
    render(
      <Modal open>
        <button>첫 버튼</button>
        <button>두 번째 버튼</button>
      </Modal>,
    );
    // 포커스는 첫 버튼에 잡혀야 함
    expect(screen.getByRole('button', { name: '첫 버튼' })).toHaveFocus();
  });
});
