import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BeTabBar } from '@beusable-dev/react';

const meta = {
  title: 'Components/Tabs/TabBar',
  component: BeTabBar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof BeTabBar>;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <BeTabBar
      items={[
        { label: 'Sample', value: 'tab1' },
        { label: 'Sample', value: 'tab2' },
        { label: 'Sample', value: 'tab3' },
        { label: 'Sample', value: 'tab4' },
        { label: 'Sample', value: 'tab5' },
      ]}
      defaultValue="tab1"
    />
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('overview');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <BeTabBar
          items={[
            { label: 'Overview', value: 'overview' },
            { label: 'Analytics', value: 'analytics' },
            { label: 'Reports', value: 'reports' },
            { label: 'Settings', value: 'settings' },
          ]}
          value={value}
          onChange={setValue}
        />
        <span style={{ fontSize: 13, color: '#444' }}>Selected: {value}</span>
      </div>
    );
  },
};
