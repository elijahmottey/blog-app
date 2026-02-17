import React from 'react';

interface LIVBlogSpacingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  direction?: 'vertical' | 'horizontal' | 'both';
  children?: React.ReactNode;
  className?: string;
}

export const LIVBlogSpacing: React.FC<LIVBlogSpacingProps> = ({
  size = 'md',
  direction = 'vertical',
  children,
  className = ''
}) => {
  const getSpacingClass = () => {
    const spacingMap = {
      xs: '8px',
      sm: '12px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px'
    };

    const spacing = spacingMap[size];

    switch (direction) {
      case 'horizontal':
        return { paddingLeft: spacing, paddingRight: spacing };
      case 'both':
        return { padding: spacing };
      default:
        return { paddingTop: spacing, paddingBottom: spacing };
    }
  };

  if (children) {
    return (
      <div className={className} style={getSpacingClass()}>
        {children}
      </div>
    );
  }

  return <div className={className} style={getSpacingClass()} />;
};

// LIVBlog standard spacing constants
export const LIVBLOG_SPACING = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px'
} as const;

// LIVBlog layout utilities
export const LIVBlogLayout = {
  Container: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  ),
  
  Section: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <section className={`py-6 ${className}`}>
      {children}
    </section>
  ),
  
  Grid: ({ 
    children, 
    cols = 1, 
    gap = 'md', 
    className = '' 
  }: { 
    children: React.ReactNode; 
    cols?: 1 | 2 | 3 | 4 | 6 | 12;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
  }) => {
    const colsClass = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
      12: 'grid-cols-12'
    }[cols];

    const gapClass = {
      xs: 'gap-4',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-10'
    }[gap];

    return (
      <div className={`grid ${colsClass} ${gapClass} ${className}`}>
        {children}
      </div>
    );
  }
};

export default LIVBlogSpacing;