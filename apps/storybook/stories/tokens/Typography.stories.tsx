import type { Meta, StoryObj } from '@storybook/react';
import * as tokens from '@beusable-dev/tokens';

const meta: Meta = {
  title: 'Tokens/Typography',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

type Entry = { name: string; value: string | number };

function collect(prefix: string): Entry[] {
  return Object.entries(tokens)
    .filter(([k]) => k.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([name, value]) => ({ name, value: value as string | number }));
}

export const FontFamily: Story = {
  render: () => (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#333' }}>Font Family</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {collect('FontFamily').map(({ name, value }) => {
          const label = name.replace(/^FontFamily/, '');
          return (
            <div key={name}>
              <div style={{ fontSize: 11, color: '#999', fontFamily: 'monospace', marginBottom: 6 }}>
                {label} · <code>{value}</code>
              </div>
              <div style={{ fontFamily: value as string, fontSize: 28, color: '#222', lineHeight: 1.3 }}>
                Aa Bb Cc — 가나다라마 — 1234567890
              </div>
              <div style={{ fontFamily: value as string, fontSize: 14, color: '#555', marginTop: 4 }}>
                The quick brown fox jumps over the lazy dog.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
};

export const FontSize: Story = {
  render: () => (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#333' }}>Font Size</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {collect('FontSize').map(({ name, value }) => {
          const label = name.replace(/^FontSize/, '');
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontSize: 11, color: '#999', fontFamily: 'monospace', width: 120, flexShrink: 0 }}>
                {label} · {value}
              </span>
              <span style={{ fontSize: value as string, lineHeight: 1, color: '#222' }}>
                Aa — 가나다
              </span>
            </div>
          );
        })}
      </div>
    </div>
  ),
};

export const FontWeight: Story = {
  render: () => (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#333' }}>Font Weight</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {collect('FontWeight').map(({ name, value }) => {
          const label = name.replace(/^FontWeight/, '');
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, color: '#999', fontFamily: 'monospace', width: 120, flexShrink: 0 }}>
                {label} · {value}
              </span>
              <span style={{ fontSize: 24, fontWeight: value as number, color: '#222' }}>
                Aa — 가나다
              </span>
            </div>
          );
        })}
      </div>
    </div>
  ),
};

export const LineHeight: Story = {
  render: () => (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#333' }}>Line Height</h3>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {collect('FontLineHeight').map(({ name, value }) => {
          const label = name.replace(/^FontLineHeight/, '');
          return (
            <div key={name} style={{ width: 160 }}>
              <div style={{ fontSize: 11, color: '#999', fontFamily: 'monospace', marginBottom: 8 }}>
                {label} · {value}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: value as number,
                  color: '#222',
                  background: '#f5f5f5',
                  padding: '8px 10px',
                  borderRadius: 6,
                }}
              >
                디자인 시스템은 일관된 사용자 경험을 만들기 위한 기반입니다.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
};

export const LetterSpacing: Story = {
  render: () => (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#333' }}>Letter Spacing</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {collect('FontLetterSpacing').map(({ name, value }) => {
          const label = name.replace(/^FontLetterSpacing/, '');
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, color: '#999', fontFamily: 'monospace', width: 120, flexShrink: 0 }}>
                {label} · {value}
              </span>
              <span style={{ fontSize: 18, letterSpacing: value as string, color: '#222' }}>
                Beusable — 뷰저블
              </span>
            </div>
          );
        })}
      </div>
    </div>
  ),
};
