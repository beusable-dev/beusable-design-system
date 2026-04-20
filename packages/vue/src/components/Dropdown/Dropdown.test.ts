import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Dropdown from './Dropdown.vue';

const options = [
  { value: 'a', label: '옵션 A' },
  { value: 'b', label: '옵션 B' },
  { value: 'c', label: '옵션 C', disabled: true },
];

describe('Dropdown', () => {
  it('placeholder가 표시된다', () => {
    const wrapper = mount(Dropdown, { props: { options, placeholder: '선택하세요' } });
    expect(wrapper.text()).toContain('선택하세요');
  });

  it('트리거 클릭 시 옵션 목록이 열린다', async () => {
    const wrapper = mount(Dropdown, { props: { options } });
    await wrapper.find('[role="combobox"]').trigger('click');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
  });

  it('옵션 클릭 시 해당 옵션이 선택된다', async () => {
    const wrapper = mount(Dropdown, { props: { options } });
    await wrapper.find('[role="combobox"]').trigger('click');
    const items = wrapper.findAll('[role="option"]');
    await items[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['a']);
  });

  it('disabled 옵션은 선택되지 않는다', async () => {
    const wrapper = mount(Dropdown, { props: { options } });
    await wrapper.find('[role="combobox"]').trigger('click');
    const disabledItem = wrapper.findAll('[role="option"]').find(
      (el) => el.attributes('aria-disabled') === 'true',
    );
    if (disabledItem) {
      await disabledItem.trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    }
  });

  it('label prop이 있으면 렌더링된다', () => {
    const wrapper = mount(Dropdown, { props: { options, label: '카테고리' } });
    expect(wrapper.text()).toContain('카테고리');
  });

  it('disabled prop이면 트리거 클릭 시 목록이 열리지 않는다', async () => {
    const wrapper = mount(Dropdown, { props: { options, disabled: true } });
    await wrapper.find('[aria-disabled="true"], [tabindex="-1"]').trigger('click');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });
});
