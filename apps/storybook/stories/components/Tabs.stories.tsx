import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BeSegmentControl, BeTabBar, BeTabPill, BeTabCard } from '@beusable-dev/react';

const meta = {
  title: 'Components/Tabs',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ─── Segment Control ─────────────────────────────────────────────────────────

export const SegmentControlBasic: Story = {
  name: 'SegmentControl / Basic',
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

export const SegmentControlMiddleSelected: Story = {
  name: 'SegmentControl / Middle Selected',
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

export const SegmentControlControlled: Story = {
  name: 'SegmentControl / Controlled',
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

// ─── Tab Bar (Underline) ─────────────────────────────────────────────────────

export const TabBarBasic: Story = {
  name: 'TabBar / Basic',
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

export const TabBarControlled: Story = {
  name: 'TabBar / Controlled',
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

// ─── Tab Pill ────────────────────────────────────────────────────────────────

export const TabPillTextOnly: Story = {
  name: 'TabPill / Text Only',
  render: () => (
    <BeTabPill
      items={[
        { label: 'Click', value: 'click' },
        { label: 'Move', value: 'move' },
        { label: 'Scroll', value: 'scroll' },
        { label: 'Path', value: 'path' },
      ]}
      defaultValue="click"
    />
  ),
};

export const TabPillDisabled: Story = {
  name: 'TabPill / With Disabled',
  render: () => (
    <BeTabPill
      items={[
        { label: 'Click', value: 'click' },
        { label: 'Move', value: 'move' },
        { label: 'Scroll', value: 'scroll' },
        { label: 'Path', value: 'path', disabled: true },
      ]}
      defaultValue="click"
    />
  ),
};

export const TabPillControlled: Story = {
  name: 'TabPill / Controlled',
  render: () => {
    const [value, setValue] = useState('click');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <BeTabPill
          items={[
            { label: 'Click', value: 'click' },
            { label: 'Move', value: 'move' },
            { label: 'Scroll', value: 'scroll' },
            { label: 'Path', value: 'path' },
          ]}
          value={value}
          onChange={setValue}
        />
        <span style={{ fontSize: 13, color: '#444' }}>Selected: {value}</span>
      </div>
    );
  },
};

// ─── Tab Card ────────────────────────────────────────────────────────────────

export const TabCardBasic: Story = {
  name: 'TabCard / Basic',
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

// ─── All Types Comparison ────────────────────────────────────────────────────

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
