import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BeDropdown } from '@beusable-dev/react';

const meta = {
  title: 'Components/Dropdown',
  component: BeDropdown,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: '드롭다운 높이 크기',
      control: 'radio',
      options: ['s', 'm', 'l'],
      table: { defaultValue: { summary: 'm' } },
    },
    variant: {
      description: '스타일 변형 (border: 테두리형, shadow: 그림자형)',
      control: 'radio',
      options: ['border', 'shadow'],
      table: { defaultValue: { summary: 'border' } },
    },
    layout: {
      description: '레이블 배치 방향',
      control: 'radio',
      options: ['vertical', 'horizontal'],
      table: { defaultValue: { summary: 'vertical' } },
    },
    placeholder:  { description: '선택 전 표시 텍스트', control: 'text', table: { defaultValue: { summary: 'Select' } } },
    disabled:     { description: '비활성화 여부', control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    multiple:     { description: '다중 선택 여부', control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    searchable:   { description: '검색 가능 여부 (열리면 입력 필드로 전환)', control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    label:        { description: '레이블 텍스트', control: 'text' },
    errorMessage: { description: '에러 메시지 (입력 시 에러 상태로 전환)', control: 'text' },
    message:      { description: '보조 안내 메시지', control: 'text' },
    onChange:     { description: '선택 값 변경 콜백', control: false },
    options:      { description: '선택 항목 목록 ({ value, label }[])', control: false },
  },
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4' },
      { value: 'option5', label: 'Option 5' },
      { value: 'option6', label: 'Option 6' },
      { value: 'option7', label: 'Option 7' },
      { value: 'option8', label: 'Option 8' },
    ],
    placeholder: 'Select',
    size: 'm',
    variant: 'border',
  },
} satisfies Meta<typeof BeDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ──────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: { label: 'Label', placeholder: 'Select' },
  parameters: {
    docs: { story: { height: '320px' } },
  },
};

// ─── States ──────────────────────────────────────────────────────────────────

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
      <BeDropdown {...args} label="Default" placeholder="Select" />
      <BeDropdown {...args} label="With value" defaultValue="option1" />
      <BeDropdown {...args} label="Error" errorMessage="Here is an error message!" />
      <BeDropdown {...args} label="Disabled" defaultValue="option2" disabled />
      <BeDropdown {...args} label="Help message" message="Here is a help message." />
    </div>
  ),
};

// ─── Sizes ───────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
      <BeDropdown {...args} label="Small (s)" size="s" placeholder="Select" />
      <BeDropdown {...args} label="Medium (m)" size="m" placeholder="Select" />
      <BeDropdown {...args} label="Large (l)" size="l" placeholder="Select" />
    </div>
  ),
};

// ─── Searchable ───────────────────────────────────────────────────────────────

export const Searchable: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select Country',
    searchable: true,
    options: [
      { value: 'kr', label: 'Korea' },
      { value: 'jp', label: 'Japan' },
      { value: 'it', label: 'Italy' },
      { value: 'br', label: 'Brazil' },
      { value: 'us', label: 'United States' },
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
    ],
  },
  parameters: {
    docs: { story: { height: '320px' } },
  },
};

// ─── Multiple ─────────────────────────────────────────────────────────────────

export const Multiple: Story = {
  args: {
    label: 'Options',
    placeholder: 'Select options',
    multiple: true,
  },
};

// ─── Controlled ──────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('option1');
    return (
      <div style={{ maxWidth: 320 }}>
        <BeDropdown
          {...args}
          label="Controlled"
          value={value}
          onChange={(v) => setValue(v as string)}
        />
        <p style={{ marginTop: 8, fontSize: 13, color: '#777' }}>
          Selected: <strong>{value || '—'}</strong>
        </p>
      </div>
    );
  },
};

// ─── Horizontal ──────────────────────────────────────────────────────────────

export const Horizontal: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <BeDropdown {...args} label="Label" layout="horizontal" placeholder="Select" />
      <BeDropdown {...args} label="Label" layout="horizontal" defaultValue="option1" />
      <BeDropdown {...args} label="Label" layout="horizontal" disabled />
    </div>
  ),
};

// ─── Shadow ───────────────────────────────────────────────────────────────────

export const Shadow: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
      <BeDropdown {...args} variant="shadow" label="Default" placeholder="Select" />
      <BeDropdown {...args} variant="shadow" label="With value" defaultValue="option1" />
      <BeDropdown {...args} variant="shadow" label="Disabled" defaultValue="option2" disabled />
      <BeDropdown {...args} variant="shadow" label="Label" layout="horizontal" placeholder="Select" />
    </div>
  ),
  parameters: {
    docs: { story: { height: '320px' } },
  },
};

// ─── No Label ────────────────────────────────────────────────────────────────

export const NoLabel: Story = {
  args: { placeholder: 'All' },
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: 500 }}>
      <BeDropdown {...args} size="s" style={{ width: 160 }} />
      <BeDropdown {...args} size="m" style={{ width: 200 }} />
      <BeDropdown {...args} size="l" style={{ width: 240 }} />
    </div>
  ),
};
