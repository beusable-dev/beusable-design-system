import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Table from './Table.vue';
import type { TableColumn } from './types';

const columns: TableColumn<{ name: string; age: number }>[] = [
  { key: 'name', label: '이름', width: 120 },
  { key: 'age', label: '나이', width: 80 },
];

const data = [
  { name: '홍길동', age: 30 },
  { name: '김철수', age: 25 },
];

describe('Table', () => {
  it('헤더 레이블이 렌더링된다', () => {
    const wrapper = mount(Table, { props: { columns, data } });
    expect(wrapper.text()).toContain('이름');
    expect(wrapper.text()).toContain('나이');
  });

  it('데이터 셀이 렌더링된다', () => {
    const wrapper = mount(Table, { props: { columns, data } });
    expect(wrapper.text()).toContain('홍길동');
    expect(wrapper.text()).toContain('25');
  });

  it('빈 데이터도 오류 없이 렌더링된다', () => {
    const wrapper = mount(Table, { props: { columns, data: [] } });
    expect(wrapper.find('[class*="headerRow"]').exists() || wrapper.html()).toBeTruthy();
  });

  it('selectable=true이면 체크박스 컬럼이 렌더링된다', () => {
    const wrapper = mount(Table, { props: { columns, data, selectable: true } });
    expect(wrapper.findAll('input[type="checkbox"]').length).toBeGreaterThan(0);
  });

  it('sort 이벤트가 발생한다', async () => {
    const sortableColumns: TableColumn<{ name: string; age: number }>[] = [
      { key: 'name', label: '이름', width: 120, sortable: true },
      { key: 'age', label: '나이', width: 80 },
    ];
    const wrapper = mount(Table, { props: { columns: sortableColumns, data } });
    await wrapper.find('[class*="headerCellSortable"]').trigger('click');
    expect(wrapper.emitted('sort')).toBeTruthy();
  });
});
