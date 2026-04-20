import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '@beusable-dev/react';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Checkbox label="Default" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Checked + Disabled" defaultChecked disabled />
      <Checkbox label="Indeterminate + Disabled" indeterminate disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Checkbox label="Small (s)" size="s" defaultChecked />
      <Checkbox label="Medium (m)" size="m" defaultChecked />
      <Checkbox label="Large (l)" size="l" defaultChecked />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Checkbox label="Primary (default)" color="primary" defaultChecked />
      <Checkbox label="Secondary (dark)" color="secondary" defaultChecked />
      <Checkbox label="Action (green)" color="action" defaultChecked />
      <Checkbox label="Primary indeterminate" color="primary" indeterminate />
      <Checkbox label="Secondary indeterminate" color="secondary" indeterminate />
      <Checkbox label="Action indeterminate" color="action" indeterminate />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Checkbox
          label="Controlled Checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <Checkbox
          label="Controlled Indeterminate"
          checked={false}
          indeterminate={indeterminate}
          onChange={() => setIndeterminate((prev) => !prev)}
        />
        <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
          Checked: <strong>{String(checked)}</strong> / Indeterminate: <strong>{String(indeterminate)}</strong>
        </p>
      </div>
    );
  },
};
