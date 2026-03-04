import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

interface LIVBlogCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const LIVBlogCard: React.FC<LIVBlogCardProps> = ({
  children,
  title,
  subtitle,
  actions,
  variant = 'default',
  padding = 'medium',
  className = '',
  onClick,
  hoverable = false,
  style
}) => {
  const theme = useTheme();

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: '12px' };
      case 'large':
        return { padding: '32px' };
      case 'xl':
        return { padding: '48px' };
      default:
        return { padding: '24px' };
    }
  };

  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: '12px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none'
        };
      case 'elevated':
        return {
          ...baseStyles,
          backgroundColor: theme.palette.background.paper,
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)'
        };
      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: `${theme.palette.background.paper}95`,
          border: `1px solid ${theme.palette.divider}40`,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)'
        };
    }
  };

  const getHoverStyles = () => {
    if (!hoverable && !onClick) return {};
    
    return {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: variant === 'elevated' 
          ? '0 8px 25px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)'
          : '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
      }
    };
  };

  const cardStyles = {
    ...getVariantStyles(),
    ...getPaddingStyles(),
    ...getHoverStyles(),
    ...style
  };

  return (
    <Box
      className={className}
      sx={cardStyles}
      onClick={onClick}
    >
      {(title || subtitle || actions) && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: title || subtitle ? '20px' : '0',
            gap: '16px'
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <h3
                style={{
                  color: theme.palette.text.primary,
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  color: theme.palette.text.secondary,
                  margin: title ? '4px 0 0 0' : '0',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
              }}
            >
              {actions}
            </div>
          )}
        </div>
      )}
      <div style={{ color: theme.palette.text.primary }}>
        {children}
      </div>
    </Box>
  );
};

export default LIVBlogCard;