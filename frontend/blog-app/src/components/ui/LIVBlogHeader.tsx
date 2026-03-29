import React from 'react';
import { useTheme, SxProps, Theme } from '@mui/material/styles';
import { Box } from '@mui/material';

interface LIVBlogHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  sx?: SxProps<Theme>;
}

export const LIVBlogHeader: React.FC<LIVBlogHeaderProps> = ({
  title,
  subtitle,
  actions,
  size = 'medium',
  className = '',
  sx
}) => {
  const theme = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          title: 'text-lg font-semibold',
          subtitle: 'text-sm',
          spacing: 'mb-4'
        };
      case 'large':
        return {
          title: 'text-2xl font-semibold',
          subtitle: 'text-base',
          spacing: 'mb-8'
        };
      default:
        return {
          title: 'text-xl font-semibold',
          subtitle: 'text-sm',
          spacing: 'mb-6'
        };
    }
  };

  const styles = getSizeStyles();

  return (
    <Box className={`${styles.spacing} ${className}`} sx={sx}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 
            className={styles.title}
            style={{ 
              color: theme.palette.text.primary,
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: 1.3,
              margin: 0
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              className={`${styles.subtitle} mt-1`}
              style={{ 
                color: theme.palette.text.secondary,
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                margin: 0,
                lineHeight: 1.4
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 ml-4">
            {actions}
          </div>
        )}
      </div>
    </Box>
  );
};

export default LIVBlogHeader;