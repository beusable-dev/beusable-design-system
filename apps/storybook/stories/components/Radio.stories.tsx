import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BeRadio } from '@beusable-dev/react';

const meta = {
  title: 'Components/Radio',
  component: BeRadio,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof BeRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BeRadio label="Default" name="radio-states" value="a" />
      <BeRadio label="Checked" name="radio-states" value="b" defaultChecked />
      <BeRadio label="Disabled" name="radio-states-disabled" value="c" disabled />
      <BeRadio label="Checked + Disabled" name="radio-states-disabled" value="d" defaultChecked disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BeRadio label="Small (s)" size="s" name="radio-sizes" value="s" defaultChecked />
      <BeRadio label="Medium (m)" size="m" name="radio-sizes" value="m" />
      <BeRadio label="Large (l)" size="l" name="radio-sizes" value="l" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BeRadio label="Primary (default)" color="primary" name="radio-colors-primary" value="p" defaultChecked />
      <BeRadio label="Secondary (dark)" color="secondary" name="radio-colors-secondary" value="s" defaultChecked />
      <BeRadio label="Action (green)" color="action" name="radio-colors-action" value="a" defaultChecked />
    </div>
  ),
};

export const Group: Story = {
  render: () => {
    const [value, setValue] = useState('option1');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {['option1', 'option2', 'option3'].map((opt) => (
          <BeRadio
            key={opt}
            label={opt}
            name="radio-group"
            value={opt}
            checked={value === opt}
            onChange={() => setValue(opt)}
          />
        ))}
        <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};
