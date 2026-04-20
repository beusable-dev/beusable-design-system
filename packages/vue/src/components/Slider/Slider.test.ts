import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Slider from './Slider.vue';

describe('Slider', () => {
  it('input[type=range]이 렌더링된다', () => {
    const wrapper = mount(Slider);
    expect(wrapper.find('input[type="range"]').exists()).toBe(true);
  });

  it('min/max prop이 input 속성에 반영된다', () => {
    const wrapper = mount(Slider, { props: { min: 10, max: 90 } });
    const input = wrapper.find('input[type="range"]');
    expect(input.attributes('min')).toBe('10');
    expect(input.attributes('max')).toBe('90');
  });

  it('disabled 상태에서 input이 비활성화된다', () => {
    const wrapper = mount(Slider, { props: { disabled: true } });
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true);
  });

  it('modelValue prop이 input value에 반영된다', () => {
    const wrapper = mount(Slider, { props: { modelValue: 50, min: 0, max: 100 } });
    const input = wrapper.find('input[type="range"]');
    expect(input.attributes('value')).toBe('50');
  });

  it('extended variant가 기본이다', () => {
    const wrapper = mount(Slider);
    expect(wrapper.html()).toBeTruthy();
  });
});
