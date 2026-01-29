export const colors = {
  // Warm café palette
  primary: '#C4704F',      // Warm terracotta
  secondary: '#8B5A3C',    // Rich brown
  accent: '#E8A87C',       // Soft peach
  background: '#FDF6E3',   // Warm cream
  surface: '#FFFFFF',
  text: '#3D2914',         // Dark brown
  textSecondary: '#6B5344',
  border: '#E5D5C5',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // For TV displays - large, readable text
  tv: {
    title: {
      fontSize: 72,
      fontWeight: '700' as const,
      lineHeight: 84,
    },
    subtitle: {
      fontSize: 48,
      fontWeight: '500' as const,
      lineHeight: 56,
    },
    body: {
      fontSize: 36,
      fontWeight: '400' as const,
      lineHeight: 48,
    },
    caption: {
      fontSize: 24,
      fontWeight: '400' as const,
      lineHeight: 32,
    },
  },
  // For mobile admin
  mobile: {
    title: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
