import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BeToggle } from '@beusable-dev/react';

const meta = {
  title: 'Components/Toggle',
  component: BeToggle,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof BeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BeToggle label="Default (OFF)" />
      <BeToggle label="Checked (ON)" defaultChecked />
      <BeToggle label="Disabled (OFF)" disabled />
      <BeToggle label="Disabled (ON)" defaultChecked disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BeToggle label="Medium (m)" size="m" defaultChecked />
      <BeToggle label="Small (s)" size="s" defaultChecked />
    </div>
  ),
};

export const NoText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BeToggle label="Medium OFF" showText={false} size="m" />
      <BeToggle label="Medium ON" showText={false} size="m" defaultChecked />
      <BeToggle label="Medium Disabled OFF" showText={false} size="m" disabled />
      <BeToggle label="Medium Disabled ON" showText={false} size="m" defaultChecked disabled />
      <BeToggle label="XS OFF" showText={false} size="xs" />
      <BeToggle label="XS ON" showText={false} size="xs" defaultChecked />
      <BeToggle label="XS Disabled OFF" showText={false} size="xs" disabled />
      <BeToggle label="XS Disabled ON" showText={false} size="xs" defaultChecked disabled />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <BeToggle
          label="Controlled Toggle"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
          State: <strong>{checked ? 'ON' : 'OFF'}</strong>
        </p>
      </div>
    );
  },
};
