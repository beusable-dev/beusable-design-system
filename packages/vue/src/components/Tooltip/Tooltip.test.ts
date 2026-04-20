import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Tooltip from './Tooltip.vue';

describe('Tooltip', () => {
  it('content prop이 렌더링된다', () => {
    const wrapper = mount(Tooltip, { props: { content: '도움말 텍스트' } });
    expect(wrapper.text()).toContain('도움말 텍스트');
  });

  it('슬롯 콘텐츠가 content prop보다 우선 렌더링된다', () => {
    const wrapper = mount(Tooltip, {
      props: { content: '기본 텍스트' },
      slots: { default: '<span>슬롯 텍스트</span>' },
    });
    expect(wrapper.text()).toContain('슬롯 텍스트');
  });

  it('linkLabel + linkHref가 있으면 링크가 렌더링된다', () => {
    const wrapper = mount(Tooltip, {
      props: { content: '도움말', linkLabel: '자세히', linkHref: 'https://example.com' },
    });
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('https://example.com');
  });

  it('javascript: URL이 #으로 차단된다', () => {
    const wrapper = mount(Tooltip, {
      props: { content: '도움말', linkLabel: '링크', linkHref: 'javascript:alert(1)' },
    });
    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe('#');
  });

  it('maxWidth prop이 인라인 스타일에 반영된다', () => {
    const wrapper = mount(Tooltip, { props: { content: '도움말', maxWidth: 300 } });
    expect(wrapper.attributes('style')).toContain('300px');
  });

  it('arrow prop이 있으면 arrow 엘리먼트가 렌더링된다', () => {
    const wrapper = mount(Tooltip, { props: { content: '도움말', arrow: 'bottom-center' } });
    expect(wrapper.find('[class*="arrow"]').exists()).toBe(true);
  });

  it('closable=true이면 close 버튼이 렌더링되고 click 시 close 이벤트가 발생한다', async () => {
    const onClose = vi.fn();
    const wrapper = mount(Tooltip, {
      props: { content: '도움말', closable: true },
      attrs: { onClose },
    });
    const closeBtn = wrapper.find('button[aria-label="닫기"]');
    expect(closeBtn.exists()).toBe(true);
    await closeBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('closable이 없으면 close 버튼이 렌더링되지 않는다', () => {
    const wrapper = mount(Tooltip, { props: { content: '도움말' } });
    expect(wrapper.find('button[aria-label="닫기"]').exists()).toBe(false);
  });
});
