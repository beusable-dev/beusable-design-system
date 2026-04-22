import type { Meta, StoryObj } from '@storybook/react';
import { useState, type CSSProperties } from 'react';
import {
  BeDatePicker,
  type DatePickerProps,
  type DatePickerValue,
  type DateRangeValue,
} from '@beusable-dev/react';

const meta = {
  title: 'Components/DatePicker',
  component: BeDatePicker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        height: '1200px',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: '입력형 타입 (a: 달력 아이콘, b: 우측 스핀박스, c: 강조 텍스트)',
      control: 'radio',
      options: ['a', 'b', 'c'],
      table: { defaultValue: { summary: 'a' } },
    },
    mode: {
      description: '선택 동작 (single: 단일 날짜, range: 범위 선택)',
      control: 'radio',
      options: ['single', 'range'],
      table: { defaultValue: { summary: 'range' } },
    },
    months: {
      description: '캘린더 표시 개월 수 (기본: range=2, single=1)',
      control: 'radio',
      options: [1, 2],
    },
    role: {
      description: 'split-picker 역할 (start: 빨간 오른꼬리, end: 파란 왼꼬리)',
      control: 'radio',
      options: ['start', 'end'],
    },
    timezone: {
      description: 'IANA 타임존 (예: Asia/Seoul, America/New_York)',
      control: 'text',
    },
    minDate: { description: '선택 가능한 최소 날짜', control: 'date' },
    maxDate: { description: '선택 가능한 최대 날짜', control: 'date' },
    maxRangeMonths: { description: 'range 모드 최대 개월 수', control: 'number' },
    disabled: { description: '비활성화 여부', control: 'boolean' },
    placeholder: { description: 'single 모드 placeholder', control: 'text' },
    startPlaceholder: { description: 'range 시작 placeholder', control: 'text' },
    endPlaceholder: { description: 'range 종료 placeholder', control: 'text' },
    label: { description: '상단 라벨', control: 'text' },
    message: { description: '도움말 메시지', control: 'text' },
    errorMessage: { description: '에러 메시지', control: 'text' },
    hovered: { description: '스토리북 시각 확인용 hover 상태 강제', control: 'boolean' },
    value: { description: '제어 컴포넌트용 날짜 값. single 모드: `Date | null`, range 모드: `{ startDate: Date | null, endDate: Date | null }`. onChange와 함께 사용하며 외부 state로 직접 관리한다.', control: 'object' },
    defaultValue: { description: '비제어 컴포넌트용 초기 날짜 값. 초기 렌더링에만 반영되며 이후 변경은 컴포넌트 내부 state가 관리한다. 타입 구조는 value와 동일.', control: 'object' },
    disabledDate: { description: '특정 날짜 비활성화 콜백', control: false },
    onChange: { description: 'Apply 시점 값 변경 콜백', control: false },
  },
  args: {
    mode: 'range',
    variant: 'a',
    timezone: 'Asia/Seoul',
    startPlaceholder: 'Start Date',
    endPlaceholder: 'End Date',
  },
} satisfies Meta<typeof BeDatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const comparisonCanvasStyle: CSSProperties = {
  width: '100%',
  minWidth: 1280,
  minHeight: 1160,
  padding: '24px 24px 560px',
  overflow: 'visible',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
};

const specVariantsCanvasStyle: CSSProperties = {
  width: '100%',
  minWidth: 1280,
  minHeight: 1320,
  padding: '24px 24px 600px',
  overflow: 'visible',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
};

export const Playground: Story = {
  render: (args: DatePickerProps) => {
    const [value, setValue] = useState<DatePickerValue>({
      startDate: new Date(2025, 1, 12),
      endDate: new Date(2025, 1, 22),
    });

    return (
      <div style={comparisonCanvasStyle}>
        <BeDatePicker
          {...args}
          value={value}
          onChange={(nextValue: DatePickerValue) => setValue(nextValue)}
        />
      </div>
    );
  },
};

export const SingleMode: Story = {
  render: () => {
    const [value, setValue] = useState<DatePickerValue>(new Date(2025, 1, 15));
    return (
      <div style={{ maxWidth: 420, minHeight: 700, paddingTop: 16 }}>
        <BeDatePicker
          mode="single"
          label="Analysis Date"
          placeholder="Select date"
          value={value}
          onChange={(nextValue: DatePickerValue) => setValue(nextValue)}
        />
      </div>
    );
  },
};

export const RangeMode: Story = {
  render: () => {
    const [value, setValue] = useState<DateRangeValue>({
      startDate: new Date(2025, 1, 12),
      endDate: new Date(2025, 1, 22),
    });

    return (
      <div style={comparisonCanvasStyle}>
        <BeDatePicker
          mode="range"
          label="Analysis Period"
          value={value}
          onChange={(nextValue: DatePickerValue) => setValue(nextValue as DateRangeValue)}
        />
      </div>
    );
  },
};

export const Constraints: Story = {
  render: () => {
    const [value, setValue] = useState<DateRangeValue>({
      startDate: new Date(2025, 1, 10),
      endDate: null,
    });

    return (
      <div style={comparisonCanvasStyle}>
        <BeDatePicker
          mode="range"
          label="Max 6 months"
          timezone="America/New_York"
          value={value}
          minDate={new Date(2025, 1, 1)}
          maxDate={new Date(2025, 7, 31)}
          maxRangeMonths={6}
          disabledDate={(date: Date) => date.getDay() === 0}
          message="Sundays are blocked."
          onChange={(nextValue: DatePickerValue) => setValue(nextValue as DateRangeValue)}
        />
      </div>
    );
  },
};

export const DisabledAndError: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700, minHeight: 760, paddingTop: 16 }}>
      <BeDatePicker
        mode="single"
        label="Disabled"
        placeholder="Select date"
        defaultValue={new Date(2025, 1, 15)}
        disabled
      />
      <BeDatePicker
        mode="range"
        label="Error"
        startPlaceholder="Start Date"
        endPlaceholder="End Date"
        errorMessage="Please select a valid date range."
      />
    </div>
  ),
};

export const SpecVariants: Story = {
  render: () => {
    const variants: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c'];
    return (
      <div style={{ ...specVariantsCanvasStyle, display: 'grid', gridTemplateColumns: '220px repeat(3, 1fr)', gap: 20, alignItems: 'center' }}>
        <div />
        {variants.map((variant) => (
          <h4 key={`head-${variant}`} style={{ margin: 0, textAlign: 'center', color: '#d8325a' }}>
            {variant.toUpperCase()}
          </h4>
        ))}

        <strong>Default</strong>
        {variants.map((variant) => (
          <BeDatePicker
            key={`default-${variant}`}
            mode="range"
            variant={variant}
            value={{ startDate: new Date(2025, 1, 12), endDate: new Date(2025, 1, 22) }}
          />
        ))}

        <strong>Hover</strong>
        {variants.map((variant) => (
          <BeDatePicker
            key={`hover-${variant}`}
            mode="range"
            variant={variant}
            hovered
            value={{ startDate: new Date(2025, 1, 12), endDate: new Date(2025, 1, 22) }}
          />
        ))}

        <strong>Place Holder</strong>
        {variants.map((variant) => (
          <BeDatePicker
            key={`placeholder-${variant}`}
            mode="range"
            variant={variant}
            startPlaceholder="MM/DD/YY"
            endPlaceholder="MM/DD/YY"
            value={{ startDate: null, endDate: null }}
          />
        ))}

        <strong>Place Holder (Hover)</strong>
        {variants.map((variant) => (
          <BeDatePicker
            key={`placeholder-hover-${variant}`}
            mode="range"
            variant={variant}
            hovered
            startPlaceholder="MM/DD/YY"
            endPlaceholder="MM/DD/YY"
            value={{ startDate: null, endDate: null }}
          />
        ))}

        <strong>Disable</strong>
        {variants.map((variant) => (
          <BeDatePicker
            key={`disabled-${variant}`}
            mode="range"
            variant={variant}
            disabled
            value={{ startDate: new Date(2025, 1, 12), endDate: new Date(2025, 1, 22) }}
          />
        ))}
      </div>
    );
  },
};
