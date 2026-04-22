import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BeTabPill } from '@beusable-dev/react';

const meta = {
  title: 'Components/Tabs/TabPill',
  component: BeTabPill,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof BeTabPill>;

export default meta;
type Story = StoryObj;

export const TextOnly: Story = {
  render: () => (
    <BeTabPill
      items={[
        { label: 'Click', value: 'click' },
        { label: 'Move', value: 'move' },
        { label: 'Scroll', value: 'scroll' },
        { label: 'Path', value: 'path' },
      ]}
      defaultValue="click"
    />
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <BeTabPill
      items={[
        { label: 'Click', value: 'click' },
        { label: 'Move', value: 'move' },
        { label: 'Scroll', value: 'scroll' },
        { label: 'Path', value: 'path', disabled: true },
      ]}
      defaultValue="click"
    />
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('click');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <BeTabPill
          items={[
            { label: 'Click', value: 'click' },
            { label: 'Move', value: 'move' },
            { label: 'Scroll', value: 'scroll' },
            { label: 'Path', value: 'path' },
          ]}
          value={value}
          onChange={setValue}
        />
        <span style={{ fontSize: 13, color: '#444' }}>Selected: {value}</span>
      </div>
    );
  },
};
