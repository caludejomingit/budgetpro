import '@/global.css';

import { Platform } from 'react-native';

/**
 * Brand palette: warm sage-green + clay + gold, editorial/minimal.
 * Light values match the reference design; dark values are derived and
 * validated for contrast/chroma with the dataviz skill's palette checker.
 */
export const Colors = {
  light: {
    text: '#1C2B22', // ink
    background: '#F6F9F4', // bg
    backgroundElement: '#FFFFFF', // surface
    backgroundSelected: '#EEF4EA', // surface-alt
    textSecondary: '#3E4A41',
    textMuted: '#6E7C73', // muted
    border: '#E1E8DC',
    chartSurface: '#FFFFFF',
    gridline: '#E1E8DC',
    primary: '#1E6B4E',
    primaryDark: '#164F3A',
    primaryLight: '#E4F1E7',
    clay: '#C97452',
    clayLight: '#F7E9E1',
    gold: '#C9A03D',
    danger: '#C4553E',
    success: '#2F9160',
  },
  dark: {
    text: '#EAF4EE',
    background: '#0F1C15',
    backgroundElement: '#16261D',
    backgroundSelected: '#1C2E22',
    textSecondary: '#C7DACD',
    textMuted: '#9FC4AF',
    border: 'rgba(255,255,255,0.10)',
    chartSurface: '#16261D',
    gridline: 'rgba(255,255,255,0.10)',
    primary: '#2F9160',
    primaryDark: '#164F3A',
    primaryLight: 'rgba(47,145,96,0.22)',
    clay: '#E0906D',
    clayLight: 'rgba(224,144,109,0.18)',
    gold: '#D9B04E',
    danger: '#E0806A',
    success: '#4CAE7F',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Chart/data-viz palette — categorical set derived from the brand hues
 * (green/clay/gold) plus complementary companions, validated with the
 * dataviz skill's checker (scripts/validate_palette.js) for CVD separation,
 * lightness band, and chroma floor on both surfaces. Fixed slot order,
 * never cycled/reassigned per-filter.
 */
export const ChartColors = {
  light: {
    accent: '#1E6B4E',
    categorical: ['#0F8A5B', '#2C6FBE', '#C9A03D', '#8B4FB0', '#1B9E9E', '#C97452', '#C2478B', '#3B6FA5'],
    other: '#6E7C73',
    income: '#2F9160',
    expense: '#C4553E',
    status: { good: '#2F9160', warning: '#C9A03D', serious: '#C97452', critical: '#C4553E' },
  },
  dark: {
    accent: '#2F9160',
    categorical: ['#29A874', '#4A7FC0', '#AD8330', '#A873C9', '#2CA8A8', '#CB7A54', '#D25F9C', '#3E7FCC'],
    other: '#9FC4AF',
    income: '#4CAE7F',
    expense: '#E0806A',
    status: { good: '#4CAE7F', warning: '#D9B04E', serious: '#E0906D', critical: '#E0806A' },
  },
} as const;

export const Fonts = {
  sans: 'PublicSans_400Regular',
  sansMedium: 'PublicSans_600SemiBold',
  sansBold: 'PublicSans_700Bold',
  serif: 'Fraunces_600SemiBold',
  serifItalic: 'Fraunces_500Medium_Italic',
  mono: 'IBMPlexMono_400Regular',
  monoBold: 'IBMPlexMono_600SemiBold',
} as const;

export const Radius = {
  lg: 20,
  md: 14,
  sm: 9,
} as const;

export const Shadow = {
  shadowColor: '#1C2B22',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
