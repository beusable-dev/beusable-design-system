import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BeTextField } from '@beusable-dev/react';

const meta = {
  title: 'Components/TextField',
  component: BeTextField,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      description: '입력 필드 높이 크기',
      control: 'radio',
      options: ['s', 'm', 'l'],
      table: { defaultValue: { summary: 'm' } },
    },
    layout: {
      description: '레이블 배치 방향',
      control: 'radio',
      options: ['vertical', 'horizontal'],
      table: { defaultValue: { summary: 'vertical' } },
    },
    theme: {
      description: '테마 (light: 테두리형, dark: 그림자형)',
      control: 'radio',
      options: ['light', 'dark'],
      table: { defaultValue: { summary: 'light' } },
    },
    disabled:     { description: '비활성화 여부', control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    clearable:    { description: '값 초기화(X) 버튼 표시 여부', control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    valid:        { description: '유효 상태 표시 여부', control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    multiline:    { description: '멀티라인(textarea) 모드 여부', control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showCount:    { description: '글자 수 표시 여부 (maxLength 필요)', control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    rows:         { description: 'textarea 기본 행 수 (multiline 전용)', control: 'number', table: { defaultValue: { summary: '4' } } },
    label:        { description: '레이블 텍스트', control: 'text' },
    placeholder:  { description: '플레이스홀더 텍스트', control: 'text' },
    errorMessage: { description: '에러 메시지 (입력 시 에러 상태로 전환)', control: 'text' },
    message:      { description: '보조 안내 메시지', control: 'text' },
    timer:        { description: '타이머 표시 문자열 (예: "4:59")', control: 'text' },
    rightIcon:    { description: '우측 아이콘 (ReactNode)', control: false },
    onClear:      { description: '초기화 버튼 클릭 콜백', control: false },
    onTimerEnd:   { description: '타이머 종료 콜백', control: false },
  },
} satisfies Meta<typeof BeTextField>;
export default meta;
type Story = StoryObj<typeof meta>;

// ── Playground ────────────────────────────────────
export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 300 }}>
        <BeTextField
          {...args}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClear={() => setValue('')}
        />
      </div>
    );
  },
  args: {
    label: 'Label',
    placeholder: 'Text Field',
    clearable: true,
  },
};

// ── States ────────────────────────────────────────
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 300 }}>
      <BeTextField label="Default" defaultValue="Text here" />
      <BeTextField label="Focused" defaultValue="Text here" autoFocus />
      <BeTextField label="Error" defaultValue="Text here" errorMessage="Here is an error message!" />
      <BeTextField label="Valid (Confirm)" defaultValue="Confirm" valid />
      <BeTextField label="Disable" defaultValue="Disabled" disabled />
    </div>
  ),
};

// ── Password ──────────────────────────────────────
export const Password: Story = {
  render: () => {
    const [pw, setPw] = useState('password123');
    const [confirm, setConfirm] = useState('password123');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300 }}>
        <BeTextField
          label="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <BeTextField
          label="Confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          valid={confirm.length > 0 && confirm === pw}
          errorMessage={confirm.length > 0 && confirm !== pw ? 'Passwords do not match' : undefined}
        />
      </div>
    );
  },
};

// ── Clearable ─────────────────────────────────────
export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState('Clear me');
    return (
      <div style={{ width: 300 }}>
        <BeTextField
          label="Label"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClear={() => setValue('')}
          clearable
          placeholder="Type something..."
        />
      </div>
    );
  },
};

// ── Timer (verification code) ─────────────────────
export const Timer: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [expired, setExpired] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 300 }}>
        {/* timerSeconds: 컴포넌트가 자체 카운트다운 */}
        <BeTextField
          label="Additional Item"
          placeholder="Verification Numbers"
          timerSeconds={299}
          onTimerEnd={() => setExpired(true)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          errorMessage={expired ? '인증 시간이 만료되었습니다.' : undefined}
        />
        {/* timer: 외부에서 직접 문자열 전달 */}
        <BeTextField label="Additional Item" timer="4:59" defaultValue="Text here" />
        <BeTextField label="Additional Item" timer="4:59" defaultValue="Text here" errorMessage="Here is an error message!" />
      </div>
    );
  },
};

// ── Textarea ──────────────────────────────────────
export const Textarea: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300 }}>
        <BeTextField
          label="Label"
          multiline
          rows={4}
          placeholder="Place Holder"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={100}
          showCount
        />
        <BeTextField label="Label" multiline rows={3} defaultValue="The overall average device ratio across industries is similar, with Desktop at 49% and Phone at 49.62%." maxLength={100} showCount disabled />
      </div>
    );
  },
};

// ── Dark Theme (Shadow Type) ──────────────────────
export const DarkTheme: Story = {
  render: () => (
    <div style={{ background: '#222', borderRadius: 8, padding: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300 }}>
        <BeTextField theme="dark" label="Default" defaultValue="Text here" />
        <BeTextField theme="dark" label="Place Holder" placeholder="Place Holder" />
        <BeTextField theme="dark" label="Password" type="password" defaultValue="password" />
        <BeTextField theme="dark" label="Focused" defaultValue="Text here" autoFocus />
        <BeTextField theme="dark" label="Error" defaultValue="Text here" errorMessage="Here is an error message!" />
        <BeTextField theme="dark" label="Confirm" defaultValue="Confirm" valid />
        <BeTextField theme="dark" label="Disable" defaultValue="Disabled" disabled />
      </div>
    </div>
  ),
};

// ── Sizes ─────────────────────────────────────────
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300 }}>
      <BeTextField size="l" label="Large" placeholder="Text here" />
      <BeTextField size="m" label="Medium" placeholder="Text here" />
      <BeTextField size="s" label="Small" placeholder="Text here" />
    </div>
  ),
};

// ── No Label ──────────────────────────────────────
export const NoLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300 }}>
      <BeTextField placeholder="Text here" />
      <BeTextField placeholder="Text here" errorMessage="Error message" />
    </div>
  ),
};

// ── Layout Horizontal ─────────────────────────────
export const Horizontal: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 420 }}>
      <BeTextField layout="horizontal" label="Label" placeholder="Text here" />
      <BeTextField layout="horizontal" label="Label" defaultValue="Text here" errorMessage="Error message" />
      <BeTextField layout="horizontal" label="Label" defaultValue="Disabled" disabled />
    </div>
  ),
};
