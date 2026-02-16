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
      primary: '#16191f',
      secondary: '#5f6b7a',
    },
    background: {
      default: '#f2f3f3',
      paper: '#ffffff',
    },
    divider: '#e9ebed',
  },
  typography: {
    fontFamily: '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#16191f',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: '#16191f',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.4,
      color: '#16191f',
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: 1.4,
      color: '#16191f',
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 700,
      lineHeight: 1.5,
      color: '#16191f',
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 700,
      lineHeight: 1.5,
      color: '#16191f',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#16191f',
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      color: '#5f6b7a',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#5f6b7a',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      color: 'inherit',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          padding: '6px 12px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          minHeight: '32px',
        },
        contained: {
          backgroundColor: palette.primary,
          color: palette['primary-foreground'],
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#1D4ED8',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#d5dbdb',
          color: '#16191f',
          backgroundColor: '#ffffff',
          '&:hover': {
            borderColor: '#879596',
            backgroundColor: '#fafafa',
          },
        },
        sizeSmall: {
          padding: '4px 10px',
          fontSize: '0.8125rem',
          minHeight: '28px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontSize: '0.875rem',
            borderRadius: '2px',
          },
          '& .MuiInputBase-input': {
            color: '#16191f',
            padding: '8px 12px',
          },
          '& .MuiInputLabel-root': {
            color: '#5f6b7a',
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: palette.primary,
            },
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#d5dbdb',
            },
            '&:hover fieldset': {
              borderColor: '#879596',
            },
            '&.Mui-focused fieldset': {
              borderColor: palette.primary,
              borderWidth: '2px',
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
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          border: '1px solid #e9ebed',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          '&.MuiPaper-elevation1': {
            boxShadow: 'none',
          },
          '&.MuiPaper-elevation2': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          border: '1px solid #e9ebed',
          boxShadow: 'none',
          '&:hover': {
            borderColor: '#d5dbdb',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          fontSize: '0.75rem',
          height: '20px',
          fontWeight: 600,
        },
        sizeSmall: {
          height: '18px',
          fontSize: '0.6875rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          '&:hover': {
            backgroundColor: '#f2f3f3',
          },
        },
        sizeSmall: {
          padding: '4px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderBottom: '1px solid #e9ebed',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 700,
          color: '#16191f',
          backgroundColor: '#fafafa',
        },
      },
    },
  },
});