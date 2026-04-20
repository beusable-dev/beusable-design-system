import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio } from '@beusable-dev/react';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Radio label="Default" name="radio-states" value="a" />
      <Radio label="Checked" name="radio-states" value="b" defaultChecked />
      <Radio label="Disabled" name="radio-states-disabled" value="c" disabled />
      <Radio label="Checked + Disabled" name="radio-states-disabled" value="d" defaultChecked disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Radio label="Small (s)" size="s" name="radio-sizes" value="s" defaultChecked />
      <Radio label="Medium (m)" size="m" name="radio-sizes" value="m" />
      <Radio label="Large (l)" size="l" name="radio-sizes" value="l" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Radio label="Primary (default)" color="primary" name="radio-colors-primary" value="p" defaultChecked />
      <Radio label="Secondary (dark)" color="secondary" name="radio-colors-secondary" value="s" defaultChecked />
      <Radio label="Action (green)" color="action" name="radio-colors-action" value="a" defaultChecked />
    </div>
  ),
};

export const Group: Story = {
  render: () => {
    const [value, setValue] = useState('option1');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {['option1', 'option2', 'option3'].map((opt) => (
          <Radio
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
