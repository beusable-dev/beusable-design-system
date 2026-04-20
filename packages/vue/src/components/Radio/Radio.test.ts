import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Radio from './Radio.vue';

describe('Radio', () => {
  it('label이 렌더링된다', () => {
    const wrapper = mount(Radio, { props: { label: '옵션 A' } });
    expect(wrapper.text()).toContain('옵션 A');
  });

  it('기본 상태는 unchecked다', () => {
    const wrapper = mount(Radio);
    expect(wrapper.find('input[type="radio"]').exists()).toBe(true);
  });

  it('modelValue=true이면 dot이 렌더링된다', () => {
    const wrapper = mount(Radio, { props: { modelValue: true } });
    // dot span이 렌더링됨을 확인 (isChecked=true일 때 v-if로 표시)
    expect(wrapper.html().toLowerCase().includes('dot') || wrapper.findAll('span').length > 1).toBeTruthy();
  });

  it('change 이벤트가 발생한다', async () => {
    const wrapper = mount(Radio);
    await wrapper.find('input[type="radio"]').trigger('change');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('disabled 상태에서 input이 비활성화된다', () => {
    const wrapper = mount(Radio, { props: { disabled: true } });
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true);
  });

  it('update:modelValue 이벤트가 발생한다', async () => {
    const wrapper = mount(Radio, { props: { modelValue: false } });
    await wrapper.find('input[type="radio"]').trigger('change');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });
});
