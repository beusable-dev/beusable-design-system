import type { Meta, StoryObj } from '@storybook/react';
import * as tokens from '@beusable-dev/tokens';

const meta: Meta = {
  title: 'Tokens/Radius',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

type Entry = { name: string; value: string };

function collectGroup(prefix: string): Entry[] {
  return Object.entries(tokens)
    .filter(([k]) => k.startsWith(prefix))
    .sort(([a], [b]) => {
      const toNum = (s: string) => parseInt(s.match(/\d+$/)?.[0] ?? '9999', 10);
      return toNum(a) - toNum(b);
    })
    .map(([name, value]) => ({ name, value: value as string }));
}

function RadiusCard({ name, value }: Entry) {
  const label = name.replace(/^Radius/, '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 100, alignItems: 'center' }}>
      <div
        style={{
          width: 64,
          height: 64,
          background: 'var(--color-brand-500, #ec0047)',
          borderRadius: value === '999px' ? '50%' : value,
          opacity: 0.85,
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>{label}</div>
        <div style={{ fontSize: 10, color: '#999', fontFamily: 'monospace' }}>{value}</div>
      </div>
    </div>
  );
}

function RadiusGroup({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#333' }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {entries.map((e) => (
          <RadiusCard key={e.name} {...e} />
        ))}
      </div>
    </section>
  );
}

export const All: Story = {
  render: () => (
    <>
      <RadiusGroup title="Button" entries={collectGroup('RadiusButton')} />
      <RadiusGroup title="Panel" entries={collectGroup('RadiusPanel')} />
      <RadiusGroup title="Graphic" entries={collectGroup('RadiusGraphic')} />
    </>
  ),
};
