import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TabBar from './TabBar.vue';
import TabPill from './TabPill.vue';
import TabCard from './TabCard.vue';
import SegmentControl from './SegmentControl.vue';

const items = [
  { label: '탭 1', value: 'tab1' },
  { label: '탭 2', value: 'tab2' },
  { label: '탭 3', value: 'tab3' },
];

describe('TabBar', () => {
  it('모든 탭 레이블이 렌더링된다', () => {
    const wrapper = mount(TabBar, { props: { items } });
    expect(wrapper.text()).toContain('탭 1');
    expect(wrapper.text()).toContain('탭 2');
  });

  it('첫 번째 탭이 기본 선택된다', () => {
    const wrapper = mount(TabBar, { props: { items } });
    const buttons = wrapper.findAll('button[role="tab"]');
    expect(buttons[0].attributes('aria-selected')).toBe('true');
  });

  it('탭 클릭 시 change 이벤트가 발생한다', async () => {
    const wrapper = mount(TabBar, { props: { items } });
    await wrapper.findAll('button[role="tab"]')[1].trigger('click');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['tab2']);
  });

  it('role="tablist"이 설정된다', () => {
    const wrapper = mount(TabBar, { props: { items } });
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true);
  });
});

describe('TabPill', () => {
  it('탭 클릭 시 선택 상태가 변경된다', async () => {
    const wrapper = mount(TabPill, { props: { items } });
    await wrapper.findAll('button[role="tab"]')[1].trigger('click');
    const buttons = wrapper.findAll('button[role="tab"]');
    expect(buttons[1].attributes('aria-selected')).toBe('true');
  });

  it('disabled 탭은 클릭되지 않는다', async () => {
    const itemsWithDisabled = [
      { label: '탭 1', value: 'tab1' },
      { label: '탭 2', value: 'tab2', disabled: true },
    ];
    const wrapper = mount(TabPill, { props: { items: itemsWithDisabled } });
    const disabledBtn = wrapper.findAll('button[role="tab"]')[1];
    expect((disabledBtn.element as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('TabCard', () => {
  it('카드 탭이 렌더링된다', () => {
    const wrapper = mount(TabCard, { props: { items } });
    expect(wrapper.findAll('button[role="tab"]').length).toBe(3);
  });
});

describe('SegmentControl', () => {
  it('세그먼트 버튼이 렌더링된다', () => {
    const wrapper = mount(SegmentControl, { props: { items } });
    expect(wrapper.findAll('button[role="tab"]').length).toBe(3);
  });

  it('첫 번째 아이템이 기본 선택된다', () => {
    const wrapper = mount(SegmentControl, { props: { items } });
    expect(wrapper.findAll('button[role="tab"]')[0].attributes('aria-selected')).toBe('true');
  });
});
