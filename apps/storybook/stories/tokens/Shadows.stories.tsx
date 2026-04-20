import type { Meta, StoryObj } from '@storybook/react';
import * as tokens from '@beusable-dev/tokens';

const meta: Meta = {
  title: 'Tokens/Shadows',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

type Entry = { name: string; value: string };

function collectGroup(prefix: string): Entry[] {
  return Object.entries(tokens)
    .filter(([k]) => k.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value: value as string }));
}

function ShadowCard({ name, value }: Entry) {
  const label = name.replace(/^Shadow/, '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 160 }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          height: 72,
          boxShadow: value,
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{label}</div>
        <div style={{ fontSize: 10, color: '#999', fontFamily: 'monospace', marginTop: 2, wordBreak: 'break-all' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function ShadowGroup({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#333' }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {entries.map((e) => (
          <ShadowCard key={e.name} {...e} />
        ))}
      </div>
    </section>
  );
}

const GROUPS = [
  { prefix: 'ShadowButton', title: 'Button' },
  { prefix: 'ShadowPanel', title: 'Panel' },
  { prefix: 'ShadowPopup', title: 'Popup' },
  { prefix: 'ShadowTooltip', title: 'Tooltip' },
  { prefix: 'ShadowInner', title: 'Inner' },
  { prefix: 'ShadowBevel', title: 'Bevel' },
];

export const All: Story = {
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 24, borderRadius: 12 }}>
      {GROUPS.map(({ prefix, title }) => {
        const entries = collectGroup(prefix);
        if (!entries.length) return null;
        return <ShadowGroup key={prefix} title={title} entries={entries} />;
      })}
    </div>
  ),
};
