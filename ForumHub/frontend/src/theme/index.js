import { createTheme } from '@mui/material/styles';

// Common theme settings
const commonThemeSettings = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...commonThemeSettings,
  palette: {
    mode: 'light',
    primary: {
      main: '#0d6efd',
      light: '#4d94ff',
      dark: '#0047cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6c757d',
      light: '#9aa0a5',
      dark: '#40464d',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc3545',
      light: '#e35d6a',
      dark: '#9a1c28',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffc107',
      light: '#ffcd38',
      dark: '#b28704',
      contrastText: '#000000',
    },
    success: {
      main: '#198754',
      light: '#27c17d',
      dark: '#0f5c38',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0dcaf0',
      light: '#3dd5f3',
      dark: '#098da8',
      contrastText: '#000000',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      disabled: '#adb5bd',
    },
    divider: '#dee2e6',
    action: {
      active: '#6c757d',
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...commonThemeSettings,
  palette: {
    mode: 'dark',
    primary: {
      main: '#0d6efd',
      light: '#4d94ff',
      dark: '#0047cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6c757d',
      light: '#9aa0a5',
      dark: '#40464d',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc3545',
      light: '#e35d6a',
      dark: '#9a1c28',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffd700',
      light: '#ffe033',
      dark: '#b29700',
      contrastText: '#000000',
    },
    success: {
      main: '#40c057',
      light: '#69d07a',
      dark: '#2c863c',
      contrastText: '#ffffff',
    },
    info: {
      main: '#4dabf7',
      light: '#74bff8',
      dark: '#3577ac',
      contrastText: '#000000',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2b2b2b',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      disabled: '#666666',
    },
    divider: '#404040',
    action: {
      active: '#ffffff',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
}); 