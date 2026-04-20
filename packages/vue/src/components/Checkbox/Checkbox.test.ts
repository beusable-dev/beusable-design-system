import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Checkbox from './Checkbox.vue';

describe('Checkbox', () => {
  it('label이 렌더링된다', () => {
    const wrapper = mount(Checkbox, { props: { label: '동의합니다' } });
    expect(wrapper.text()).toContain('동의합니다');
  });

  it('기본 상태는 unchecked다', () => {
    const wrapper = mount(Checkbox);
    const input = wrapper.find('input[type="checkbox"]');
    expect((input.element as HTMLInputElement).checked).toBe(false);
  });

  it('modelValue=true이면 체크된 상태로 렌더링된다', () => {
    const wrapper = mount(Checkbox, { props: { modelValue: true } });
    const input = wrapper.find('input[type="checkbox"]');
    expect(input.attributes('aria-checked')).toBe('true');
  });

  it('클릭하면 change 이벤트가 발생한다', async () => {
    const wrapper = mount(Checkbox);
    const input = wrapper.find('input[type="checkbox"]');
    await input.trigger('change');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('disabled 상태에서 input이 비활성화된다', () => {
    const wrapper = mount(Checkbox, { props: { disabled: true } });
    const input = wrapper.find('input[type="checkbox"]');
    expect((input.element as HTMLInputElement).disabled).toBe(true);
  });

  it('indeterminate일 때 aria-checked가 mixed다', () => {
    const wrapper = mount(Checkbox, { props: { indeterminate: true } });
    const input = wrapper.find('input[type="checkbox"]');
    expect(input.attributes('aria-checked')).toBe('mixed');
  });

  it('modelValue로 제어 모드가 동작한다', async () => {
    const wrapper = mount(Checkbox, { props: { modelValue: true } });
    const input = wrapper.find('input[type="checkbox"]');
    expect(input.attributes('aria-checked')).toBe('true');
  });

  it('클릭 시 update:modelValue 이벤트가 발생한다', async () => {
    const wrapper = mount(Checkbox, { props: { modelValue: false } });
    const input = wrapper.find('input[type="checkbox"]');
    await input.trigger('change');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });
});
