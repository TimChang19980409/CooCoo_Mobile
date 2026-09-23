import type { Meta, StoryObj } from '@storybook/react-native';

import { ThemedText } from './themed-text';

const meta = {
  title: 'Shared/ThemedText',
  component: ThemedText,
  args: {
    children: 'Welcome to Expo',
    type: 'title',
  },
} satisfies Meta<typeof ThemedText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Title: Story = {};
