import type { Preview } from '@storybook/react';
import './reset.css';
import '@beusable/tokens/css';
import '@beusable/react/style.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
