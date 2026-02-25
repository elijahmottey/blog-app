import { createTheme } from '@mui/material/styles';

// Define the AWS-inspired palette
const palette = {
  primary: '#ec7211', // AWS Orange
  'primary-foreground': '#FFFFFF',
  text: '#16191f', // AWS Dark Gray
  background: '#f2f3f3', // AWS Light Gray Background
  border: '#d5dbdb', // AWS Border Gray
  error: '#d13212', // AWS Error Red
  success: '#1d8102', // AWS Success Green
  info: '#0073bb', // AWS Info Blue
  warning: '#ff9900', // AWS Warning Orange
};

export const theme = createTheme({
  palette: {
    primary: {
      main: palette.primary,
      contrastText: palette['primary-foreground'],
    },
    error: {
      main: palette.error,
    },
    success: {
      main: palette.success,
    },
    info: {
      main: palette.info,
    },
    warning: {
      main: palette.warning,
    },
    text: {
      primary: palette.text,
      secondary: '#5f6b7a',
    },
    background: {
      default: palette.background,
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
      color: palette.text,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: palette.text,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.4,
      color: palette.text,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: 1.4,
      color: palette.text,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 700,
      lineHeight: 1.5,
      color: palette.text,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 700,
      lineHeight: 1.5,
      color: palette.text,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: palette.text,
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
          padding: '4px 20px',
          fontSize: '0.875rem',
          fontWeight: 700,
          textTransform: 'none',
          minHeight: '32px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: palette.primary,
          color: palette['primary-foreground'],
          '&:hover': {
            backgroundColor: '#eb5f07',
          },
        },
        outlined: {
          borderColor: palette.border,
          color: palette.text,
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
            backgroundColor: '#ffffff',
          },
          '& .MuiInputBase-input': {
            color: palette.text,
            padding: '8px 12px',
            height: '16px', // Adjust for AWS-like height
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
              borderColor: palette.border,
            },
            '&:hover fieldset': {
              borderColor: '#879596',
            },
            '&.Mui-focused fieldset': {
              borderColor: palette.primary,
              borderWidth: '1px',
              boxShadow: '0 0 0 2px rgba(236, 114, 17, 0.2)',
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#0073bb',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
            color: '#0073bb',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0px', // AWS-like sharp corners
          border: `1px solid ${palette.border}`,
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          '&.MuiPaper-elevation1': {
            boxShadow: '0 1px 1px 0 rgba(0,28,36,.3), 1px 1px 1px 0 rgba(0,28,36,.15), -1px 1px 1px 0 rgba(0,28,36,.15)', // AWS-like shadow
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
          borderRadius: '0px', // AWS-like sharp corners
          border: `1px solid ${palette.border}`,
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
          borderRadius: '16px',
          fontSize: '0.75rem',
          height: '24px',
          fontWeight: 600,
        },
        sizeSmall: {
          height: '20px',
          fontSize: '0.6875rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          padding: '8px',
          '&:hover': {
            backgroundColor: '#f2f3f3',
            color: palette.primary,
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
          borderBottom: `1px solid ${palette.border}`,
          padding: '12px 16px',
        },
        head: {
          fontWeight: 700,
          color: palette.text,
          backgroundColor: '#fafafa',
          borderBottom: `1px solid ${palette.border}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Revert to using theme.palette.background.paper for the AppBar background
          backgroundColor: '#ffffff', // Default paper background
          color: palette.text, // Text color should contrast with light background
          boxShadow: 'none',
          height: '50px', // AWS Console Header Height
          minHeight: '50px',
          borderBottom: `1px solid ${palette.border}`, // Add a subtle border
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '50px !important', // Force height
          paddingLeft: '16px !important',
          paddingRight: '16px !important',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: `1px solid ${palette.border}`,
        },
      },
    },
  },
});