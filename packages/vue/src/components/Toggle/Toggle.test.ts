import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Toggle from './Toggle.vue';

describe('Toggle', () => {
  it('기본 상태는 OFF다', () => {
    const wrapper = mount(Toggle);
    const input = wrapper.find('input[type="checkbox"]');
    expect((input.element as HTMLInputElement).checked).toBe(false);
  });

  it('modelValue=true이면 ON 상태로 렌더링된다', () => {
    const wrapper = mount(Toggle, { props: { modelValue: true } });
    const input = wrapper.find('input[type="checkbox"]');
    expect(input.attributes('aria-checked')).toBe('true');
  });

  it('label이 렌더링된다', () => {
    const wrapper = mount(Toggle, { props: { label: '알림 설정' } });
    expect(wrapper.text()).toContain('알림 설정');
  });

  it('showText=true이면 ON/OFF 텍스트가 표시된다', () => {
    const wrapper = mount(Toggle, { props: { showText: true } });
    expect(wrapper.text()).toContain('ON');
    expect(wrapper.text()).toContain('OFF');
  });

  it('showText=false이면 ON/OFF 텍스트가 없다', () => {
    const wrapper = mount(Toggle, { props: { showText: false } });
    expect(wrapper.text()).not.toContain('ON');
    expect(wrapper.text()).not.toContain('OFF');
  });

  it('클릭하면 change 이벤트가 발생한다', async () => {
    const wrapper = mount(Toggle);
    const input = wrapper.find('input[type="checkbox"]');
    await input.trigger('change');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('disabled 상태에서 input이 비활성화된다', () => {
    const wrapper = mount(Toggle, { props: { disabled: true } });
    const input = wrapper.find('input[type="checkbox"]');
    expect((input.element as HTMLInputElement).disabled).toBe(true);
  });

  it('input의 role이 switch다', () => {
    const wrapper = mount(Toggle);
    const input = wrapper.find('input');
    expect(input.attributes('role')).toBe('switch');
  });

  it('modelValue로 제어 모드가 동작한다', () => {
    const wrapper = mount(Toggle, { props: { modelValue: true } });
    const input = wrapper.find('input[type="checkbox"]');
    expect(input.attributes('aria-checked')).toBe('true');
  });
});
