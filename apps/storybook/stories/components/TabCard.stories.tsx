import type { Meta, StoryObj } from '@storybook/react';
import { BeTabCard } from '@beusable-dev/react';

const meta = {
  title: 'Components/Tabs/TabCard',
  component: BeTabCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof BeTabCard>;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <BeTabCard
      items={[
        { label: 'Ranking', value: 'ranking' },
        { label: 'Journey', value: 'journey' },
        { label: 'Trend', value: 'trend' },
        { label: 'Mine', value: 'mine', color: 'accent' },
      ]}
      defaultValue="ranking"
    />
  ),
};
