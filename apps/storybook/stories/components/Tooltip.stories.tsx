import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BeTooltip } from '@beusable-dev/react';

const meta = {
  title: 'Components/Tooltip',
  component: BeTooltip,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof BeTooltip>;

export default meta;
type Story = StoryObj;

// ─── Type A — text only ───────────────────────────────────────────────────────

export const TypeA: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <BeTooltip content="Choose below Screen, you can see the user's information on the right side of the screen." />
      <BeTooltip
        content="Stream feature has been updated on September 30, 2025, and data from previous periods cannot be viewed."
        maxWidth={360}
      />
    </div>
  ),
};

// ─── Type B — with close button ───────────────────────────────────────────────

export const TypeBClose: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <BeTooltip
        content="Choose below Screen, you can see the user's information on the right side of the screen."
        onClose={() => {}}
      />
      <BeTooltip
        content="Stream feature has been updated on September 30, 2025, and data from previous periods cannot be viewed."
        onClose={() => {}}
        maxWidth={360}
      />
    </div>
  ),
};

// ─── Type B — with action button ─────────────────────────────────────────────

export const TypeBAction: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <BeTooltip
        content="Choose below Screen, you can see the user's information on the right side of the screen."
        actionLabel="Detail"
        onAction={() => {}}
      />
      <BeTooltip
        content="Stream feature has been updated on September 30, 2025, and data from previous periods cannot be viewed."
        actionLabel="Detail"
        onAction={() => {}}
        maxWidth={360}
      />
    </div>
  ),
};

// ─── Text alignment ───────────────────────────────────────────────────────────

const ArrowRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="#aaaaaa" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 13,
  lineHeight: 1,
};

const labelStyle: React.CSSProperties = { color: '#666', width: 100, flexShrink: 0 };
const valueStyle: React.CSSProperties = { color: '#444', textAlign: 'right', width: 50, flexShrink: 0 };
const valueNarrowStyle: React.CSSProperties = { ...valueStyle, width: 45 };
const dividerStyle: React.CSSProperties = { height: 1, background: '#ebebeb', flexShrink: 0 };

const KeyValueContent = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    <div style={rowStyle}>
      <span style={labelStyle}>Clicks per PV</span>
      <span style={valueStyle}>4</span>
    </div>
    <div style={rowStyle}>
      <span style={labelStyle}>Click PV Rate</span>
      <span style={valueStyle}>6.2%</span>
    </div>
    <div style={dividerStyle} />
    <div style={rowStyle}>
      <span style={labelStyle}>Clicks per PV</span>
      <span style={valueStyle}>4</span>
    </div>
    <div style={rowStyle}>
      <span style={labelStyle}>Click PV Rate</span>
      <span style={valueStyle}>6.2%</span>
    </div>
    <div style={dividerStyle} />
    <div style={rowStyle}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 13, lineHeight: 1 }}>
        hover <ArrowRightIcon /> click rate
      </span>
      <span style={valueNarrowStyle}>17.6%</span>
    </div>
    <div style={rowStyle}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 13, lineHeight: 1 }}>
        hover <ArrowRightIcon /> click time
      </span>
      <span style={valueNarrowStyle}>0.4s</span>
    </div>
  </div>
);

export const TextAlignment: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Align left</p>
        <BeTooltip
          content="Korean, English, and Japanese are supported, and other languages are automatically applied in English."
          maxWidth={240}
        />
        <BeTooltip
          content="Inflow path patterning will be applied from May 1, 2026 (KST)."
          linkLabel="Read more about updates"
          linkHref="https://example.com"
          maxWidth={240}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Align Center</p>
        <BeTooltip
          content="Korean, English, and Japanese are supported, and other languages are automatically applied in English."
          textAlign="center"
          maxWidth={240}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Align Justify</p>
        <BeTooltip content={<KeyValueContent />} maxWidth={220} style={{ padding: 17 }} />
      </div>
    </div>
  ),
};

// ─── Arrow variants ──────────────────────────────────────────────────────────

export const ArrowBottom: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 16 }}>
      <BeTooltip arrow="bottom-left"   content="bottom-left arrow" />
      <BeTooltip arrow="bottom-center" content="bottom-center arrow" />
      <BeTooltip arrow="bottom-right"  content="bottom-right arrow" />
    </div>
  ),
};

export const ArrowTop: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 16 }}>
      <BeTooltip arrow="top-left"   content="top-left arrow" />
      <BeTooltip arrow="top-center" content="top-center arrow" />
      <BeTooltip arrow="top-right"  content="top-right arrow" />
    </div>
  ),
};

export const ArrowSide: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: '16px 16px' }}>
      <BeTooltip arrow="left"  content="left arrow — tooltip is to the right of the target" />
      <BeTooltip arrow="right" content="right arrow — tooltip is to the left of the target" />
    </div>
  ),
};

// ─── Type C — with link ───────────────────────────────────────────────────────

export const TypeCLink: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <BeTooltip
        content="Inflow path patterning will be applied from May 1, 2026 (KST)."
        linkLabel="Read more about updates"
        linkHref="https://example.com"
      />
      <BeTooltip
        content="Inflow path patterning will be applied from May 1, 2026 (KST)."
        linkLabel="Read more about updates"
        linkHref="https://example.com"
        arrow="bottom-center"
      />
    </div>
  ),
};

// ─── Type B — close + action button ──────────────────────────────────────────

export const TypeBCloseAndAction: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <BeTooltip
        content="Choose below Screen, you can see the user's information on the right side of the screen."
        onClose={() => {}}
        actionLabel="Detail"
        onAction={() => {}}
      />
      <BeTooltip
        content="Stream feature has been updated on September 30, 2025, and data from previous periods cannot be viewed."
        onClose={() => {}}
        actionLabel="Detail"
        onAction={() => {}}
        maxWidth={360}
      />
    </div>
  ),
};

// ─── Combined — arrow + close ─────────────────────────────────────────────────

export const ArrowWithClose: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 16 }}>
      <BeTooltip
        arrow="bottom-left"
        content="Stream feature has been updated on September 30, 2025, and data from previous periods cannot be viewed."
        onClose={() => {}}
      />
      <BeTooltip
        arrow="bottom-left"
        content="Choose below Screen, you can see the user's information."
        actionLabel="Detail"
        onAction={() => {}}
      />
    </div>
  ),
};
