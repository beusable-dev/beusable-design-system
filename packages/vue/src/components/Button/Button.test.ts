import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  it('기본 슬롯 텍스트를 렌더링한다', () => {
    const wrapper = mount(Button, { slots: { default: '확인' } });
    expect(wrapper.text()).toBe('확인');
  });

  it('disabled 상태에서 버튼이 비활성화된다', () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    expect(wrapper.attributes('disabled')).toBeDefined();
  });

  it('loading 상태에서 버튼이 비활성화되고 aria-busy가 true다', () => {
    const wrapper = mount(Button, { props: { loading: true } });
    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.attributes('aria-busy')).toBe('true');
  });

  it('loading 상태에서 spinner SVG가 렌더링된다', () => {
    const wrapper = mount(Button, { props: { loading: true } });
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('클릭 이벤트가 발생한다', async () => {
    const wrapper = mount(Button, { slots: { default: '클릭' } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('disabled일 때 클릭 이벤트가 발생하지 않는다', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: '클릭' },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });
});
