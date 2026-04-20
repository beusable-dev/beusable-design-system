import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from '@beusable-dev/react';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: '슬라이더 형태 (extended: ±버튼 포함, simplified: 트랙만)',
      control: 'radio',
      options: ['extended', 'simplified'],
      table: { defaultValue: { summary: 'extended' } },
    },
    min:          { description: '최솟값', control: 'number', table: { defaultValue: { summary: '0' } } },
    max:          { description: '최댓값', control: 'number', table: { defaultValue: { summary: '100' } } },
    step:         { description: '단계 값', control: 'number', table: { defaultValue: { summary: '1' } } },
    disabled:     { description: '비활성화 여부', control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    defaultValue: { description: '초기 값 (uncontrolled)', control: 'number' },
    value:        { description: '현재 값 (controlled)', control: 'number' },
    onChange:     { description: '값 변경 콜백', control: false },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof Slider>;

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Extended: Story = {
  render: () => (
    <div style={{ width: 200 }}>
      <Slider variant="extended" defaultValue={50} />
    </div>
  ),
};

export const Simplified: Story = {
  render: () => (
    <div style={{ width: 200 }}>
      <Slider variant="simplified" defaultValue={50} />
    </div>
  ),
};

// ─── Comparison ──────────────────────────────────────────────────────────────

export const VariantComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ marginBottom: 8, fontSize: 14, color: '#888' }}>Extended version</p>
        <div style={{ width: 200 }}>
          <Slider variant="extended" defaultValue={50} />
        </div>
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 14, color: '#888' }}>Simplified version</p>
        <div style={{ width: 200 }}>
          <Slider variant="simplified" defaultValue={50} />
        </div>
      </div>
    </div>
  ),
};

// ─── Controlled ──────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(30);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 200 }}>
          <Slider value={value} onChange={setValue} />
        </div>
        <span style={{ fontSize: 13, color: '#444' }}>Value: {value}</span>
      </div>
    );
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 200 }}>
        <Slider variant="extended" defaultValue={40} disabled />
      </div>
      <div style={{ width: 200 }}>
        <Slider variant="simplified" defaultValue={60} disabled />
      </div>
    </div>
  ),
};

// ─── Custom Range ─────────────────────────────────────────────────────────────

export const CustomRange: Story = {
  render: () => {
    const [value, setValue] = useState(5);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 300 }}>
          <Slider min={0} max={10} step={1} value={value} onChange={setValue} />
        </div>
        <span style={{ fontSize: 13, color: '#444' }}>Value: {value} / 10</span>
      </div>
    );
  },
};

// ─── Widths ──────────────────────────────────────────────────────────────────

export const Widths: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 121 }}>
        <Slider variant="extended" defaultValue={70} />
      </div>
      <div style={{ width: 200 }}>
        <Slider variant="extended" defaultValue={50} />
      </div>
      <div style={{ width: 300 }}>
        <Slider variant="extended" defaultValue={30} />
      </div>
      <div style={{ width: 97 }}>
        <Slider variant="simplified" defaultValue={50} />
      </div>
      <div style={{ width: 200 }}>
        <Slider variant="simplified" defaultValue={50} />
      </div>
    </div>
  ),
};
