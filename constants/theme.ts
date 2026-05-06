/**
 * Rikô Orange Theme
 */

import { Platform } from 'react-native';

const orangePrimary = '#FE6615';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: orangePrimary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: orangePrimary,
    surface: '#F2F2F7',
    muted: '#8E8E93',
    orange: orangePrimary,
    border: 'rgba(0,0,0,0.1)',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: orangePrimary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: orangePrimary,
    surface: '#1C1C1E',
    muted: '#8E8E93',
    orange: orangePrimary,
    border: 'rgba(255,255,255,0.1)',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
