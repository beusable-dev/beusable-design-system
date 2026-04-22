import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BeSegmentControl } from '@beusable-dev/react';

const meta = {
  title: 'Components/Tabs/SegmentControl',
  component: BeSegmentControl,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof BeSegmentControl>;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <BeSegmentControl
      items={[
        { label: 'Rank', value: 'rank' },
        { label: 'Journey', value: 'journey' },
        { label: 'Trend', value: 'trend' },
        { label: 'Mine', value: 'mine' },
      ]}
      defaultValue="rank"
    />
  ),
};

export const MiddleSelected: Story = {
  render: () => (
    <BeSegmentControl
      items={[
        { label: 'Rank', value: 'rank' },
        { label: 'Journey', value: 'journey' },
        { label: 'Trend', value: 'trend' },
        { label: 'Mine', value: 'mine' },
      ]}
      defaultValue="journey"
    />
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('rank');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <BeSegmentControl
          items={[
            { label: 'Rank', value: 'rank' },
            { label: 'Journey', value: 'journey' },
            { label: 'Trend', value: 'trend' },
            { label: 'Mine', value: 'mine' },
          ]}
          value={value}
          onChange={setValue}
        />
        <span style={{ fontSize: 13, color: '#444' }}>Selected: {value}</span>
      </div>
    );
  },
};
