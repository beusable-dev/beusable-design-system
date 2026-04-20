import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Snackbar from './Snackbar.vue';

describe('Snackbar', () => {
  it('message가 렌더링된다', () => {
    const wrapper = mount(Snackbar, { props: { message: '변경사항이 저장되었습니다.' } });
    expect(wrapper.text()).toContain('변경사항이 저장되었습니다.');
  });

  it('actionLabel이 있으면 버튼/링크가 렌더링된다', () => {
    const wrapper = mount(Snackbar, {
      props: { message: '알림', actionLabel: '실행취소' },
    });
    expect(wrapper.text()).toContain('실행취소');
  });

  it('action 이벤트가 발생한다', async () => {
    const wrapper = mount(Snackbar, {
      props: { message: '알림', actionLabel: '실행취소' },
    });
    const btn = wrapper.findAll('button, a').find((el) => el.text() === '실행취소');
    expect(btn).toBeDefined();
    await btn!.trigger('click');
    expect(wrapper.emitted('action')).toBeTruthy();
  });

  it('closable=true이면 close 버튼이 렌더링되고 click 시 close 이벤트가 발생한다', async () => {
    const onClose = vi.fn();
    const wrapper = mount(Snackbar, {
      props: { message: '알림', closable: true },
      attrs: { onClose },
    });
    const closeBtn = wrapper.find('button[aria-label="닫기"]');
    expect(closeBtn.exists()).toBe(true);
    await closeBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('closable이 없으면 close 버튼이 렌더링되지 않는다', () => {
    const wrapper = mount(Snackbar, { props: { message: '알림' } });
    expect(wrapper.find('button[aria-label="닫기"]').exists()).toBe(false);
  });
});
