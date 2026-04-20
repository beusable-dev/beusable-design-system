import type { Meta, StoryObj } from '@storybook/react';
import * as tokens from '@beusable-dev/tokens';

const meta: Meta = {
  title: 'Tokens/Colors',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};
export default meta;

type Story = StoryObj;

// ── helpers ─────────────────────────────────────────────────────────────────

type TokenEntry = { name: string; value: string };

function collectGroup(prefix: string): TokenEntry[] {
  return Object.entries(tokens)
    .filter(([k]) => k.startsWith(prefix) && /\d/.test(k[prefix.length] ?? ''))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([name, value]) => ({ name, value: value as string }));
}

const SCALE_ORDER = ['50', '100', '150', '200', '250', '300', '350', '400', '450', '500', '550', '600', '650', '700', '750', '800', '850', '900', '950'];

function sortByScale(entries: TokenEntry[]): TokenEntry[] {
  return [...entries].sort((a, b) => {
    const numA = a.name.match(/\d+$/)?.[0] ?? '';
    const numB = b.name.match(/\d+$/)?.[0] ?? '';
    return SCALE_ORDER.indexOf(numA) - SCALE_ORDER.indexOf(numB);
  });
}

function isLight(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

// ── sub-components ───────────────────────────────────────────────────────────

function Swatch({ name, value }: TokenEntry) {
  const label = name.replace(/^Color/, '');
  const textColor = isLight(value) ? '#111' : '#fff';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 100 }}>
      <div
        style={{
          background: value,
          borderRadius: 8,
          height: 56,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '4px 6px',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <span style={{ fontSize: 10, color: textColor, fontFamily: 'monospace', lineHeight: 1 }}>
          {value}
        </span>
      </div>
      <span style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>{label}</span>
    </div>
  );
}

function SwatchRow({ title, entries }: { title: string; entries: TokenEntry[] }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#333' }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {entries.map((e) => (
          <Swatch key={e.name} {...e} />
        ))}
      </div>
    </section>
  );
}

// ── stories ──────────────────────────────────────────────────────────────────

export const Brand: Story = {
  render: () => (
    <SwatchRow title="Brand" entries={sortByScale(collectGroup('ColorBrand'))} />
  ),
};

export const Grayscale: Story = {
  render: () => {
    const solid = collectGroup('ColorGrayscale').filter((e) => !e.name.toLowerCase().includes('alpha'));
    const alpha = collectGroup('ColorGrayscale').filter((e) => e.name.toLowerCase().includes('alpha') || e.name.toLowerCase().includes('black') || e.name.toLowerCase().includes('white'));
    return (
      <>
        <SwatchRow title="Grayscale — Solid" entries={sortByScale(solid)} />
        {alpha.length > 0 && <SwatchRow title="Grayscale — Alpha" entries={alpha} />}
      </>
    );
  },
};

const SEMANTIC_GROUPS = [
  'ColorSemanticRed',
  'ColorSemanticYellow',
  'ColorSemanticGreen',
  'ColorSemanticGreenNegative',
  'ColorSemanticBlue',
  'ColorSemanticBlueViolet',
  'ColorSemanticMagenta',
  'ColorSemanticTeal',
  'ColorSemanticOrange',
];

export const Semantic: Story = {
  render: () => (
    <>
      {SEMANTIC_GROUPS.map((prefix) => {
        const entries = sortByScale(collectGroup(prefix));
        if (!entries.length) return null;
        const label = prefix.replace('ColorSemantic', '');
        return <SwatchRow key={prefix} title={`Semantic — ${label}`} entries={entries} />;
      })}
    </>
  ),
};
