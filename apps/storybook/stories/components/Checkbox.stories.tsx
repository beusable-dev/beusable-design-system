import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BeCheckbox } from '@beusable-dev/react';

const meta = {
  title: 'Components/Checkbox',
  component: BeCheckbox,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BeCheckbox label="Default" />
      <BeCheckbox label="Checked" defaultChecked />
      <BeCheckbox label="Indeterminate" indeterminate />
      <BeCheckbox label="Disabled" disabled />
      <BeCheckbox label="Checked + Disabled" defaultChecked disabled />
      <BeCheckbox label="Indeterminate + Disabled" indeterminate disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BeCheckbox label="Small (s)" size="s" defaultChecked />
      <BeCheckbox label="Medium (m)" size="m" defaultChecked />
      <BeCheckbox label="Large (l)" size="l" defaultChecked />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BeCheckbox label="Primary (default)" color="primary" defaultChecked />
      <BeCheckbox label="Secondary (dark)" color="secondary" defaultChecked />
      <BeCheckbox label="Action (green)" color="action" defaultChecked />
      <BeCheckbox label="Primary indeterminate" color="primary" indeterminate />
      <BeCheckbox label="Secondary indeterminate" color="secondary" indeterminate />
      <BeCheckbox label="Action indeterminate" color="action" indeterminate />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <BeCheckbox
          label="Controlled Checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <BeCheckbox
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
