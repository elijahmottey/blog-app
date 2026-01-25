import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom?: {
      chipBg: string;
      chipText: string;
      icon: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      chipBg?: string;
      chipText?: string;
      icon?: string;
    };
  }
}
