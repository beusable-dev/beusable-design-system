import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from '@beusable-dev/react';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    status: {
      description: '색상 상태',
      control: 'radio',
      options: ['normal', 'complete', 'caution'],
      table: { defaultValue: { summary: 'normal' } },
    },
    type: {
      description: '레이아웃 타입 (미지정 시 description 유무로 자동 결정)',
      control: 'radio',
      options: ['a1', 'a2', 'b'],
    },
    message: { description: '메인 텍스트', control: 'text' },
    description: { description: '보조 텍스트 (입력 시 type b로 전환)', control: 'text' },
    icon: { description: '아이콘 CSS 클래스명 (type a1에서 사용)', control: 'text' },
  },
  args: {
    message: 'Toast message',
    status: 'normal',
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ──────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: { message: 'Copied to clipboard', type: 'a2', status: 'complete' },
};

// ─── Types ───────────────────────────────────────────────────────────────────

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 80, fontSize: 13, color: '#777' }}>A-1</span>
        <Toast type="a1" status="complete" message="Complete" />
        <Toast type="a1" status="normal" message="Complete" />
        <Toast type="a1" status="caution" message="Caution" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 80, fontSize: 13, color: '#777' }}>A-2</span>
        <Toast type="a2" status="complete" message="Copied to clipboard" />
        <Toast type="a2" status="normal" message="Copied to clipboard" />
        <Toast type="a2" status="caution" message="Copied to clipboard" />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ width: 80, fontSize: 13, color: '#777', paddingTop: 8 }}>B</span>
        <Toast type="b" status="complete" message="Two weeks of content" description="has been reloaded." />
        <Toast type="b" status="normal" message="Two weeks of content" description="has been reloaded." />
        <Toast type="b" status="caution" message="Two weeks of content" description="has been reloaded." />
      </div>
    </div>
  ),
};

// ─── Status ──────────────────────────────────────────────────────────────────

export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Toast type="a1" status="complete" message="Complete" />
      <Toast type="a1" status="normal" message="Normal" />
      <Toast type="a1" status="caution" message="Caution" />
    </div>
  ),
};

// ─── Multiline ───────────────────────────────────────────────────────────────

export const Multiline: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Toast type="b" status="complete" message="Two weeks of content" description="has been reloaded." />
      <Toast type="b" status="normal" message="Two weeks of content" description="has been reloaded." />
      <Toast type="b" status="caution" message="Two weeks of content" description="has been reloaded." />
    </div>
  ),
};

// ─── Custom Icon ─────────────────────────────────────────────────────────────

export const CustomIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Toast type="a1" status="normal" message="Custom icon (class name)" icon="my-icon-class" />
    </div>
  ),
};
