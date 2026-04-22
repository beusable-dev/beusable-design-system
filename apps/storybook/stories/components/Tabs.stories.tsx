import type { Meta, StoryObj } from '@storybook/react';
import { BeSegmentControl, BeTabBar, BeTabPill, BeTabCard } from '@beusable-dev/react';

const meta = {
  title: 'Components/Tabs',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AllTypes: Story = {
  name: 'All Types',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div>
        <p style={{ marginBottom: 12, fontSize: 14, color: '#888' }}>Segment Control</p>
        <BeSegmentControl
          items={[
            { label: 'Rank', value: 'rank' },
            { label: 'Journey', value: 'journey' },
            { label: 'Trend', value: 'trend' },
            { label: 'Mine', value: 'mine' },
          ]}
          defaultValue="rank"
        />
      </div>
      <div>
        <p style={{ marginBottom: 12, fontSize: 14, color: '#888' }}>Tab Bar (Underline)</p>
        <BeTabBar
          items={[
            { label: 'Sample', value: 'tab1' },
            { label: 'Sample', value: 'tab2' },
            { label: 'Sample', value: 'tab3' },
          ]}
          defaultValue="tab1"
        />
      </div>
      <div>
        <p style={{ marginBottom: 12, fontSize: 14, color: '#888' }}>Tab Pill (Text)</p>
        <BeTabPill
          items={[
            { label: 'Click', value: 'click' },
            { label: 'Move', value: 'move' },
            { label: 'Scroll', value: 'scroll' },
          ]}
          defaultValue="click"
        />
      </div>
      <div>
        <p style={{ marginBottom: 12, fontSize: 14, color: '#888' }}>Tab Card</p>
        <BeTabCard
          items={[
            { label: 'Ranking', value: 'ranking' },
            { label: 'Journey', value: 'journey' },
            { label: 'Trend', value: 'trend' },
            { label: 'Mine', value: 'mine', color: 'accent' },
          ]}
          defaultValue="ranking"
        />
      </div>
    </div>
  ),
};
