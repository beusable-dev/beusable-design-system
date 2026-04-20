import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TextField from './TextField.vue';

describe('TextField', () => {
  it('placeholder가 렌더링된다', () => {
    const wrapper = mount(TextField, { props: { placeholder: '이름 입력' } });
    const input = wrapper.find('input');
    expect(input.attributes('placeholder')).toBe('이름 입력');
  });

  it('label이 렌더링된다', () => {
    const wrapper = mount(TextField, { props: { label: '이름' } });
    expect(wrapper.find('label').text()).toBe('이름');
  });

  it('defaultValue로 초기값이 설정된다', () => {
    const wrapper = mount(TextField, { props: { defaultValue: '홍길동' } });
    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('홍길동');
  });

  it('입력 시 update:modelValue 이벤트가 발생한다', async () => {
    const wrapper = mount(TextField, { props: { modelValue: '' } });
    const input = wrapper.find('input');
    await input.setValue('테스트');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['테스트']);
  });

  it('errorMessage가 표시된다', () => {
    const wrapper = mount(TextField, { props: { errorMessage: '필수 입력 항목입니다.' } });
    expect(wrapper.text()).toContain('필수 입력 항목입니다.');
  });

  it('message가 표시된다', () => {
    const wrapper = mount(TextField, { props: { message: '8자 이상 입력하세요.' } });
    expect(wrapper.text()).toContain('8자 이상 입력하세요.');
  });

  it('disabled 상태에서 input이 비활성화된다', () => {
    const wrapper = mount(TextField, { props: { disabled: true } });
    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).disabled).toBe(true);
  });

  it('multiline=true이면 textarea가 렌더링된다', () => {
    const wrapper = mount(TextField, { props: { multiline: true } });
    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('type=password이면 password 타입 input이 렌더링된다', () => {
    const wrapper = mount(TextField, { props: { type: 'password' } });
    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('password');
  });
});
