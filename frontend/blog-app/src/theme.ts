import { createTheme } from '@mui/material/styles';

// Define the 3-color palette
const palette = {
  primary: '#2563EB', // A modern blue
  'primary-foreground': '#FFFFFF',
  text: '#1F2937', // A dark, readable gray
  background: '#F9FAFB', // A light, clean gray
  border: '#D1D5DB', // A neutral gray for borders and accents
  error: '#DC2626',
  success: '#16A34A',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: palette.primary,
    },
    error: {
      main: palette.error,
    },
    success: {
      main: palette.success,
    },
    text: {
      primary: palette.text,
      secondary: '#6B7280', // A lighter gray for secondary text
    },
    background: {
      default: palette.background,
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: palette.text,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: palette.text,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: palette.text,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: palette.text,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: palette.text,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: palette.text,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: palette.text,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#6B7280',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
      color: 'inherit',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
        },
        contained: {
          backgroundColor: palette.primary,
          color: palette['primary-foreground'],
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#1D4ED8', // A slightly darker blue for hover
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderColor: palette.border,
          color: palette.text,
          '&:hover': {
            borderColor: palette.primary,
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            color: palette.text,
          },
          '& .MuiInputLabel-root': {
            color: '#6B7280',
            '&.Mui-focused': {
              color: palette.primary,
            },
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: palette.border,
            },
            '&:hover fieldset': {
              borderColor: palette.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: palette.primary,
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: palette.primary,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
  },
});