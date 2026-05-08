export const colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  border: '#2E2E2E',

  primary: '#FF4D00',
  primaryMuted: 'rgba(255, 77, 0, 0.15)',
  accent: '#FFD700',
  accentMuted: 'rgba(255, 215, 0, 0.15)',

  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  textMuted: '#5E5E5E',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  heartRate: '#FF4D00',
  calories: '#FFD700',
  steps: '#00C4FF',
  distance: '#00D9C4',
  hrv: '#A78BFA',
  vo2: '#34D399',
  protein: '#4CAF50',
  carbs: '#2196F3',
  fat: '#FF9800',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const typography = {
  displayBold: {
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  heading1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  mono: {
    fontFamily: 'Courier',
    fontWeight: '600' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

const theme = { colors, typography, spacing, radii, shadows };
export default theme;
