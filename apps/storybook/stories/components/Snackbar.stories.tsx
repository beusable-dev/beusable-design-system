import type { Meta, StoryObj } from '@storybook/react';
import { Snackbar } from '@beusable-dev/react';

const meta = {
  title: 'Components/Snackbar',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ─── Small (28px) ─────────────────────────────────────────────────────────────

export const SmallVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Snackbar variant="notice" size="s" message="You can only set the analysis period within 2021." onClose={() => {}} />
      <Snackbar variant="tip"    size="s" message="Choose below Screen, you can see the user's information." onClose={() => {}} />
      <Snackbar variant="alert"  size="s" message="You can only set the analysis period within 2021." onClose={() => {}} />
    </div>
  ),
};

export const SmallWithAction: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Snackbar variant="notice" size="s" message="You can only set the analysis period within 2021." actionLabel="Detail" onAction={() => {}} onClose={() => {}} />
      <Snackbar variant="tip"    size="s" message="You can only set the analysis period within 2021." actionLabel="Detail" onAction={() => {}} onClose={() => {}} />
      <Snackbar variant="alert"  size="s" message="You can only set the analysis period within 2021." actionLabel="Detail" onAction={() => {}} onClose={() => {}} />
    </div>
  ),
};

export const SmallNoRadius: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Snackbar variant="notice" size="s" rounded={false} message="You can only set the analysis period within 2021." onClose={() => {}} />
      <Snackbar variant="tip"    size="s" rounded={false} message="You can only set the analysis period within 2021." onClose={() => {}} />
      <Snackbar variant="alert"  size="s" rounded={false} message="You can only set the analysis period within 2021." onClose={() => {}} />
    </div>
  ),
};

// ─── Medium (34px) ────────────────────────────────────────────────────────────

export const MediumVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Snackbar
        variant="notice"
        size="m"
        message={<>Stream feature has been updated on <span className="snack-accent">September 30, 2025</span>, and data from previous periods cannot be viewed.</>}
        onClose={() => {}}
      />
      <Snackbar
        variant="tip"
        size="m"
        message="Choose below Screen, you can see the user's information on the right side of the screen."
        onClose={() => {}}
      />
      <Snackbar
        variant="alert"
        size="m"
        message={<>Stream feature has been updated on <span className="snack-accent">September 30, 2025</span>, and data from previous periods cannot be viewed.</>}
        onClose={() => {}}
      />
    </div>
  ),
};

export const MediumWithAction: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Snackbar
        variant="notice"
        size="m"
        message={<>Stream feature has been updated on <span className="snack-accent">September 30, 2025</span>, and data from previous periods cannot be viewed.</>}
        actionLabel="Detail"
        onAction={() => {}}
        onClose={() => {}}
      />
      <Snackbar
        variant="tip"
        size="m"
        message="Choose below Screen, you can see the user's information on the right side of the screen."
        actionLabel="Detail"
        onAction={() => {}}
        onClose={() => {}}
      />
      <Snackbar
        variant="alert"
        size="m"
        message={<>Stream feature has been updated on <span className="snack-accent">September 30, 2025</span>, and data from previous periods cannot be viewed.</>}
        actionLabel="Detail"
        onAction={() => {}}
        onClose={() => {}}
      />
    </div>
  ),
};

export const MediumNoRadius: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Snackbar
        variant="notice"
        size="m"
        rounded={false}
        message={<>Stream feature has been updated on <span className="snack-accent">September 30, 2025</span>, and data from previous periods cannot be viewed.</>}
        actionLabel="Detail"
        onAction={() => {}}
        onClose={() => {}}
      />
    </div>
  ),
};
