import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Toast from './Toast.vue';

describe('Toast', () => {
  it('message가 렌더링된다', () => {
    const wrapper = mount(Toast, { props: { message: '저장되었습니다.' } });
    expect(wrapper.text()).toContain('저장되었습니다.');
  });

  it('role="status"와 aria-live="polite"가 설정된다', () => {
    const wrapper = mount(Toast, { props: { message: '알림' } });
    const el = wrapper.find('[role="status"]');
    expect(el.exists()).toBe(true);
    expect(el.attributes('aria-live')).toBe('polite');
  });

  it('description이 있으면 type b로 렌더링된다', () => {
    const wrapper = mount(Toast, {
      props: { message: '제목', description: '상세 설명' },
    });
    expect(wrapper.text()).toContain('상세 설명');
  });

  it('icon prop이 있으면 type a1으로 렌더링된다', () => {
    const wrapper = mount(Toast, {
      props: { message: '완료', icon: 'icon-check' },
    });
    expect(wrapper.find('i').exists()).toBe(true);
  });

  it('icon 없이 message만 있으면 type a2로 렌더링된다', () => {
    const wrapper = mount(Toast, { props: { message: '알림 메시지' } });
    expect(wrapper.find('i').exists()).toBe(false);
  });
});
