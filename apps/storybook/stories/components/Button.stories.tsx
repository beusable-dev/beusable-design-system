import type { Meta, StoryObj } from '@storybook/react';
import { BeButton } from '@beusable-dev/react';

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const iconMap: Record<string, React.ReactNode> = {
  none: undefined,
  check: <CheckIcon />,
  arrow: <ArrowIcon />,
};

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: BeButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      description: '버튼 색상 및 스타일 변형',
      control: 'select',
      options: [
        'primary', 'primary-outline', 'primary-surface', 'primary-ghost',
        'secondary', 'secondary-surface', 'secondary-ghost',
        'action', 'action-surface', 'action-ghost',
        'accent', 'accent-surface', 'accent-ghost',
      ],
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      description: '버튼 높이 크기',
      control: 'radio',
      options: ['xs', 's', 'm', 'l'],
      table: { defaultValue: { summary: 'm' } },
    },
    shape: {
      description: '버튼 모서리 형태',
      control: 'radio',
      options: ['pill', 'rounded'],
      table: { defaultValue: { summary: 'pill' } },
    },
    children: {
      description: '버튼 텍스트',
    },
    loading: {
      description: '로딩 스피너 표시 (클릭 비활성화)',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      description: '비활성화 여부',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      description: '너비 100% 확장',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    leftIcon: {
      description: '버튼 좌측 아이콘',
      control: 'select',
      options: ['none', 'check', 'arrow'],
      mapping: iconMap,
      table: { defaultValue: { summary: 'none' } },
    },
    rightIcon: {
      description: '버튼 우측 아이콘',
      control: 'select',
      options: ['none', 'check', 'arrow'],
      mapping: iconMap,
      table: { defaultValue: { summary: 'none' } },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

// ── Playground ────────────────────────────────────
export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'm',
    shape: 'pill',
    children: 'Confirm',
  },
};

// ── Variants ──────────────────────────────────────
const variantGroups = [
  { label: 'Primary', variants: ['primary', 'primary-outline', 'primary-surface', 'primary-ghost'] },
  { label: 'Secondary', variants: ['secondary', 'secondary-surface', 'secondary-ghost'] },
  { label: 'Action', variants: ['action', 'action-surface', 'action-ghost'] },
  { label: 'Accent', variants: ['accent', 'accent-surface', 'accent-ghost'] },
] as const;

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {variantGroups.map(({ label, variants }) => (
        <div key={label}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 8, fontWeight: 600 }}>{label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {variants.map((v) => (
              <BeButton key={v} variant={v}>{v}</BeButton>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

// ── Shapes ────────────────────────────────────────
export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {(['primary', 'primary-outline', 'secondary', 'action', 'accent'] as const).map((v) => (
        <div key={v} style={{ display: 'flex', gap: 8 }}>
          <BeButton variant={v} shape="pill">Pill</BeButton>
          <BeButton variant={v} shape="rounded">Rounded</BeButton>
        </div>
      ))}
    </div>
  ),
};

// ── Sizes ─────────────────────────────────────────
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <BeButton size="l">Large</BeButton>
      <BeButton size="m">Medium</BeButton>
      <BeButton size="s">Small</BeButton>
      <BeButton size="xs">X Small</BeButton>
    </div>
  ),
};

// ── With Icons ────────────────────────────────────
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <BeButton leftIcon={<CheckIcon />}>Left Icon</BeButton>
      <BeButton rightIcon={<ArrowIcon />}>Right Icon</BeButton>
      <BeButton variant="primary-outline" leftIcon={<CheckIcon />} rightIcon={<ArrowIcon />}>Both Icons</BeButton>
      <BeButton variant="secondary"><CheckIcon /></BeButton>
    </div>
  ),
};

// ── States ────────────────────────────────────────
const allVariants = [
  'primary', 'primary-outline', 'primary-surface', 'primary-ghost',
  'secondary', 'secondary-surface', 'secondary-ghost',
  'action', 'action-surface', 'action-ghost',
  'accent', 'accent-surface', 'accent-ghost',
] as const;

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {allVariants.map((v) => (
        <div key={v} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ width: 148, fontSize: 11, color: '#888' }}>{v}</span>
          <BeButton variant={v}>Default</BeButton>
          <BeButton variant={v} disabled>Disabled</BeButton>
          <BeButton variant={v} loading>Loading</BeButton>
        </div>
      ))}
    </div>
  ),
};

// ── All Sizes × Variants grid ─────────────────────
export const SizeMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['l', 'm', 's', 'xs'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ width: 20, fontSize: 11, color: '#888' }}>{size}</span>
          <BeButton size={size} variant="primary">Confirm</BeButton>
          <BeButton size={size} variant="primary-outline">Confirm</BeButton>
          <BeButton size={size} variant="primary-surface">Confirm</BeButton>
          <BeButton size={size} variant="primary-ghost">Confirm</BeButton>
          <BeButton size={size} variant="secondary">Confirm</BeButton>
          <BeButton size={size} variant="secondary-surface">Confirm</BeButton>
          <BeButton size={size} variant="secondary-ghost">Confirm</BeButton>
          <BeButton size={size} variant="action">Confirm</BeButton>
          <BeButton size={size} variant="action-surface">Confirm</BeButton>
          <BeButton size={size} variant="action-ghost">Confirm</BeButton>
          <BeButton size={size} variant="accent">Confirm</BeButton>
          <BeButton size={size} variant="accent-surface">Confirm</BeButton>
          <BeButton size={size} variant="accent-ghost">Confirm</BeButton>
        </div>
      ))}
    </div>
  ),
};
