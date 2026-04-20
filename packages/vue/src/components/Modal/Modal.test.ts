import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Modal from './Modal.vue';

describe('Modal', () => {
  it('open=false이면 렌더링되지 않는다', () => {
    const wrapper = mount(Modal, { props: { open: false } });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('open=true이면 다이얼로그가 렌더링된다', () => {
    const wrapper = mount(Modal, { props: { open: true } });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it('role="dialog"와 aria-modal="true"가 설정된다', () => {
    const wrapper = mount(Modal, { props: { open: true } });
    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.attributes('aria-modal')).toBe('true');
  });

  it('슬롯 콘텐츠가 렌더링된다', () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      slots: { default: '<p>모달 내용</p>' },
    });
    expect(wrapper.text()).toContain('모달 내용');
  });

  it('오버레이 클릭 시 close 이벤트가 발생한다', async () => {
    const wrapper = mount(Modal, { props: { open: true } });
    await wrapper.find('.' + wrapper.find('[role="dialog"]').element.parentElement!.className.split(' ')[0]).trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('다이얼로그 내부 클릭 시 close 이벤트가 발생하지 않는다', async () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      slots: { default: '<button>내부 버튼</button>' },
    });
    await wrapper.find('[role="dialog"]').trigger('click');
    expect(wrapper.emitted('close')).toBeFalsy();
  });

  it('width prop이 있으면 인라인 스타일이 적용된다', () => {
    const wrapper = mount(Modal, { props: { open: true, width: 526 } });
    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.attributes('style')).toContain('526px');
  });

  it('Escape 키를 누르면 close 이벤트가 발생한다', async () => {
    const wrapper = mount(Modal, { props: { open: true } });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
