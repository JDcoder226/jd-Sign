import { Platform } from 'react-native';

const cyberColors = {
  bg:           '#080810',
  bgCard:       '#0d0d1a',
  bgInput:      '#111120',
  bgInputFocus: '#161628',
  border:       '#1c1c30',
  borderActive: '#00e87a',
  borderMuted:  '#252540',

  accent:       '#00e87a',
  accentDim:    '#00e87a18',
  accentPress:  '#00c060',

  purple:       '#8b7cf8',
  purpleDim:    '#8b7cf815',
  amber:        '#f59e0b',
  amberDim:     '#f59e0b15',
  red:          '#ef4444',
  redDim:       '#ef444415',

  text:         '#e8e8f2',
  textSub:      '#8888aa',
  textMuted:    '#44445a',
  white:        '#ffffff',

  pinEmpty:     '#1e1e35',
  pinFilled:    '#00e87a',
  pinError:     '#ef4444',

  numpad:       '#0f0f1e',
  numpadPress:  '#1a1a30',
};

const lightColors = {
  bg:           '#f5f7fb',
  bgCard:       '#ffffff',
  bgInput:      '#eef2f8',
  bgInputFocus: '#e2e8f2',
  border:       '#d8e0ee',
  borderActive: '#00a85a',
  borderMuted:  '#c8d2e2',

  accent:       '#00a85a',
  accentDim:    '#00a85a15',
  accentPress:  '#008a49',

  purple:       '#6558d3',
  purpleDim:    '#6558d315',
  amber:        '#c98300',
  amberDim:     '#c9830015',
  red:          '#d43d3d',
  redDim:       '#d43d3d15',

  text:         '#0e1220',
  textSub:      '#44506a',
  textMuted:    '#7a869d',
  white:        '#ffffff',

  pinEmpty:     '#d4dce8',
  pinFilled:    '#00a85a',
  pinError:     '#d43d3d',

  numpad:       '#eef2f8',
  numpadPress:  '#dfe7f1',
};

export const themes = {
  cyber: { colors: cyberColors },
  light: { colors: lightColors },
};

export const defaultThemeMode = 'cyber';

export const getTheme = (mode = defaultThemeMode) => themes[mode] ?? themes[defaultThemeMode];

export const colors = cyberColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const font = {
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  size: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   18,
    xl:   22,
    xxl:  28,
    hero: 38,
  },
  weight: {
    light:   '300',
    normal:  '400',
    medium:  '500',
    semibold: '600',
    bold:    '700',
  },
};
