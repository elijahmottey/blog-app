import React from 'react';
import { useTheme } from '@mui/material/styles';

interface LIVBlogCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
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
        return '';
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none'
        };
      case 'elevated':
        return {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        };
      default:
        return {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
        };
    }
  };

  const baseStyles = getVariantStyles();
  const paddingClass = getPaddingStyles();

  return (
    <div
      className={`rounded-lg transition-all duration-200 ${paddingClass} ${className} ${
        hoverable || onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      style={{
        ...baseStyles,
        ...style,
        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onClick={onClick}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h3
                className="text-lg font-semibold"
                style={{
                  color: theme.palette.text.primary,
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className="text-sm mt-1"
                style={{
                  color: theme.palette.text.secondary,
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
      )}
      <div style={{ color: theme.palette.text.primary }}>
        {children}
      </div>
    </div>
  );
};

export default LIVBlogCard;