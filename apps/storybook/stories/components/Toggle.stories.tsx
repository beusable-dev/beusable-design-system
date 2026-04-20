import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toggle } from '@beusable-dev/react';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle label="Default (OFF)" />
      <Toggle label="Checked (ON)" defaultChecked />
      <Toggle label="Disabled (OFF)" disabled />
      <Toggle label="Disabled (ON)" defaultChecked disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle label="Medium (m)" size="m" defaultChecked />
      <Toggle label="Small (s)" size="s" defaultChecked />
    </div>
  ),
};

export const NoText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle label="Medium OFF" showText={false} size="m" />
      <Toggle label="Medium ON" showText={false} size="m" defaultChecked />
      <Toggle label="Medium Disabled OFF" showText={false} size="m" disabled />
      <Toggle label="Medium Disabled ON" showText={false} size="m" defaultChecked disabled />
      <Toggle label="XS OFF" showText={false} size="xs" />
      <Toggle label="XS ON" showText={false} size="xs" defaultChecked />
      <Toggle label="XS Disabled OFF" showText={false} size="xs" disabled />
      <Toggle label="XS Disabled ON" showText={false} size="xs" defaultChecked disabled />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Toggle
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
